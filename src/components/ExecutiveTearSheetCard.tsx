import React, { useState } from "react";
import { ExecutiveTearSheet } from "../types.ts";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Copy,
  Check,
  Quote,
  Zap,
  Target,
  Layers,
  Sparkles,
  Calendar,
  Building2,
  DollarSign,
  Briefcase
} from "lucide-react";

interface ExecutiveTearSheetCardProps {
  tearSheet?: ExecutiveTearSheet;
  ticker?: string;
}

export const ExecutiveTearSheetCard: React.FC<ExecutiveTearSheetCardProps> = ({
  tearSheet,
  ticker = "STOCK",
}) => {
  const [copied, setCopied] = useState(false);

  if (!tearSheet) return null;

  const rec = tearSheet.recommendation || "Long";
  const isLong = rec.toLowerCase().includes("long");
  const isShort = rec.toLowerCase().includes("short");

  const getRecBadgeClass = () => {
    if (isLong) {
      return "bg-emerald-950/90 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20";
    }
    if (isShort) {
      return "bg-rose-950/90 text-rose-400 border-rose-500/50 shadow-rose-500/20";
    }
    return "bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-amber-500/20";
  };

  const getRecIcon = () => {
    if (isLong) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (isShort) return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <AlertCircle className="w-4 h-4 text-amber-400" />;
  };

  const handleCopyTearSheet = async () => {
    const textToCopy = `### 15. Executive Tear-Sheet & "10-Second Pitch" Snapshot
**\`${tearSheet.ticker || ticker}\` (\`${tearSheet.companyName}\`) — \`[${rec}]\`, \`[${tearSheet.subIndustryTheme || "US Equities"}]\`**
* **Product:** ${tearSheet.product}
* **What's happening:** ${tearSheet.whatsHappening}
* **Catalysts:**
${(tearSheet.catalysts || [])
  .map((c) => `  - \`${c.label}\` — ${c.detail}`)
  .join("\n")}
* **10 seconds:** "${tearSheet.tenSecondPitch}"`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const catalystIcons: Record<string, React.ReactNode> = {
    earnings: <Calendar className="w-3.5 h-3.5 text-amber-400" />,
    commercial: <Briefcase className="w-3.5 h-3.5 text-cyan-400" />,
    operational: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
    capital: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
  };

  const getCatalystIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("earn") || lower.includes("hurdle")) return catalystIcons.earnings;
    if (lower.includes("comm") || lower.includes("adopt")) return catalystIcons.commercial;
    if (lower.includes("oper") || lower.includes("mile")) return catalystIcons.operational;
    if (lower.includes("cap") || lower.includes("finan") || lower.includes("debt")) return catalystIcons.capital;
    return <Target className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              ${tearSheet.ticker || ticker}
            </span>
            <span className="text-zinc-500 font-mono text-sm hidden sm:inline">|</span>
            <span className="text-zinc-300 font-medium text-sm sm:text-base">
              {tearSheet.companyName || "Target Company"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold border shadow-xs ${getRecBadgeClass()}`}
            >
              {getRecIcon()}
              <span>{rec.toUpperCase()}</span>
            </span>

            {tearSheet.subIndustryTheme && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-zinc-800/90 text-zinc-300 border border-zinc-700/80">
                <Building2 className="w-3 h-3 text-cyan-400" />
                {tearSheet.subIndustryTheme}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCopyTearSheet}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
            copied
              ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/30"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:translate-y-0.5"
          }`}
          title="Copy clean Section 15 markdown formatted for institutional review"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "COPIED TO CLIPBOARD" : "COPY TEAR-SHEET FOR PM / DECK"}</span>
        </button>
      </div>

      {/* Main Grid: Product, Pulse, Catalysts */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Section 1: Product & Moat */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Product &amp; Structural Moat</span>
            </div>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
              {tearSheet.product}
            </p>
          </div>

          {/* Section 2: Fundamental Pulse */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Fundamental Pulse: What's Happening</span>
            </div>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
              {tearSheet.whatsHappening}
            </p>
          </div>
        </div>

        {/* Section 3: Catalyst Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Structured 4-Pillar Catalyst Matrix
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">Execution &amp; Hurdle Checks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {(tearSheet.catalysts || []).map((cat, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-between space-y-1.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getCatalystIcon(cat.label)}
                  <span className="font-bold text-zinc-200 text-[11px]">{cat.label}</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans pl-5">
                  {cat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: 10-Second Pitch Callout Box */}
        <div className="relative p-4 sm:p-5 rounded-lg bg-gradient-to-r from-amber-950/30 via-zinc-900 to-amber-950/20 border border-amber-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>10-Second Institutional Pitch</span>
          </div>

          <div className="flex items-start gap-3">
            <Quote className="w-6 h-6 text-amber-500/60 shrink-0 mt-0.5" />
            <blockquote className="text-zinc-100 text-sm sm:text-base italic font-medium leading-relaxed font-sans">
              "{tearSheet.tenSecondPitch}"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};
