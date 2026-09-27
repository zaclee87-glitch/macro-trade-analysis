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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-tv-token");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const cookies = parseCookies(req.headers.cookie);
  const headerToken = req.headers["x-tv-token"] || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : "");
  const token = cookies.tv_mcp_token || headerToken || "";

  const isConnected = Boolean(token && token.length > 5);

  return res.status(200).json({
    connected: isConnected,
    tokenPrefix: isConnected ? token.slice(0, 6) + "..." : null,
    source: cookies.tv_mcp_token ? "cookie" : headerToken ? "header" : "none"
  });
}
