import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import analyzeHandler from "./api/analyze.js";
import mcpHandler from "./api/mcp/index.js";
import healthHandler from "./api/health.js";
import tvAuthHandler from "./api/auth/tradingview.js";
import tvCallbackHandler from "./api/auth/tradingview/callback.js";
import tvStatusHandler from "./api/auth/tradingview/status.js";
import tvDisconnectHandler from "./api/auth/tradingview/disconnect.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // In preview environment, default to built-in MCP server if not explicitly set
  if (process.env.MCP_SERVERS === undefined) {
    process.env.MCP_SERVERS = `http://localhost:${PORT}/api/mcp`;
  }

  app.use(express.json({ limit: "10mb" }));

  // Institutional API Endpoints
  app.post("/api/analyze", analyzeHandler);
  app.all(["/api/mcp", "/api/mcp/*"], mcpHandler);

  // TradingView OAuth 2.1 Handshake Engine
  app.get("/api/auth/tradingview", tvAuthHandler);
  app.get("/api/auth/tradingview/callback", tvCallbackHandler);
  app.get("/api/auth/tradingview/status", tvStatusHandler);
  app.all("/api/auth/tradingview/disconnect", tvDisconnectHandler);

  // Status / Health check endpoint
  app.all("/api/health", healthHandler);

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Alpha Terminal] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Alpha Terminal server:", err);
  process.exit(1);
});
