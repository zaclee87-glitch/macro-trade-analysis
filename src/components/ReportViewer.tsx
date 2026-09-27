import React, { useMemo, useState } from "react";
import { marked } from "marked";
import { Copy, Check, Download, FileText, Sparkles, AlertCircle } from "lucide-react";

interface ReportViewerProps {
  report: string;
  ticker?: string;
  mode: "macro" | "ticker";
  generatedAt?: string;
  model?: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  ticker,
  mode,
  generatedAt,
  model = "gemini-2.5-pro",
}) => {
  const [copied, setCopied] = useState(false);

  // Configure marked for clean GFM parsing
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const parsedHtml = useMemo(() => {
    if (!report) return "";
    let rawHtml = marked.parse(report) as string;

    // Enhance lifecycle stage badges
    rawHtml = rawHtml.replace(
      /🟢\s*Emerging/gi,
      `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-xs shadow-emerald-500/10"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Emerging</span>`
    );
    rawHtml = rawHtml.replace(
      /🟡\s*Accelerating/gi,
      `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/10"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Accelerating</span>`
    );
    rawHtml = rawHtml.replace(
      /🟠\s*Consensus/gi,
      `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-950/80 text-orange-300 border border-orange-500/40 shadow-xs shadow-orange-500/10"><span class="w-2 h-2 rounded-full bg-orange-400"></span> Consensus</span>`
    );
    rawHtml = rawHtml.replace(
      /🔴\s*Distribution/gi,
      `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-xs shadow-rose-500/10"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Distribution</span>`
    );

    // Enhance [Data Unavailable] tags with clear styling
    rawHtml = rawHtml.replace(
      /\[Data Unavailable\]/gi,
      `<span class="inline-block px-1.5 py-0.5 text-[11px] font-mono rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 italic">[Data Unavailable]</span>`
    );

    return rawHtml;
  }, [report]);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = report;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const filename = `${mode === "ticker" ? (ticker || "STOCK") : "MACRO"}_ALPHA_REPORT_${new Date().toISOString().slice(0, 10)}.md`;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950/40">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500/70 mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-zinc-300 font-mono font-medium text-sm mb-1 tracking-wider uppercase">
          Awaiting Execution Parameters
        </h3>
        <p className="text-zinc-500 text-xs max-w-md font-mono">
          Select <span className="text-amber-400 font-semibold">Macro Regime & Flows</span> or enter a ticker in{" "}
          <span className="text-cyan-400 font-semibold">Single Stock Alpha</span> to trigger quantitative tool-grounded synthesis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden shadow-2xl">
      {/* Report Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
              {mode === "ticker" ? `REPORT // ${ticker} STRUCTURAL ALPHA` : "STRATEGY // US MACRO REGIME & FLOWS"}
            </span>
          </div>
          <span className="text-zinc-600 font-mono text-xs">|</span>
          <span className="font-mono text-[11px] text-zinc-400">
            ENGINE: <span className="text-zinc-200">{model}</span>
          </span>
          {generatedAt && (
            <>
              <span className="text-zinc-600 font-mono text-xs hidden sm:inline">|</span>
              <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
                TIMESTAMP: {new Date(generatedAt).toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              copied
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80"
            }`}
            title="Copy entire markdown report to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "COPY REPORT"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all"
            title="Download report as Markdown file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT .MD</span>
          </button>
        </div>
      </div>

      {/* Styled Markdown Container */}
      <div className="p-6 md:p-8 overflow-x-auto text-zinc-200 report-prose font-sans leading-relaxed text-sm">
        <div
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
          className="space-y-4"
        />
      </div>
    </div>
  );
};
