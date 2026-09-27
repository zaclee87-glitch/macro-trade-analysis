export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  const isSecure = proto === "https";

  const clearCookieFlags = `Path=/; Max-Age=0${isSecure ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", [
    `tv_mcp_token=; ${clearCookieFlags}; HttpOnly`,
    `tv_mcp_refresh=; ${clearCookieFlags}; HttpOnly`,
    `tv_connected=; ${clearCookieFlags}`
  ]);

  if (req.headers.accept?.includes("application/json") || req.method === "POST") {
    return res.status(200).json({ success: true, connected: false });
  }

  res.writeHead(302, { Location: "/?tv_connected=false" });
  res.end();
}
