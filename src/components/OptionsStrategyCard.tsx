import React, { useState } from "react";
import { OptionsRecommendation } from "../types.ts";
import {
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Info,
  DollarSign
} from "lucide-react";

interface OptionsStrategyCardProps {
  options?: OptionsRecommendation;
  ticker?: string;
  currentPrice?: number;
}

export const OptionsStrategyCard: React.FC<OptionsStrategyCardProps> = ({
  options,
  ticker = "STOCK",
  currentPrice = 100,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<"calendar" | "vertical">("calendar");
  const [contracts, setContracts] = useState<number>(5);

  if (!options) return null;

  // Derive realistic structures if partial
  const calendarStrategy = {
    name: "Ratio Calendar Spread",
    direction: options.direction || "Bullish",
    shortLeg: `Short 30-Day OTM Call ($${(currentPrice * 1.1).toFixed(1)}C)`,
    longLeg: `Long 90-Day ATM Call ($${(currentPrice * 1.02).toFixed(1)}C)`,
    expiryProfile: "Sell front-month event IV / Buy multi-quarter structural convexity",
    debitEst: +(currentPrice * 0.06).toFixed(2),
    maxLossDesc: "Defined to net debit paid ($ per contract)",
    maxProfitDesc: "Convex open-ended upside beyond near-term cycle",
    breakevenDesc: `$${(currentPrice * 1.04).toFixed(2)} at front-month expiration`,
    rationale: options.rationale || "Harvests rich event volatility skew in the front month while maintaining leveraged long convexity for structural adoption."
  };

  const verticalStrategy = {
    name: "Defined-Risk Vertical Bull Call Spread",
    direction: "Bullish",
    shortLeg: `Short 60-Day OTM Call ($${(currentPrice * 1.15).toFixed(1)}C)`,
    longLeg: `Long 60-Day ATM Call ($${(currentPrice * 1.0).toFixed(1)}C)`,
    expiryProfile: "Fixed 60-day horizon with capped max risk and predefined 2.5x payoff",
    debitEst: +(currentPrice * 0.05).toFixed(2),
    maxLossDesc: "Limited strictly to net premium paid",
    maxProfitDesc: `Capped at width of strikes less debit (~$${(currentPrice * 0.1).toFixed(2)}/share)`,
    breakevenDesc: `$${(currentPrice * 1.05).toFixed(2)}`,
    rationale: "Maximizes capital efficiency with 100% defined risk and no margin requirement."
  };

  const currentStrat = selectedStrategy === "calendar" ? calendarStrategy : verticalStrategy;
  const costPerContract = currentStrat.debitEst * 100;
  const totalInvested = costPerContract * contracts;
  const targetProfitEst = totalInvested * (selectedStrategy === "calendar" ? 2.8 : 2.2);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800 border border-zinc-700 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Options Strategy Builder &amp; Volatility Architecture
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-bold border border-zinc-700">
                DERIVATIVE VOL
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Compare Ratio Calendar Spreads vs. Defined-Risk Vertical Spreads on ${ticker}
            </p>
          </div>
        </div>

        {/* Strategy Selector Toggle */}
        <div className="flex items-center p-1 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setSelectedStrategy("calendar")}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer font-semibold ${
              selectedStrategy === "calendar"
                ? "bg-cyan-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ratio Calendar Spread
          </button>
          <button
            onClick={() => setSelectedStrategy("vertical")}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer font-semibold ${
              selectedStrategy === "vertical"
                ? "bg-cyan-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Vertical Bull Spread
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Strategy Legs Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Short Near Leg */}
          <div className="p-4 rounded-lg bg-zinc-900/70 border border-amber-900/40 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                <Calendar className="w-3.5 h-3.5" /> LEG 1: SHORT NEAR-TERM
              </span>
              <span className="text-zinc-400 text-xs font-mono">THETA DECAY HARVEST</span>
            </div>
            <div className="text-base font-mono font-bold text-zinc-100 pt-1">
              {currentStrat.shortLeg}
            </div>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Sells elevated front-month implied volatility to subsidize longer-dated position. Rapid decay works in your favor.
            </p>
          </div>

          {/* Long Far Leg */}
          <div className="p-4 rounded-lg bg-zinc-900/70 border border-cyan-900/40 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Zap className="w-3.5 h-3.5" /> LEG 2: LONG LONGER-DATED
              </span>
              <span className="text-cyan-400 text-xs font-mono">CONVEX UPSIDE</span>
            </div>
            <div className="text-base font-mono font-bold text-zinc-100 pt-1">
              {currentStrat.longLeg}
            </div>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Provides multi-month directional upside participation with minimal time decay impact.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block">ESTIMATED NET DEBIT</span>
            <span className="text-zinc-100 font-bold text-sm">~${currentStrat.debitEst} / share</span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">(${(currentStrat.debitEst * 100).toFixed(0)} / contract)</span>
          </div>

          <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block">MAX RISK / LOSS</span>
            <span className="text-rose-400 font-bold text-sm">Defined</span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">{currentStrat.maxLossDesc}</span>
          </div>

          <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block">EST. BREAKEVEN</span>
            <span className="text-cyan-300 font-bold text-sm">{currentStrat.breakevenDesc}</span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">Near-term expiry</span>
          </div>

          <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block">PAYOFF PROFILE</span>
            <span className="text-emerald-400 font-bold text-sm">
              {selectedStrategy === "calendar" ? "Convex Upside" : "2.4x Capped R:R"}
            </span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">{currentStrat.maxProfitDesc}</span>
          </div>
        </div>

        {/* Strategy Rationale */}
        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs font-sans space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quantitative Desk Rationale</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {currentStrat.rationale}
          </p>
        </div>

        {/* Interactive Contract Simulator */}
        <div className="p-4 sm:p-5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Position Capital Sizing ({contracts} Contracts = {contracts * 100} Shares Equivalent)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">CONTRACTS:</span>
              {[1, 3, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setContracts(num)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    contracts === num
                      ? "bg-cyan-500 text-zinc-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
            <div className="p-3 rounded bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">TOTAL CAPITAL COMMITTED</span>
              <span className="text-zinc-100 font-bold text-base">
                ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-zinc-500 text-[10px] block">Max Risk Capped</span>
            </div>

            <div className="p-3 rounded bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">ESTIMATED TARGET PAYOFF</span>
              <span className="text-emerald-400 font-bold text-base">
                +${targetProfitEst.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-zinc-500 text-[10px] block">At Target Exit Price</span>
            </div>

            <div className="p-3 rounded bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">ESTIMATED NET GAIN</span>
              <span className="text-cyan-300 font-bold text-base">
                +${(targetProfitEst - totalInvested).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-zinc-500 text-[10px] block">
                {((targetProfitEst / totalInvested) * 100 - 100).toFixed(0)}% Net ROI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
