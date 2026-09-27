import React, { useState } from "react";
import { ValuationScenarios } from "../types.ts";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Percent,
  DollarSign,
  PieChart,
  Target,
  ArrowRight
} from "lucide-react";

interface ValuationScenarioCardProps {
  scenarios?: ValuationScenarios;
  currentPrice?: number;
  ticker?: string;
}

export const ValuationScenarioCard: React.FC<ValuationScenarioCardProps> = ({
  scenarios,
  currentPrice: propCurrentPrice,
  ticker = "STOCK",
}) => {
  const [shares, setShares] = useState<number>(100);
  const [customPosition, setCustomPosition] = useState<string>("100");

  if (!scenarios) return null;

  const currentPrice = propCurrentPrice || scenarios.currentPrice || 100;
  const bear = scenarios.bear || { targetPrice: currentPrice * 0.8, upsidePct: -20, multiple: "Multiple de-rating", probability: 20, catalysts: "Recessionary multiple compression" };
  const base = scenarios.base || { targetPrice: currentPrice * 1.15, upsidePct: 15, multiple: "Consensus multiple", probability: 55, catalysts: "Steady execution against guidance" };
  const bull = scenarios.bull || { targetPrice: currentPrice * 1.4, upsidePct: 40, multiple: "Peak growth multiple", probability: 25, catalysts: "Accelerated enterprise adoption" };

  // Calculate probability-weighted expected target and return
  const bearProb = bear.probability || 20;
  const baseProb = base.probability || 55;
  const bullProb = bull.probability || 25;
  const totalProb = bearProb + baseProb + bullProb || 100;

  const weightedTarget = (
    (bear.targetPrice * bearProb + base.targetPrice * baseProb + bull.targetPrice * bullProb) /
    totalProb
  );
  const weightedReturn = ((weightedTarget - currentPrice) / currentPrice) * 100;

  // Payoff calculations based on share count
  const currentInvested = shares * currentPrice;
  const bearPayoff = shares * bear.targetPrice - currentInvested;
  const basePayoff = shares * base.targetPrice - currentInvested;
  const bullPayoff = shares * bull.targetPrice - currentInvested;

  const handleSharesChange = (val: string) => {
    setCustomPosition(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setShares(parsed);
    }
  };

  const handlePresetShares = (preset: number) => {
    setShares(preset);
    setCustomPosition(preset.toString());
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800 border border-zinc-700 text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Valuation Scenario Matrix &amp; Payoff Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                BEAR / BASE / BULL
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Implied target prices, multiple sensitivity, and simulated portfolio payoffs
            </p>
          </div>
        </div>

        {/* Current Price & Probability-Weighted Target */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">CURRENT PRICE</span>
            <span className="text-zinc-100 font-bold text-sm">${currentPrice.toFixed(2)}</span>
          </div>

          <div className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">EXPECTED VALUE</span>
            <span className={`font-bold text-sm ${weightedReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ${weightedTarget.toFixed(2)} ({weightedReturn >= 0 ? "+" : ""}{weightedReturn.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column Scenario Grid */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bear Case Card */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-rose-900/40 relative overflow-hidden flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
                  <TrendingDown className="w-3.5 h-3.5" /> BEAR CASE
                </span>
                <span className="text-zinc-500 text-xs font-mono">{bearProb}% PROB</span>
              </div>
              <div className="pt-2">
                <div className="text-2xl font-mono font-black text-rose-400">
                  ${bear.targetPrice.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-rose-300 font-bold">
                  {bear.upsidePct > 0 ? `+${bear.upsidePct}%` : `${bear.upsidePct}%`}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-t border-zinc-800/80 pt-2 font-mono">
              {bear.multiple && (
                <div className="text-zinc-400">
                  <span className="text-zinc-500">Multiple:</span> {bear.multiple}
                </div>
              )}
              {bear.catalysts && (
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed line-clamp-2" title={bear.catalysts}>
                  {bear.catalysts}
                </p>
              )}
            </div>
          </div>

          {/* Base Case Card */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-cyan-900/40 relative overflow-hidden flex flex-col justify-between space-y-3 shadow-md shadow-cyan-950/20">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  <Target className="w-3.5 h-3.5" /> BASE CASE
                </span>
                <span className="text-zinc-500 text-xs font-mono">{baseProb}% PROB</span>
              </div>
              <div className="pt-2">
                <div className="text-2xl font-mono font-black text-cyan-300">
                  ${base.targetPrice.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  {base.upsidePct >= 0 ? `+${base.upsidePct}%` : `${base.upsidePct}%`}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-t border-zinc-800/80 pt-2 font-mono">
              {base.multiple && (
                <div className="text-zinc-400">
                  <span className="text-zinc-500">Multiple:</span> {base.multiple}
                </div>
              )}
              {base.catalysts && (
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed line-clamp-2" title={base.catalysts}>
                  {base.catalysts}
                </p>
              )}
            </div>
          </div>

          {/* Bull Case Card */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-emerald-900/40 relative overflow-hidden flex flex-col justify-between space-y-3 shadow-md shadow-emerald-950/20">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  <TrendingUp className="w-3.5 h-3.5" /> BULL CASE
                </span>
                <span className="text-zinc-500 text-xs font-mono">{bullProb}% PROB</span>
              </div>
              <div className="pt-2">
                <div className="text-2xl font-mono font-black text-emerald-400">
                  ${bull.targetPrice.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-emerald-300 font-bold">
                  +{bull.upsidePct}%
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-t border-zinc-800/80 pt-2 font-mono">
              {bull.multiple && (
                <div className="text-zinc-400">
                  <span className="text-zinc-500">Multiple:</span> {bull.multiple}
                </div>
              )}
              {bull.catalysts && (
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed line-clamp-2" title={bull.catalysts}>
                  {bull.catalysts}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Payoff Calculator Simulator */}
        <div className="p-4 sm:p-5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Simulated Position Payoff ({shares} Shares / ${(shares * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} Invested)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">QUICK SHARES:</span>
              {[50, 100, 250, 500, 1000].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePresetShares(num)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    shares === num
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {num}
                </button>
              ))}
              <div className="relative w-20">
                <input
                  type="number"
                  value={customPosition}
                  onChange={(e) => handleSharesChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-xs font-mono text-zinc-100 text-right focus:outline-none focus:border-amber-400"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>

          {/* Payoff Simulation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded bg-zinc-950/80 border border-rose-900/30">
              <span className="text-zinc-500 text-[10px] block">BEAR SCENARIO P&amp;L</span>
              <div className="text-lg font-bold text-rose-400">
                {bearPayoff >= 0 ? `+$${bearPayoff.toFixed(0)}` : `-$${Math.abs(bearPayoff).toFixed(0)}`}
              </div>
              <span className="text-zinc-500 text-[10px]">
                Portfolio Value: ${(shares * bear.targetPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-3 rounded bg-zinc-950/80 border border-cyan-900/30">
              <span className="text-zinc-500 text-[10px] block">BASE SCENARIO P&amp;L</span>
              <div className="text-lg font-bold text-cyan-300">
                {basePayoff >= 0 ? `+$${basePayoff.toFixed(0)}` : `-$${Math.abs(basePayoff).toFixed(0)}`}
              </div>
              <span className="text-zinc-500 text-[10px]">
                Portfolio Value: ${(shares * base.targetPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-3 rounded bg-zinc-950/80 border border-emerald-900/30">
              <span className="text-zinc-500 text-[10px] block">BULL SCENARIO P&amp;L</span>
              <div className="text-lg font-bold text-emerald-400">
                +${bullPayoff.toFixed(0)}
              </div>
              <span className="text-zinc-500 text-[10px]">
                Portfolio Value: ${(shares * bull.targetPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
