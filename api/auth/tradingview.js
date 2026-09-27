import crypto from "crypto";

function base64URLEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(crypto.createHash("sha256").update(verifier).digest());
}

export default async function handler(req, res) {
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
    const redirectUri = `${proto}://${host}/api/auth/tradingview/callback`;

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = base64URLEncode(crypto.randomBytes(16));

    const isSecure = proto === "https";
    const cookieFlags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isSecure ? "; Secure" : ""}`;

    res.setHeader("Set-Cookie", [
      `tv_code_verifier=${codeVerifier}; ${cookieFlags}`,
      `tv_oauth_state=${state}; ${cookieFlags}`
    ]);

    const authUrl = `https://mcp.tradingview.com/oauth/authorize?response_type=code&client_id=alpha-terminal&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=mcp:read%20mcp:tools&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

    if (req.query?.json === "true" || req.headers.accept?.includes("application/json")) {
      return res.status(200).json({
        authUrl,
        redirectUri,
        state
      });
    }

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err) {
    console.error("[TradingView OAuth] Init error:", err);
    res.status(500).json({ error: "Failed to initiate TradingView OAuth flow", details: err.message });
  }
}
