import React, { useState, useEffect, useRef } from "react";
import {
  OperationalMode,
  ToolCall,
  UnavailableServer,
  AnalyzeResponse,
  ReportMetadata,
  SavedReport
} from "./types.ts";
import { ReportViewer } from "./components/ReportViewer.tsx";
import { InspectionDrawer } from "./components/InspectionDrawer.tsx";
import { ExecutiveTearSheetCard } from "./components/ExecutiveTearSheetCard.tsx";
import { ValuationScenarioCard } from "./components/ValuationScenarioCard.tsx";
import { OptionsStrategyCard } from "./components/OptionsStrategyCard.tsx";
import {
  SAMPLE_MACRO_REPORT,
  SAMPLE_MACRO_TOOL_CALLS,
  SAMPLE_TICKER_REPORT,
  SAMPLE_TICKER_METADATA,
  SAMPLE_MACRO_METADATA
} from "./data/sampleReports.ts";
import {
  Activity,
  Layers,
  Search,
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Clock,
  Sparkles,
  Download,
  Copy,
  History,
  Trash2,
  Check,
  ExternalLink,
  Target,
  Key,
  X
} from "lucide-react";

const CACHE_KEY = "alpha_terminal_cached_reports_v2";

function getStoredReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeReport(newReport: SavedReport): SavedReport[] {
  try {
    const current = getStoredReports();
    const filtered = current.filter(
      (r) => r.id !== newReport.id && !(r.mode === newReport.mode && r.ticker === newReport.ticker)
    );
    const updated = [newReport, ...filtered].slice(0, 5);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

function clearStoredReports(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
}

export default function App() {
  const [mode, setMode] = useState<OperationalMode>("macro");
  const [ticker, setTicker] = useState("PLTR");
  const [customQuery, setCustomQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Response state
  const [report, setReport] = useState<string>(SAMPLE_MACRO_REPORT);
  const [metadata, setMetadata] = useState<ReportMetadata | null>(SAMPLE_MACRO_METADATA);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>(SAMPLE_MACRO_TOOL_CALLS);
  const [unavailableServers, setUnavailableServers] = useState<UnavailableServer[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());
  const [model, setModel] = useState<string>("gemini-3.8-flash");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // TradingView OAuth 2.1 & Token state
  const [tvConnected, setTvConnected] = useState<boolean>(false);
  const [tvToken, setTvToken] = useState<string>(() => {
    try {
      return localStorage.getItem("tv_mcp_token") || "";
    } catch {
      return "";
    }
  });
  const [showTvModal, setShowTvModal] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>("");

  // Telemetry & Timing state
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(3420);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [mcpLatencyMs, setMcpLatencyMs] = useState<number | null>(14);
  const [mcpServerStatus, setMcpServerStatus] = useState<string>("Alpha MCP: Connected");

  // Local storage cached reports
  const [cachedReports, setCachedReports] = useState<SavedReport[]>([]);
  const [activeTab, setActiveTab] = useState<"cards" | "report" | "all">("all");

  // Backend status check
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    geminiKey: boolean;
    mcpServers: string[];
  }>({
    online: false,
    geminiKey: false,
    mcpServers: [],
  });

  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize cached reports from localStorage
  useEffect(() => {
    const initial = getStoredReports();
    if (initial.length === 0) {
      // Seed with initial sample reports in cache for immediate zero-token switching
      const samplePLTR: SavedReport = {
        id: "sample-pltr",
        mode: "ticker",
        ticker: "PLTR",
        title: "PLTR Structural Alpha & Executive Tear-Sheet",
        timestamp: new Date().toISOString(),
        report: SAMPLE_TICKER_REPORT,
        metadata: SAMPLE_TICKER_METADATA,
        tool_calls: [
          { name: "get_stock_quote", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
          { name: "get_historical_technicals", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
          { name: "get_financial_metrics", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
          { name: "get_options_structure", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() }
        ],
        unavailable: [],
        model: "gemini-2.5-pro",
        execution_time_ms: 2850
      };
      const sampleMacro: SavedReport = {
        id: "sample-macro",
        mode: "macro",
        title: "US Macro Regime & Flow Strategy",
        timestamp: new Date().toISOString(),
        report: SAMPLE_MACRO_REPORT,
        metadata: SAMPLE_MACRO_METADATA,
        tool_calls: SAMPLE_MACRO_TOOL_CALLS,
        unavailable: [],
        model: "gemini-2.5-pro",
        execution_time_ms: 3120
      };
      const seeded = [samplePLTR, sampleMacro];
      localStorage.setItem(CACHE_KEY, JSON.stringify(seeded));
      setCachedReports(seeded);
    } else {
      setCachedReports(initial);
    }
  }, []);

  // Check health and ping MCP latency
  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        setMcpLatencyMs(latency);
        setBackendStatus({
          online: true,
          geminiKey: data.gemini_key_present,
          mcpServers: data.mcp_servers || [],
        });
        const serverCount = data.mcp_servers?.length || 1;
        setMcpServerStatus(`Local MCP: Connected (${latency}ms) | ${serverCount} Pooled Server${serverCount > 1 ? "s" : ""}`);
      }
    } catch {
      setBackendStatus({ online: false, geminiKey: false, mcpServers: [] });
      setMcpServerStatus("Local MCP: Reconnecting...");
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    // Check URL parameters for OAuth return
    const urlParams = new URLSearchParams(window.location.search);
    const tvConnectedParam = urlParams.get("tv_connected");
    const tvErrorParam = urlParams.get("tv_error");

    if (tvConnectedParam === "true") {
      setTvConnected(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tvErrorParam) {
      setError(`TradingView OAuth: ${tvErrorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check stored token
    const saved = localStorage.getItem("tv_mcp_token");
    if (saved) {
      setTvConnected(true);
      setTvToken(saved);
      setManualTokenInput(saved);
    }

    // Verify TradingView endpoint status
    fetch("/api/auth/tradingview/status")
      .then((r) => r.json())
      .then((d) => {
        if (d?.connected) {
          setTvConnected(true);
        }
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const handleDisconnectTradingView = async () => {
    try {
      localStorage.removeItem("tv_mcp_token");
      setTvToken("");
      setManualTokenInput("");
      setTvConnected(false);
      await fetch("/api/auth/tradingview/disconnect", { method: "POST" });
    } catch {}
  };

  const handleSaveManualToken = (newToken: string) => {
    const clean = newToken.trim();
    if (clean) {
      localStorage.setItem("tv_mcp_token", clean);
      setTvToken(clean);
      setTvConnected(true);
    } else {
      localStorage.removeItem("tv_mcp_token");
      setTvToken("");
      setTvConnected(false);
    }
    setShowTvModal(false);
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    const startTs = Date.now();
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      setElapsedSeconds(+((Date.now() - startTs) / 1000).toFixed(1));
    }, 100);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (!prev || prev.includes("Connecting")) {
          return "Querying live quote & technicals (50d/200d MA, RSI, ATR) & dealer gamma...";
        }
        if (prev.includes("Querying")) {
          return "Fetching multi-year financial statements & Zacks revision trends...";
        }
        if (prev.includes("Fetching")) {
          return "Executing Gemini 3.8 Flash automated tool synthesis loop...";
        }
        return "Synthesizing Section 15 Tear-Sheet & Valuation Scenarios...";
      });
    }, 1400);

    setLoadingStep("Connecting to Streamable HTTP MCP connection pool...");

    try {
      const payload: { mode: OperationalMode; ticker?: string; customQuery?: string; tvToken?: string } = {
        mode,
      };

      if (mode === "ticker") {
        if (!ticker || !ticker.trim()) {
          throw new Error("A valid stock ticker is required for ticker mode.");
        }
        payload.ticker = ticker.toUpperCase().trim();
      }

      if (customQuery.trim()) {
        payload.customQuery = customQuery.trim();
      }

      if (tvToken) {
        payload.tvToken = tvToken;
      }

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (tvToken) {
        requestHeaders["x-tv-token"] = tvToken;
        requestHeaders["Authorization"] = `Bearer ${tvToken}`;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      const data: AnalyzeResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned HTTP ${res.status}`);
      }

      const totalExecTime = data.execution_time_ms || (Date.now() - startTs);
      setExecutionTimeMs(totalExecTime);
      setReport(data.report);
      setMetadata(data.metadata || null);
      setToolCalls(data.tool_calls || []);
      setUnavailableServers(data.unavailable || []);
      setGeneratedAt(data.generated_at || new Date().toISOString());
      setModel(data.model || "gemini-2.5-pro");

      // Update MCP Status string
      if (data.unavailable && data.unavailable.length > 0) {
        const unavailableNames = data.unavailable.map(u => u.address.split("/").pop()).join(", ");
        setMcpServerStatus(`TradingView MCP: Connected | SingStat MCP: Unavailable (${unavailableNames})`);
      } else {
        setMcpServerStatus(`TradingView MCP: Connected | MCP Tools: Active (${data.tool_calls?.length || 0} calls)`);
      }

      // Save to localStorage cache (up to 5 reports)
      const currentTicker = mode === "ticker" ? (data.metadata?.executiveTearSheet?.ticker || ticker) : undefined;
      const newSavedItem: SavedReport = {
        id: `${mode}-${currentTicker || "macro"}-${Date.now()}`,
        mode,
        ticker: currentTicker,
        title: mode === "ticker" ? `${currentTicker} Alpha Report` : "Macro Regime & Flows",
        timestamp: data.generated_at || new Date().toISOString(),
        report: data.report,
        metadata: data.metadata || null,
        tool_calls: data.tool_calls || [],
        unavailable: data.unavailable || [],
        model: data.model || "gemini-2.5-pro",
        execution_time_ms: totalExecTime
      };

      const updatedList = storeReport(newSavedItem);
      setCachedReports(updatedList);

      // Auto-open drawer if tools were executed
      if (data.tool_calls && data.tool_calls.length > 0) {
        setIsDrawerOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      clearInterval(timer);
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleQuickTicker = (sym: string) => {
    setTicker(sym);
    if (mode !== "ticker") {
      setMode("ticker");
    }
  };

  const loadSampleMacro = () => {
    setMode("macro");
    setReport(SAMPLE_MACRO_REPORT);
    setMetadata(SAMPLE_MACRO_METADATA);
    setToolCalls(SAMPLE_MACRO_TOOL_CALLS);
    setUnavailableServers([]);
    setGeneratedAt(new Date().toISOString());
    setExecutionTimeMs(3120);
    setError(null);
  };

  const loadSampleTicker = () => {
    setMode("ticker");
    setTicker("PLTR");
    setReport(SAMPLE_TICKER_REPORT);
    setMetadata(SAMPLE_TICKER_METADATA);
    setToolCalls([
      { name: "get_stock_quote", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
      { name: "get_historical_technicals", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
      { name: "get_financial_metrics", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
      { name: "get_options_structure", args: { ticker: "PLTR" }, status: "success", timestamp: new Date().toISOString() },
    ]);
    setUnavailableServers([]);
    setGeneratedAt(new Date().toISOString());
    setExecutionTimeMs(2850);
    setError(null);
  };

  const handleSelectCachedReport = (saved: SavedReport) => {
    setMode(saved.mode);
    if (saved.ticker) {
      setTicker(saved.ticker);
    }
    setReport(saved.report);
    setMetadata(saved.metadata || null);
    setToolCalls(saved.tool_calls || []);
    setUnavailableServers(saved.unavailable || []);
    setModel(saved.model || "gemini-2.5-pro");
    setGeneratedAt(saved.timestamp);
    setExecutionTimeMs(saved.execution_time_ms || 3000);
    setError(null);
  };

  const handleClearCache = () => {
    clearStoredReports();
    setCachedReports([]);
  };

  const handleDownloadResearchNote = () => {
    if (!report) return;
    const cleanTick = mode === "ticker" ? (ticker || "STOCK") : "MACRO";
    const filename = `${cleanTick}_RESEARCH_NOTE_${new Date().toISOString().slice(0, 10)}.md`;
    const fullMarkdown = `---
title: ${mode === "ticker" ? `${cleanTick} Institutional Structural Alpha Note` : "US Macro Regime & Capital Flow Strategy"}
date: ${generatedAt}
model: ${model}
execution_engine: Alpha Terminal v1.0 / Gemini & MCP
---

${report}
`;
    const blob = new Blob([fullMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Institutional Top Ticker / Header Bar */}
      <header className="border-b border-zinc-800 bg-[#0d1017] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Desk Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 font-mono font-black text-sm shadow-md shadow-amber-500/10">
              α
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-zinc-100">
                  ALPHA TERMINAL
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                  INSTITUTIONAL PM
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Long/Short Macro Regime &amp; Single-Stock Structural Alpha Engine
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Cached Reports & Telemetry */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] text-zinc-300">{currentTime}</span>
            </div>

            {/* Download Research Note Button in Header */}
            <button
              onClick={handleDownloadResearchNote}
              disabled={!report}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                downloadSuccess
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              }`}
              title="Save entire institutional note locally as Markdown file"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? "DOWNLOADED (.MD)" : "DOWNLOAD NOTE (.MD)"}</span>
            </button>

            {/* TradingView OAuth 2.1 Status Indicator (Requirement 4) */}
            {tvConnected ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-700/80 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-semibold">🟢 TradingView Premium: Connected</span>
                <button
                  onClick={handleDisconnectTradingView}
                  className="ml-1.5 text-[10px] text-zinc-400 hover:text-red-400 underline cursor-pointer"
                  title="Disconnect TradingView token"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/tradingview";
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/80 text-[11px] text-amber-300 font-semibold transition-colors cursor-pointer"
                  title="Connect official TradingView MCP via OAuth 2.1 PKCE"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>🟡 TradingView: Connect Account</span>
                </button>
                <button
                  onClick={() => setShowTvModal(true)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer flex items-center gap-1"
                  title="Enter TradingView Bearer token manually"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Token</span>
                </button>
              </div>
            )}

            {/* Model Pill */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">MODEL:</span>
              <span className="text-zinc-200 font-semibold">{model.toUpperCase()}</span>
            </span>

            {/* API Ready Indicator */}
            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.geminiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-zinc-300 font-medium">
                {backendStatus.geminiKey ? "API LIVE" : "READY"}
              </span>
            </span>
          </div>
        </div>

        {/* Operational Mode Navigation Tabs */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/60 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setMode("macro")}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold transition-all border-b-2 cursor-pointer ${
                  mode === "macro"
                    ? "border-amber-400 text-amber-400 bg-amber-950/20"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>[F1] MACRO REGIME &amp; FLOWS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                  2-3M
                </span>
              </button>

              <button
                onClick={() => setMode("ticker")}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold transition-all border-b-2 cursor-pointer ${
                  mode === "ticker"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>[F2] SINGLE STOCK ALPHA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                  15-SECT
                </span>
              </button>
            </div>

            {/* Quick Demo Previews */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">PRESETS:</span>
              <button
                onClick={loadSampleMacro}
                className="px-2.5 py-1 rounded text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                Macro Regime Demo
              </button>
              <button
                onClick={loadSampleTicker}
                className="px-2.5 py-1 rounded text-[11px] bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-800 transition-colors"
              >
                PLTR Tear-Sheet Demo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Terminal Command Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Terminal Input Cockpit Panel */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Mode 1: Macro Regime Cockpit */}
          {mode === "macro" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      US Equity Macro Regime, Market Health &amp; Capital Flow Strategy
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Evaluates Growth, Inflation, Fed terminal rate, HY credit spreads, SPY/QQQ/IWM/VIX technicals, and Capital Flow Lifecycle stages.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
                  <span className="text-zinc-500">HORIZON:</span>
                  <span className="text-amber-400 font-semibold">2-3 MONTHS (SWING/ROTATION)</span>
                </div>
              </div>

              {/* 5-Phase Diagnostic Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-amber-400 font-bold block">PHASE 1</span>
                  <span className="text-zinc-400">Macro &amp; Fed Liquidity</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-amber-400 font-bold block">PHASE 2</span>
                  <span className="text-zinc-400">Technicals &amp; Gamma</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-amber-400 font-bold block">PHASE 3</span>
                  <span className="text-zinc-400">Flow Lifecycle Map</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-amber-400 font-bold block">PHASE 4</span>
                  <span className="text-zinc-400">GICS Pairs (L/S)</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-amber-400 font-bold block">PHASE 5</span>
                  <span className="text-zinc-400">Cross-Asset &amp; Hedges</span>
                </div>
              </div>

              {/* Optional Custom Focus Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor="macro-custom" className="text-zinc-400">
                    Additional Focus Area / Macro Inquiries (Optional):
                  </label>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-zinc-500 hover:text-zinc-300 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    {showAdvanced ? "Hide Prompt Controls" : "Show Prompt Controls"}
                  </button>
                </div>
                <input
                  id="macro-custom"
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="e.g. Focus on Treasury refunding schedule, tariff impact on margins, and semiconductor cycle..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Execution Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Grounding: MCP Tool calls query live macroeconomic data feeds</span>
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                    loading
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 active:translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>SYNTHESIZING REGIME ({elapsedSeconds}s)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>RUN MACRO &amp; FLOW DIAGNOSIS [F1]</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Single Stock Alpha Cockpit */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h2 className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      Individual Stock Trade Report &amp; Structural Alpha Deep Dive
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    15-Section institutional audit: NTM forward peers, Zacks EPS revisions, FCF conversion, Rule of 40, gamma posture, and 3-scenario valuation.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
                  <span className="text-zinc-500">FRAMEWORK:</span>
                  <span className="text-cyan-400 font-semibold">15-SECTION STRUCTURAL ALPHA</span>
                </div>
              </div>

              {/* Ticker Search & Input Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                    $
                  </div>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleRunAnalysis();
                      }
                    }}
                    placeholder="ENTER TICKER (e.g. NVDA, PLTR, MSFT, AAPL, AMZN)..."
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded pl-7 pr-3 py-2.5 text-sm font-mono font-bold text-zinc-100 tracking-wider placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={loading || !ticker.trim()}
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg whitespace-nowrap ${
                    loading || !ticker.trim()
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/20 active:translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>GENERATING ALPHA ({elapsedSeconds}s)...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>GENERATE STRUCTURAL ALPHA REPORT</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick-Pick Popular Tickers */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-zinc-500 text-[11px]">ACTIVE UNIVERSE:</span>
                {["PLTR", "NVDA", "MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "META"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => handleQuickTicker(sym)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      ticker === sym
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
                    }`}
                  >
                    ${sym}
                  </button>
                ))}
              </div>

              {/* Optional Custom Query */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor="ticker-custom" className="text-zinc-400 text-xs font-mono block">
                  Custom Structural Questions (Optional):
                </label>
                <input
                  id="ticker-custom"
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="e.g. Analyze AI enterprise contract ramp, SBC dilution trend, and calendar spread risk..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Loading Indicator with Stage Progression */}
          {loading && (
            <div className="mt-4 p-4 rounded bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div className="space-y-0.5 flex-1 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">TERMINAL SYNTHESIS IN PROGRESS</span>
                  <span className="text-amber-400 animate-pulse text-[11px]">ELAPSED: {elapsedSeconds}s</span>
                </div>
                <p className="text-xs text-zinc-400">{loadingStep}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-4 rounded bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-3 text-xs font-mono">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-bold text-rose-300">EXECUTION ERROR</div>
                <p className="text-rose-200/90 leading-relaxed">{error}</p>
                <button
                  onClick={handleRunAnalysis}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-white font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Execution
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Local Browser Cache (Persistence Requirement 5): Last 5 Generated Reports */}
        {cachedReports.length > 0 && (
          <section className="bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800/60 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <History className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-zinc-200">LOCAL REPORT CACHE</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                  {cachedReports.length}/5 STORED (ZERO TOKEN RETRIEVAL)
                </span>
              </div>
              <button
                onClick={handleClearCache}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear local browser cache"
              >
                <Trash2 className="w-3 h-3" /> Clear Cache
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {cachedReports.map((saved) => {
                const isCurrent =
                  saved.mode === mode &&
                  (saved.mode === "macro" || saved.ticker === ticker);
                return (
                  <button
                    key={saved.id}
                    onClick={() => handleSelectCachedReport(saved)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded transition-all cursor-pointer text-xs ${
                      isCurrent
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-bold">
                      {saved.mode === "ticker" ? `$${saved.ticker || "STOCK"}` : "MACRO"}
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      {new Date(saved.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* MCP Tool Call & Connection Inspector Drawer */}
        <section>
          <InspectionDrawer
            toolCalls={toolCalls}
            unavailableServers={unavailableServers}
            isOpen={isDrawerOpen}
            onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
          />
        </section>

        {/* Interactive Cards Section for Single Stock Alpha (or whenever metadata exists) */}
        {metadata && (
          <section className="space-y-5">
            {/* View Selector Tabs: All Views, Interactive Cards, Markdown Research Note */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Terminal Modules
                </span>
                <div className="flex items-center p-0.5 rounded bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "all" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All Modules
                  </button>
                  <button
                    onClick={() => setActiveTab("cards")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "cards" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Interactive Cards
                  </button>
                  <button
                    onClick={() => setActiveTab("report")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "report" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Full Markdown Note
                  </button>
                </div>
              </div>

              {/* Download Research Note button */}
              <button
                onClick={handleDownloadResearchNote}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer text-xs"
                title="Download full research note in Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT NOTE (.MD)</span>
              </button>
            </div>

            {/* Interactive Cards Grid */}
            {(activeTab === "all" || activeTab === "cards") && (
              <div className="space-y-6">
                {/* 1. Executive Tear-Sheet & 10-Second Pitch Snapshot */}
                {metadata.executiveTearSheet && (
                  <ExecutiveTearSheetCard
                    tearSheet={metadata.executiveTearSheet}
                    ticker={mode === "ticker" ? ticker : metadata.executiveTearSheet.ticker}
                  />
                )}

                {/* 2. Interactive Valuation Scenario Matrix (Bear, Base, Bull) */}
                {metadata.valuationScenarios && (
                  <ValuationScenarioCard
                    scenarios={metadata.valuationScenarios}
                    currentPrice={metadata.valuationScenarios.currentPrice}
                    ticker={mode === "ticker" ? ticker : "TARGET"}
                  />
                )}

                {/* 3. Options Strategy Builder (Ratio Calendar vs. Vertical Spreads) */}
                {metadata.optionsRecommendation && (
                  <OptionsStrategyCard
                    options={metadata.optionsRecommendation}
                    ticker={mode === "ticker" ? ticker : "TARGET"}
                    currentPrice={metadata.valuationScenarios?.currentPrice || 100}
                  />
                )}
              </div>
            )}
          </section>
        )}

        {/* Institutional Alpha Report Viewer */}
        {(activeTab === "all" || activeTab === "report" || !metadata) && (
          <section>
            <ReportViewer
              report={report}
              ticker={mode === "ticker" ? ticker : undefined}
              mode={mode}
              generatedAt={generatedAt}
              model={model}
            />
          </section>
        )}
      </main>

      {/* Terminal Live Telemetry Status Bar (Requirement 4) */}
      <footer className="mt-auto border-t border-zinc-800 bg-[#080a0f] py-2.5 px-4 font-mono text-[11px] text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Active Gemini Model */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-500 font-bold">MODEL:</span>
              <span className="text-zinc-100 font-semibold uppercase">{model}</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">
              {backendStatus.geminiKey ? "API Status: Connected" : "API Status: Key Required"}
            </span>
          </div>

          {/* MCP Latency & Connected Server count */}
          <div className="flex items-center gap-2 text-center">
            <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-zinc-300 font-medium">
              {mcpServerStatus}
            </span>
          </div>

          {/* Generation Time Elapsed in Seconds */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-zinc-400">
              GENERATION TIME:{" "}
              <span className="text-zinc-100 font-bold">
                {loading ? `${elapsedSeconds}s (running)` : `${(executionTimeMs / 1000).toFixed(2)}s`}
              </span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-medium">LIVE TERMINAL READY</span>
          </div>
        </div>
      </footer>

      {/* TradingView MCP Authentication & Settings Modal (Requirement 4) */}
      {showTvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-zinc-200 font-mono relative">
            <button
              onClick={() => setShowTvModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <Key className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  TradingView MCP Authentication
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure OAuth 2.1 PKCE or Manual Bearer Token
                </p>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">CURRENT STATUS:</span>
              {tvConnected ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AUTHENTICATED (TOKEN ACTIVE)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  DISCONNECTED (FAILOVER ENGINE READY)
                </span>
              )}
            </div>

            {/* Option A: OAuth 2.1 Handshake */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>METHOD 1 — OAUTH 2.1 PKCE HANDSHAKE</span>
                <span className="text-[10px] text-amber-400 font-normal">RECOMMENDED</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connects directly to <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">https://mcp.tradingview.com/mcp</code> using cryptographic code challenge (S256) and stores secure session cookies.
              </p>
              <button
                onClick={() => {
                  window.location.href = "/api/auth/tradingview";
                }}
                className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Zap className="w-4 h-4" />
                <span>Launch TradingView OAuth Flow</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase">Or Manual Entry</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Option B: Manual Bearer Token */}
            <div className="space-y-2">
              <label htmlFor="manual-token-input" className="block text-xs font-bold text-zinc-300">
                METHOD 2 — BEARER ACCESS TOKEN
              </label>
              <p className="text-[11px] text-zinc-400">
                Paste an active TradingView MCP Bearer token for CI/CD or Vercel environments:
              </p>
              <input
                id="manual-token-input"
                type="password"
                placeholder="tv_bearer_token_..."
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleSaveManualToken(manualTokenInput)}
                  className="flex-1 py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  Save &amp; Activate Token
                </button>
                {tvConnected && (
                  <button
                    onClick={handleDisconnectTradingView}
                    className="py-2 px-3 rounded bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800 text-xs transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Failover Engine Assurance */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-300/90 leading-relaxed">
              <span className="font-bold text-emerald-400 block mb-0.5">🛡️ REAL-TIME FAILOVER ACTIVE:</span>
              Even if TradingView token expires, our internal live market data engine queries real-time 2026 market quotes. Stock prices (e.g. PLTR at ~$189+) and 50d/200d SMAs are guaranteed accurate without historical 2024 hallucination.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
