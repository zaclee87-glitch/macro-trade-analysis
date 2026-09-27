function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim();
    if (name) cookies[name] = decodeURIComponent(value);
  });
  return cookies;
}

export default async function handler(req, res) {
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
    const redirectUri = `${proto}://${host}/api/auth/tradingview/callback`;
    const isSecure = proto === "https";

    const query = req.query || {};
    const code = query.code;
    const state = query.state;
    const error = query.error;

    if (error) {
      console.warn("[TradingView OAuth] Callback received error from TradingView:", error);
      res.writeHead(302, { Location: `/?tv_connected=false&tv_error=${encodeURIComponent(error)}` });
      return res.end();
    }

    if (!code) {
      res.writeHead(302, { Location: `/?tv_connected=false&tv_error=missing_authorization_code` });
      return res.end();
    }

    const cookies = parseCookies(req.headers.cookie);
    const codeVerifier = cookies.tv_code_verifier;
    const storedState = cookies.tv_oauth_state;

    if (storedState && state && storedState !== state) {
      console.warn("[TradingView OAuth] State mismatch!");
      res.writeHead(302, { Location: `/?tv_connected=false&tv_error=state_mismatch` });
      return res.end();
    }

    // Exchange authorization code for access token with TradingView OAuth token endpoint
    let tokenData = null;
    try {
      const tokenResponse = await fetch("https://mcp.tradingview.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: String(code),
          client_id: "alpha-terminal",
          redirect_uri: redirectUri,
          code_verifier: codeVerifier || ""
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (tokenResponse.ok) {
        tokenData = await tokenResponse.json();
      } else {
        const errorText = await tokenResponse.text();
        console.warn("[TradingView OAuth] Token exchange non-200:", tokenResponse.status, errorText);
      }
    } catch (fetchErr) {
      console.warn("[TradingView OAuth] Token exchange network error:", fetchErr.message);
    }

    const setCookies = [
      `tv_code_verifier=; Path=/; HttpOnly; Max-Age=0`,
      `tv_oauth_state=; Path=/; HttpOnly; Max-Age=0`
    ];

    if (tokenData && tokenData.access_token) {
      const maxAge = tokenData.expires_in || 2592000; // 30 days
      const authCookieFlags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;
      const pubCookieFlags = `Path=/; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;

      setCookies.push(`tv_mcp_token=${tokenData.access_token}; ${authCookieFlags}`);
      setCookies.push(`tv_connected=true; ${pubCookieFlags}`);

      if (tokenData.refresh_token) {
        setCookies.push(`tv_mcp_refresh=${tokenData.refresh_token}; ${authCookieFlags}`);
      }

      res.setHeader("Set-Cookie", setCookies);
      res.writeHead(302, { Location: "/?tv_connected=true" });
      return res.end();
    }

    // Fallback: If TradingView OAuth server is in sandbox/mock stage or rejected client_id,
    // record connection attempt info so user can paste manual token or use live scrapers
    res.setHeader("Set-Cookie", setCookies);
    res.writeHead(302, {
      Location: `/?tv_connected=false&tv_error=${encodeURIComponent(
        "TradingView token exchange could not be verified with remote endpoint. Please use manual token entry or live data failover engine."
      )}`
    });
    res.end();
  } catch (err) {
    console.error("[TradingView OAuth] Callback fatal error:", err);
    res.writeHead(302, { Location: `/?tv_connected=false&tv_error=${encodeURIComponent(err.message)}` });
    res.end();
  }
}
