import React, { useState } from "react";
import { ToolCall, UnavailableServer } from "../types.ts";
import { Terminal, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Code2, ServerOff } from "lucide-react";

interface InspectionDrawerProps {
  toolCalls: ToolCall[];
  unavailableServers: UnavailableServer[];
  isOpen: boolean;
  onToggle: () => void;
}

export const InspectionDrawer: React.FC<InspectionDrawerProps> = ({
  toolCalls,
  unavailableServers,
  isOpen,
  onToggle,
}) => {
  const [expandedCalls, setExpandedCalls] = useState<Record<number, boolean>>({});

  const toggleCallArgs = (index: number) => {
    setExpandedCalls(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const hasUnavailable = unavailableServers && unavailableServers.length > 0;
  const hasToolCalls = toolCalls && toolCalls.length > 0;

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden shadow-xl transition-all">
      {/* Header / Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors text-left border-b border-zinc-800/80 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-zinc-800 border border-zinc-700 text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider">
                MCP Tool Call &amp; Connection Inspector
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {toolCalls.length} executed
              </span>
              {hasUnavailable && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                  {unavailableServers.length} unavailable
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Live audit trail of quantitative tools invoked by Gemini model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
          <span>{isOpen ? "COLLAPSE" : "EXPAND AUDIT LOG"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Drawer Content */}
      {isOpen && (
        <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto font-mono text-xs">
          {/* Unavailable MCP Servers Warning Section */}
          {hasUnavailable && (
            <div className="space-y-2 p-3 rounded-lg bg-amber-950/20 border border-amber-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
                  <ServerOff className="w-3.5 h-3.5" />
                  <span>External MCP Endpoint Diagnostics ({unavailableServers.length})</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-normal">
                  Local Failover Engine active &bull; Analysis uninterrupted
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {unavailableServers.map((server, idx) => {
                  const isTv = server.address.includes("tradingview.com");
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-400"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isTv ? "bg-amber-400" : "bg-zinc-500"}`} />
                        <span className="font-mono font-medium text-zinc-200 truncate">{server.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-[10px] max-w-md truncate" title={server.reason}>
                          {server.reason}
                        </span>
                        {isTv && (
                          <button
                            onClick={() => {
                              window.location.href = "/api/auth/tradingview";
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            Authenticate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tool Calls List */}
          {hasToolCalls ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                <span>Chronological Tool Invocation Log</span>
                <span className="text-zinc-500 text-[10px]">Max Remote Calls: 10</span>
              </div>

              <div className="space-y-2">
                {toolCalls.map((call, idx) => {
                  const isCallExpanded = expandedCalls[idx] ?? true;
                  const isSuccess = call.status === "success";

                  return (
                    <div
                      key={idx}
                      className="border border-zinc-800/80 rounded bg-zinc-900/60 overflow-hidden"
                    >
                      {/* Call header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-bold text-[10px]">#{idx + 1}</span>
                          <span className="text-amber-300 font-semibold">{call.name}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                                : "bg-rose-950 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {isSuccess ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> SUCCESS
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> FAILED
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {call.timestamp && (
                            <span className="text-zinc-500 text-[10px]">
                              {new Date(call.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                          <button
                            onClick={() => toggleCallArgs(idx)}
                            className="text-zinc-400 hover:text-zinc-200 text-[10px] underline flex items-center gap-1 cursor-pointer"
                          >
                            <Code2 className="w-3 h-3" />
                            {isCallExpanded ? "Hide Args" : "View Args"}
                          </button>
                        </div>
                      </div>

                      {/* Arguments JSON */}
                      {isCallExpanded && (
                        <div className="p-3 bg-black/40 text-[11px] overflow-x-auto">
                          <pre className="text-zinc-300 font-mono leading-relaxed">
                            {JSON.stringify(call.args, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 text-center rounded bg-zinc-900/40 border border-zinc-800 text-zinc-500">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
              <p className="text-zinc-400 font-medium">No external MCP tools called for this session</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {hasUnavailable
                  ? "Configured MCP servers were unreachable; analysis completed via Gemini reasoning with strict grounding directives."
                  : "If MCP_SERVERS is unconfigured, terminal executes with strict grounding rules, marking unverified live data as [Data Unavailable]."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
