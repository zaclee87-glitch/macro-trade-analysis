import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Detect any configured Gemini key variants
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "";

  const cleanKey = rawKey.trim().replace(/^["']|["']$/g, "");
  const hasKey = Boolean(cleanKey && cleanKey.length > 5);

  const matchedVar = process.env.GEMINI_API_KEY
    ? "GEMINI_API_KEY"
    : process.env.GOOGLE_API_KEY
    ? "GOOGLE_API_KEY"
    : process.env.VITE_GEMINI_API_KEY
    ? "VITE_GEMINI_API_KEY"
    : process.env.GOOGLE_GENAI_API_KEY
    ? "GOOGLE_GENAI_API_KEY"
    : "none";

  // List all environment variable names that look like keys or google tokens (names only, no values)
  const envKeysFound = Object.keys(process.env).filter(
    (k) =>
      k.toUpperCase().includes("GEMINI") ||
      k.toUpperCase().includes("GOOGLE") ||
      k.toUpperCase().includes("KEY") ||
      k.toUpperCase().includes("MCP")
  );

  return res.status(200).json({
    status: "online",
    service: "Alpha Terminal Backend (Vercel Serverless Ready)",
    gemini_key_present: hasKey,
    detected_variable: matchedVar,
    key_length: cleanKey ? cleanKey.length : 0,
    key_prefix: cleanKey ? cleanKey.slice(0, 4) + "..." : "none",
    detected_related_env_keys: envKeysFound,
    mcp_servers: [process.env.MCP_SERVERS || "/api/mcp"],
    instructions: hasKey
      ? "API key is active and ready."
      : "To configure in Vercel: Project Settings -> Environment Variables -> Add GEMINI_API_KEY (select Production, Preview, Development) -> Redeploy latest deployment."
  });
}
