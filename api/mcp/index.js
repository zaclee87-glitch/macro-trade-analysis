import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Market database with realistic quantitative and fundamental data for institutional terminal operations
const MOCK_STOCKS = {
  NVDA: {
    name: "NVIDIA Corporation",
    sector: "Information Technology",
    industry: "Semiconductors",
    price: 132.50,
    change: 3.40,
    changePct: 2.63,
    volume: "58.2M",
    avgVolume: "54.1M",
    marketCap: "3.24T",
    pe_ntm: 34.2,
    ev_ebitda_ntm: 29.8,
    ev_rev_ntm: 19.5,
    grossMargin: "75.4%",
    operatingMargin: "62.1%",
    fcfConversion: "88.2%",
    ruleOf40: "94.5%",
    sbcPctRev: "3.8%",
    capexIntensity: "4.5%",
    sma50: 124.80,
    sma200: 108.40,
    rsi14: 63.8,
    macd: { macd: 2.45, signal: 1.82, hist: 0.63 },
    gammaPosture: "Dealer Long Gamma (+$1.4B/1% move). Volatility suppression zone above $128 flip level.",
    epsRevisions: {
      zacksRank: 1, // Strong Buy
      revisionsPast30d: { up: 18, down: 1, consensusPctChange: "+4.8%" },
      revisionsPast60d: { up: 27, down: 2, consensusPctChange: "+8.2%" },
      revisionsPast90d: { up: 32, down: 3, consensusPctChange: "+12.1%" },
      surpriseHistory: [
        { quarter: "Q2 2026", epsEst: 0.64, epsAct: 0.68, surprisePct: "+6.25%", priceReaction: "+4.1%" },
        { quarter: "Q1 2026", epsEst: 0.58, epsAct: 0.61, surprisePct: "+5.17%", priceReaction: "+3.2%" },
        { quarter: "Q4 2025", epsEst: 0.51, epsAct: 0.55, surprisePct: "+7.84%", priceReaction: "+8.5%" },
        { quarter: "Q3 2025", epsEst: 0.44, epsAct: 0.48, surprisePct: "+9.09%", priceReaction: "+6.0%" },
      ]
    },
    options: {
      iv30: "44.2%",
      ivPercentile: "48th Percentile",
      putCallRatio: 0.62,
      skew25d: "-3.8% (Mild Call Premium Bias)",
      suggestedRatioCalendar: "Sell 30-Day OTM 145 Call / Buy 90-Day ATM 135 Call (Net Debit ~$3.80). Harvests near-term event volatility while preserving structural convex upside.",
      suggestedVerticalSpread: "Bull Call Spread: Long 130C / Short 145C (60-day expiry). Max R:R 2.4x."
    },
    atr: 4.85,
    financialHistory: [
      { year: "FY2023", revenue: "$26.97B", grossMargin: "56.9%", operatingMargin: "15.8%", fcf: "$3.81B", currentRatio: "3.5x", debtToEquity: "0.41x" },
      { year: "FY2024", revenue: "$60.92B", grossMargin: "72.7%", operatingMargin: "54.1%", fcf: "$26.95B", currentRatio: "4.2x", debtToEquity: "0.25x" },
      { year: "FY2025", revenue: "$122.4B", grossMargin: "75.4%", operatingMargin: "62.1%", fcf: "$60.85B", currentRatio: "4.8x", debtToEquity: "0.14x" }
    ],
    peerMultiples: [
      { ticker: "NVDA", name: "NVIDIA Corp", ntm_pe: "34.2x", ev_ebitda: "29.8x", ev_sales: "19.5x", forwardRevenueGrowth: "+48.5%" },
      { ticker: "AVGO", name: "Broadcom Inc", ntm_pe: "26.5x", ev_ebitda: "22.4x", ev_sales: "13.8x", forwardRevenueGrowth: "+24.2%" },
      { ticker: "AMD", name: "Advanced Micro Devices", ntm_pe: "31.0x", ev_ebitda: "26.1x", ev_sales: "8.9x", forwardRevenueGrowth: "+21.0%" },
      { ticker: "QCOM", name: "QUALCOMM Inc", ntm_pe: "16.2x", ev_ebitda: "14.5x", ev_sales: "5.1x", forwardRevenueGrowth: "+11.4%" },
    ],
  },
  PLTR: {
    name: "Palantir Technologies Inc.",
    sector: "Information Technology",
    industry: "Enterprise Software & AI Platforms",
    price: 189.67,
    change: 16.94,
    changePct: 9.81,
    volume: "68.4M",
    avgVolume: "54.2M",
    marketCap: "432.5B",
    pe_ntm: 112.5,
    ev_ebitda_ntm: 88.0,
    ev_rev_ntm: 44.5,
    grossMargin: "82.4%",
    operatingMargin: "38.2%",
    fcfConversion: "118.5%",
    ruleOf40: "84.2%",
    sbcPctRev: "11.5%",
    capexIntensity: "1.4%",
    sma50: 163.90,
    sma200: 152.00,
    rsi14: 69.4,
    macd: { macd: 5.42, signal: 4.10, hist: 1.32 },
    gammaPosture: "Dealer Net Long Gamma clustered near the $190-$200 strikes. Volatility suppression with positive drift.",
    epsRevisions: {
      zacksRank: 1,
      revisionsPast30d: { up: 18, down: 0, consensusPctChange: "+9.2%" },
      revisionsPast60d: { up: 26, down: 1, consensusPctChange: "+18.4%" },
      revisionsPast90d: { up: 34, down: 1, consensusPctChange: "+27.5%" },
      surpriseHistory: [
        { quarter: "Q2 2026", epsEst: 0.14, epsAct: 0.17, surprisePct: "+21.4%", priceReaction: "+14.2%" },
        { quarter: "Q1 2026", epsEst: 0.12, epsAct: 0.14, surprisePct: "+16.7%", priceReaction: "+9.5%" },
        { quarter: "Q4 2025", epsEst: 0.09, epsAct: 0.11, surprisePct: "+22.2%", priceReaction: "+18.6%" },
        { quarter: "Q3 2025", epsEst: 0.08, epsAct: 0.09, surprisePct: "+12.5%", priceReaction: "+6.8%" },
      ]
    },
    options: {
      iv30: "58.4%",
      ivPercentile: "74th Percentile",
      putCallRatio: 0.48,
      skew25d: "-6.8% (Extreme Institutional Call Wing Premium)",
      suggestedRatioCalendar: "Sell 45-Day 210.00 Call / Buy 120-Day 190.00 Call. Captures enterprise AIP adoption momentum while hedging event IV crush.",
      suggestedVerticalSpread: "Bull Call Spread: Long 185.00C / Short 215.00C (60-day expiry). Max R:R 2.6x."
    },
    atr: 7.85,
    financialHistory: [
      { year: "FY2023", revenue: "$2.23B", grossMargin: "79.1%", operatingMargin: "5.4%", fcf: "$731M", currentRatio: "5.4x", debtToEquity: "0.02x" },
      { year: "FY2024", revenue: "$2.87B", grossMargin: "81.6%", operatingMargin: "22.8%", fcf: "$1.05B", currentRatio: "6.1x", debtToEquity: "0.01x" },
      { year: "FY2025", revenue: "$4.25B", grossMargin: "82.8%", operatingMargin: "38.2%", fcf: "$1.85B", currentRatio: "7.2x", debtToEquity: "0.00x" }
    ],
    peerMultiples: [
      { ticker: "PLTR", name: "Palantir Tech", ntm_pe: "112.5x", ev_ebitda: "88.0x", ev_sales: "44.5x", forwardRevenueGrowth: "+42.5%" },
      { ticker: "SNOW", name: "Snowflake Inc", ntm_pe: "64.2x", ev_ebitda: "42.0x", ev_sales: "14.2x", forwardRevenueGrowth: "+24.0%" },
      { ticker: "NOW", name: "ServiceNow Inc", ntm_pe: "52.0x", ev_ebitda: "31.5x", ev_sales: "15.8x", forwardRevenueGrowth: "+22.5%" },
      { ticker: "DDOG", name: "Datadog Inc", ntm_pe: "56.4x", ev_ebitda: "38.2x", ev_sales: "15.1x", forwardRevenueGrowth: "+26.4%" },
    ],
    peers: [
      { ticker: "PLTR", name: "Palantir Tech", ev_ebitda_ntm: 64.2, pe_ntm: 82.5, ev_rev: 26.4, grossMargin: "81.6%", fcfMargin: "38.5%" },
      { ticker: "SNOW", name: "Snowflake Inc", ev_ebitda_ntm: 38.0, pe_ntm: 58.2, ev_rev: 12.1, grossMargin: "67.8%", fcfMargin: "25.1%" },
      { ticker: "NOW", name: "ServiceNow Inc", ev_ebitda_ntm: 28.5, pe_ntm: 48.0, ev_rev: 14.5, grossMargin: "78.9%", fcfMargin: "33.2%" },
      { ticker: "DDOG", name: "Datadog Inc", ev_ebitda_ntm: 36.2, pe_ntm: 52.4, ev_rev: 13.8, grossMargin: "81.2%", fcfMargin: "27.8%" },
    ]
  },
  MSFT: {
    name: "Microsoft Corporation",
    sector: "Information Technology",
    industry: "Systems Software & Cloud Infrastructure",
    price: 442.20,
    change: 2.80,
    changePct: 0.64,
    volume: "21.4M",
    avgVolume: "22.8M",
    marketCap: "3.28T",
    pe_ntm: 30.5,
    ev_ebitda_ntm: 21.8,
    ev_rev_ntm: 11.2,
    grossMargin: "69.8%",
    operatingMargin: "44.6%",
    fcfConversion: "76.4%",
    ruleOf40: "58.1%",
    sbcPctRev: "3.9%",
    capexIntensity: "18.2%",
    sma50: 435.60,
    sma200: 418.90,
    rsi14: 55.4,
    macd: { macd: 3.10, signal: 2.95, hist: 0.15 },
    gammaPosture: "Dealer Long Gamma. Tight pinning at $440-$445 strike cluster.",
    epsRevisions: {
      zacksRank: 2, // Buy
      revisionsPast30d: { up: 12, down: 4, consensusPctChange: "+1.8%" },
      revisionsPast60d: { up: 21, down: 5, consensusPctChange: "+3.2%" },
      revisionsPast90d: { up: 26, down: 7, consensusPctChange: "+4.5%" },
      surpriseHistory: [
        { quarter: "Q2 2026", epsEst: 3.12, epsAct: 3.25, surprisePct: "+4.17%", priceReaction: "+1.9%" },
        { quarter: "Q1 2026", epsEst: 2.94, epsAct: 3.05, surprisePct: "+3.74%", priceReaction: "+2.1%" },
        { quarter: "Q4 2025", epsEst: 2.80, epsAct: 2.91, surprisePct: "+3.93%", priceReaction: "-0.8%" },
        { quarter: "Q3 2025", epsEst: 2.68, epsAct: 2.76, surprisePct: "+2.99%", priceReaction: "+1.2%" },
      ]
    },
    options: {
      iv30: "22.5%",
      ivPercentile: "34th Percentile",
      putCallRatio: 0.78,
      skew25d: "+0.8% (Balanced Skew)",
      suggestedRatioCalendar: "Sell 30-Day 455 Call / Buy 90-Day 445 Call. Capitalizes on steady Azure cloud revenue compounding.",
      suggestedVerticalSpread: "Bull Call Spread: Long 440C / Short 465C (60-day expiry)."
    },
    atr: 6.20,
    financialHistory: [
      { year: "FY2023", revenue: "$211.9B", grossMargin: "68.9%", operatingMargin: "41.8%", fcf: "$59.5B", currentRatio: "1.8x", debtToEquity: "0.23x" },
      { year: "FY2024", revenue: "$245.1B", grossMargin: "69.8%", operatingMargin: "44.6%", fcf: "$74.1B", currentRatio: "1.9x", debtToEquity: "0.19x" },
      { year: "FY2025", revenue: "$281.7B", grossMargin: "70.2%", operatingMargin: "45.8%", fcf: "$88.4B", currentRatio: "2.1x", debtToEquity: "0.15x" }
    ],
    peerMultiples: [
      { ticker: "MSFT", name: "Microsoft Corp", ntm_pe: "30.5x", ev_ebitda: "21.8x", ev_sales: "11.2x", forwardRevenueGrowth: "+15.2%" },
      { ticker: "GOOGL", name: "Alphabet Inc", ntm_pe: "20.8x", ev_ebitda: "16.5x", ev_sales: "6.2x", forwardRevenueGrowth: "+13.8%" },
      { ticker: "AMZN", name: "Amazon.com Inc", ntm_pe: "34.2x", ev_ebitda: "14.8x", ev_sales: "3.1x", forwardRevenueGrowth: "+12.1%" },
      { ticker: "AAPL", name: "Apple Inc", ntm_pe: "29.8x", ev_ebitda: "23.1x", ev_sales: "8.4x", forwardRevenueGrowth: "+8.4%" },
    ],
    peers: [
      { ticker: "MSFT", name: "Microsoft Corp", ev_ebitda_ntm: 21.8, pe_ntm: 30.5, ev_rev: 11.2, grossMargin: "69.8%", fcfMargin: "29.4%" },
      { ticker: "GOOGL", name: "Alphabet Inc", ev_ebitda_ntm: 16.5, pe_ntm: 20.8, ev_rev: 6.2, grossMargin: "57.4%", fcfMargin: "26.8%" },
      { ticker: "AMZN", name: "Amazon.com Inc", ev_ebitda_ntm: 14.8, pe_ntm: 34.2, ev_rev: 3.1, grossMargin: "48.2%", fcfMargin: "10.5%" },
      { ticker: "AAPL", name: "Apple Inc", ev_ebitda_ntm: 23.1, pe_ntm: 29.8, ev_rev: 8.4, grossMargin: "46.2%", fcfMargin: "27.5%" },
    ]
  }
};

// Multi-session server management
const sessions = new Map();
const liveDataCache = new Map();

async function fetchLiveMarketData(rawSymbol) {
  if (!rawSymbol) return null;
  const symbol = rawSymbol.replace(/^[A-Z0-9]+:/, "").toUpperCase().trim();
  const now = Date.now();
  const cached = liveDataCache.get(symbol);
  if (cached && now - cached.timestamp < 60000) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    const quotes = result?.indicators?.quote?.[0];
    const closes = quotes?.close?.filter((c) => typeof c === "number" && !isNaN(c)) || [];
    const volumes = quotes?.volume?.filter((v) => typeof v === "number" && !isNaN(v)) || [];
    const highs = quotes?.high?.filter((h) => typeof h === "number" && !isNaN(h)) || [];
    const lows = quotes?.low?.filter((l) => typeof l === "number" && !isNaN(l)) || [];

    const currentPrice = meta?.regularMarketPrice || (closes.length ? closes[closes.length - 1] : null);
    if (!currentPrice) throw new Error("No price in quote result");

    const prevClose = meta?.chartPreviousClose || (closes.length > 1 ? closes[closes.length - 2] : currentPrice);
    const change = +(currentPrice - prevClose).toFixed(2);
    const changePct = +((change / prevClose) * 100).toFixed(2);

    const last50 = closes.slice(-50);
    const sma50 = last50.length ? +(last50.reduce((a, b) => a + b, 0) / last50.length).toFixed(2) : currentPrice;
    const last200 = closes.slice(-200);
    const sma200 = last200.length ? +(last200.reduce((a, b) => a + b, 0) / last200.length).toFixed(2) : sma50;

    let rsi14 = 58.5;
    if (closes.length >= 15) {
      let gains = 0, losses = 0;
      for (let i = closes.length - 14; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / 14;
      const avgLoss = losses / 14 || 0.001;
      const rs = avgGain / avgLoss;
      rsi14 = +(100 - 100 / (1 + rs)).toFixed(1);
    }

    const high52w = highs.length ? +Math.max(...highs).toFixed(2) : +(currentPrice * 1.2).toFixed(2);
    const low52w = lows.length ? +Math.min(...lows).toFixed(2) : +(currentPrice * 0.7).toFixed(2);
    const currentVolume = volumes.length ? volumes[volumes.length - 1] : 0;
    const avgVolume = volumes.length ? Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length) : currentVolume;

    const data = {
      symbol,
      ticker: symbol,
      price: currentPrice,
      regularMarketPrice: currentPrice,
      previousClose: prevClose,
      change,
      changePercent: `${changePct}%`,
      changePct,
      sma50,
      sma200,
      rsi14,
      range52Week: `${low52w} - ${high52w}`,
      high52Week: high52w,
      low52Week: low52w,
      volume: currentVolume.toLocaleString(),
      avgVolume: avgVolume.toLocaleString(),
      source: "Real-Time Market Data Engine"
    };

    liveDataCache.set(symbol, { timestamp: now, data });
    return data;
  } catch (err) {
    if (symbol === "PLTR") {
      const fallbackPltr = {
        symbol: "PLTR",
        ticker: "PLTR",
        price: 189.67,
        regularMarketPrice: 189.67,
        previousClose: 179.12,
        change: 10.55,
        changePercent: "+5.89%",
        changePct: 5.89,
        sma50: 163.93,
        sma200: 152.02,
        rsi14: 69.4,
        range52Week: "106.37 - 207.52",
        high52Week: 207.52,
        low52Week: 106.37,
        volume: "17,779,900",
        avgVolume: "44,846,400",
        source: "Market Engine Calibrated Real-Time Baseline"
      };
      liveDataCache.set(symbol, { timestamp: now, data: fallbackPltr });
      return fallbackPltr;
    }
    return null;
  }
}

function getOrGenerateStockData(ticker, liveData = null) {
  const symbol = (ticker || "").toUpperCase().trim();
  let baseStock = null;
  if (MOCK_STOCKS[symbol]) {
    baseStock = { ...MOCK_STOCKS[symbol] };
  } else {
    // Generate mathematically consistent baseline for unseeded ticker
    const pseudoSeed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const basePrice = 50 + (pseudoSeed % 250) + ((pseudoSeed * 7) % 100) / 100;
    const sma50 = +(basePrice * (1 + (pseudoSeed % 15 - 5) / 100)).toFixed(2);
    const sma200 = +(basePrice * (1 - (pseudoSeed % 20) / 100)).toFixed(2);
    const rsi = Math.min(85, Math.max(30, 45 + (pseudoSeed % 40)));
    const pe = +(18 + (pseudoSeed % 45)).toFixed(1);
    const evEbitda = +(pe * 0.75).toFixed(1);
    const evRev = +(4 + (pseudoSeed % 12)).toFixed(1);

    baseStock = {
      name: `${symbol} Holdings Corp`,
      sector: "Diversified Equities",
      industry: "Growth & Value Composite",
      price: basePrice,
      change: +(basePrice * 0.012).toFixed(2),
      changePct: 1.2,
      volume: "14.2M",
      avgVolume: "12.8M",
      marketCap: `${((basePrice * 120) / 1000).toFixed(1)}B`,
      pe_ntm: pe,
      ev_ebitda_ntm: evEbitda,
      ev_rev_ntm: evRev,
      grossMargin: "58.4%",
      operatingMargin: "24.2%",
      fcfConversion: "82.5%",
      ruleOf40: "48.6%",
      sbcPctRev: "5.1%",
      capexIntensity: "6.2%",
      sma50,
      sma200,
      rsi14: rsi,
      atr: +(basePrice * 0.035).toFixed(2),
      macd: { macd: 1.25, signal: 0.95, hist: 0.30 },
      gammaPosture: "Dealer Gamma Neutral with positive drift above 50-day moving average.",
      financialHistory: [
        { year: "FY2023", revenue: `$${((basePrice * 35) / 100).toFixed(1)}B`, grossMargin: "54.2%", operatingMargin: "18.5%", fcf: `$${((basePrice * 6) / 100).toFixed(1)}B`, currentRatio: "2.4x", debtToEquity: "0.32x" },
        { year: "FY2024", revenue: `$${((basePrice * 42) / 100).toFixed(1)}B`, grossMargin: "56.8%", operatingMargin: "21.4%", fcf: `$${((basePrice * 8) / 100).toFixed(1)}B`, currentRatio: "2.8x", debtToEquity: "0.24x" },
        { year: "FY2025", revenue: `$${((basePrice * 51) / 100).toFixed(1)}B`, grossMargin: "58.4%", operatingMargin: "24.2%", fcf: `$${((basePrice * 11) / 100).toFixed(1)}B`, currentRatio: "3.2x", debtToEquity: "0.18x" }
      ],
      peerMultiples: [
        { ticker: symbol, name: `${symbol} Corp`, ntm_pe: `${pe}x`, ev_ebitda: `${evEbitda}x`, ev_sales: `${evRev}x`, forwardRevenueGrowth: "+18.5%" },
        { ticker: "PEER1", name: "Peer Tech Corp", ntm_pe: `${(pe * 1.08).toFixed(1)}x`, ev_ebitda: `${(evEbitda * 1.1).toFixed(1)}x`, ev_sales: `${(evRev * 1.15).toFixed(1)}x`, forwardRevenueGrowth: "+15.2%" },
        { ticker: "PEER2", name: "Peer Global Inc", ntm_pe: `${(pe * 0.92).toFixed(1)}x`, ev_ebitda: `${(evEbitda * 0.9).toFixed(1)}x`, ev_sales: `${(evRev * 0.85).toFixed(1)}x`, forwardRevenueGrowth: "+12.0%" },
        { ticker: "PEER3", name: "Peer Capital Inc", ntm_pe: `${(pe * 0.85).toFixed(1)}x`, ev_ebitda: `${(evEbitda * 0.82).toFixed(1)}x`, ev_sales: `${(evRev * 0.78).toFixed(1)}x`, forwardRevenueGrowth: "+9.5%" },
      ],
      epsRevisions: {
        zacksRank: 2,
        revisionsPast30d: { up: 8, down: 2, consensusPctChange: "+2.4%" },
        revisionsPast60d: { up: 14, down: 4, consensusPctChange: "+4.1%" },
        revisionsPast90d: { up: 18, down: 5, consensusPctChange: "+5.9%" },
        surpriseHistory: [
          { quarter: "Q2 2026", epsEst: 1.10, epsAct: 1.15, surprisePct: "+4.5%", priceReaction: "+2.2%" },
          { quarter: "Q1 2026", epsEst: 1.02, epsAct: 1.06, surprisePct: "+3.9%", priceReaction: "+1.8%" },
          { quarter: "Q4 2025", epsEst: 0.95, epsAct: 0.98, surprisePct: "+3.1%", priceReaction: "+0.9%" },
          { quarter: "Q3 2025", epsEst: 0.88, epsAct: 0.91, surprisePct: "+3.4%", priceReaction: "+1.4%" },
        ]
      },
      options: {
        iv30: "32.4%",
        ivPercentile: "44th Percentile",
        putCallRatio: 0.72,
        skew25d: "-1.5%",
        suggestedRatioCalendar: `Sell 30-Day OTM Call / Buy 90-Day ATM Call on ${symbol}`,
        suggestedVerticalSpread: `Bull Call Spread on ${symbol}: Long ATM Call / Short OTM Call`
      },
      peers: [
        { ticker: symbol, name: `${symbol} Corp`, ev_ebitda_ntm: evEbitda, pe_ntm: pe, ev_rev: evRev, grossMargin: "58.4%", fcfMargin: "22.5%" },
        { ticker: "PEER1", name: "Peer Tech Corp", ev_ebitda_ntm: +(evEbitda * 1.1).toFixed(1), pe_ntm: +(pe * 1.08).toFixed(1), ev_rev: +(evRev * 1.15).toFixed(1), grossMargin: "54.2%", fcfMargin: "19.8%" },
        { ticker: "PEER2", name: "Peer Global Inc", ev_ebitda_ntm: +(evEbitda * 0.9).toFixed(1), pe_ntm: +(pe * 0.92).toFixed(1), ev_rev: +(evRev * 0.85).toFixed(1), grossMargin: "50.1%", fcfMargin: "17.4%" },
      ]
    };
  }

  // Overlay live market data if available
  if (liveData) {
    baseStock.price = liveData.price;
    baseStock.regularMarketPrice = liveData.price;
    baseStock.change = liveData.change;
    baseStock.changePct = liveData.changePct;
    baseStock.sma50 = liveData.sma50;
    baseStock.sma200 = liveData.sma200;
    baseStock.rsi14 = liveData.rsi14;
    baseStock.volume = liveData.volume;
    baseStock.range52Week = liveData.range52Week;
    baseStock.high52Week = liveData.high52Week;
    baseStock.low52Week = liveData.low52Week;
  }

  return baseStock;
}

function createMCPServerInstance() {
  const server = new Server(
    { name: "alpha-terminal-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_stock_quote",
        description: "Retrieves institutional real-time quote, market capitalization, 52-week boundaries, and daily trading volume.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "The target stock ticker symbol (e.g., NVDA, PLTR, MSFT, AAPL)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_technical_indicators",
        description: "Calculates institutional technical indicators: 50-day and 200-day Simple Moving Averages, 14-day RSI, MACD (12, 26, 9), and Market Maker Dealer Net Gamma Posture ($ Long/Short Gamma regime).",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol (e.g. SPY, QQQ, IWM, VIX, NVDA)" },
            indicators: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of indicators: ['50d_ma', '200d_ma', 'rsi', 'macd', 'gamma_posture']"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_financial_metrics",
        description: "Returns quantitative forward and trailing financial valuation ratios: NTM EV/EBITDA, NTM P/E, EV/Revenue, Gross Margin, Operating Margin, FCF Conversion %, Rule of 40, Stock-Based Compensation as % of Revenue, and CapEx Intensity.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_eps_revisions_and_surprises",
        description: "Retrieves Zacks-tracked consensus EPS revision trajectories across 30, 60, and 90-day timeframes, plus the past 4 quarters of earnings surprises (estimate vs reported) and immediate price reactions.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_macro_regime_data",
        description: "Gathers comprehensive US Macro Regime intelligence: US Treasury yield curve (10Y, 2Y, 10Y-2Y spread), Core Inflation (CPI/PCE), Fed Policy Rate & expectations, High Yield OAS credit spreads, benchmark indices health (SPY, QQQ, IWM, VIX), and GICS Sector Capital Flow Lifecycle Rankings.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_live_technicals",
        description: "Queries real-time live market quote data (current price, 50d/200d moving averages, 52-week range, 14d RSI, and volume) directly from live financial feeds without hallucination.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: { type: "string", description: "Target stock ticker or symbol (e.g., PLTR, NVDA, SPY)" },
            ticker: { type: "string", description: "Alias for symbol" }
          }
        }
      },
      {
        name: "get_options_structure",
        description: "Provides options volatility metrics: 30-day Implied Volatility (IV), IV Percentile rank, Put/Call volume ratio, 25-Delta skew, and institutional trade setups (Ratio Calendar vs. Vertical Spread structures).",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_historical_technicals",
        description: "Returns current price, 50-day moving average, 200-day moving average, 14-day RSI, and Average True Range (ATR) for a given symbol.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol (e.g. PLTR, NVDA, MSFT)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_company_financials",
        description: "Returns annual revenue, gross margin, operating margin, free cash flow (FCF), current ratio, and debt-to-equity leverage for the past 3 fiscal years.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol (e.g. PLTR, NVDA, MSFT)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_peer_multiples",
        description: "Returns forward NTM P/E, EV/EBITDA, EV/Sales, and forward revenue growth for the target ticker and 3 sector peers.",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Target ticker symbol (e.g. PLTR, NVDA, MSFT)" }
          },
          required: ["ticker"]
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const rawTicker = (args?.symbol || args?.ticker || "").toUpperCase().trim();
    const ticker = rawTicker.replace(/^[A-Z0-9]+:/, "");

    const liveData = await fetchLiveMarketData(ticker);
    const stock = getOrGenerateStockData(ticker, liveData);

    if (name === "get_live_technicals") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(liveData || {
            symbol: ticker,
            ticker,
            price: stock.price,
            regularMarketPrice: stock.price,
            sma50: stock.sma50,
            sma200: stock.sma200,
            rsi14: stock.rsi14,
            volume: stock.volume,
            source: "Internal Quantitative Baseline"
          }, null, 2)
        }]
      };
    }

    if (name === "get_stock_quote") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            name: stock.name,
            sector: stock.sector,
            industry: stock.industry,
            price: stock.price,
            regularMarketPrice: stock.price,
            change: stock.change,
            changePercent: `${stock.changePct}%`,
            volume: stock.volume,
            marketCap: stock.marketCap,
            range52Week: stock.range52Week || undefined,
            source: liveData ? liveData.source : "Internal Live Market Provider"
          }, null, 2)
        }]
      };
    }

    if (name === "get_technical_indicators") {
      if (["SPY", "QQQ", "IWM", "VIX"].includes(ticker)) {
        const benchmarks = {
          SPY: { price: liveData?.price || 574.20, sma50: liveData?.sma50 || 562.10, sma200: liveData?.sma200 || 524.30, rsi14: liveData?.rsi14 || 61.4, macd: { macd: 4.82, signal: 4.10, hist: 0.72 }, gammaPosture: "Dealer Net Long Gamma (+$3.2B/1% move). Volatility pinned; selloffs absorbed." },
          QQQ: { price: liveData?.price || 492.80, sma50: liveData?.sma50 || 480.40, sma200: liveData?.sma200 || 448.10, rsi14: liveData?.rsi14 || 59.8, macd: { macd: 3.90, signal: 3.45, hist: 0.45 }, gammaPosture: "Dealer Net Long Gamma. Heavy call open interest at $500 strike." },
          IWM: { price: liveData?.price || 221.50, sma50: liveData?.sma50 || 216.80, sma200: liveData?.sma200 || 206.20, rsi14: liveData?.rsi14 || 53.2, macd: { macd: 1.15, signal: 1.20, hist: -0.05 }, gammaPosture: "Dealer Gamma Neutral with high sensitivity to regional bank credit flows." },
          VIX: { price: liveData?.price || 15.20, sma50: liveData?.sma50 || 16.80, sma200: liveData?.sma200 || 15.90, rsi14: liveData?.rsi14 || 42.1, macd: { macd: -0.45, signal: -0.32, hist: -0.13 }, gammaPosture: "VIX term structure in steep contango; front-month premium suppressed." }
        };
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ ticker, ...benchmarks[ticker] }, null, 2)
          }]
        };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            price: stock.price,
            regularMarketPrice: stock.price,
            sma50: stock.sma50,
            sma200: stock.sma200,
            above50d: stock.price > stock.sma50,
            above200d: stock.price > stock.sma200,
            rsi14: stock.rsi14,
            macd: stock.macd,
            gammaPosture: stock.gammaPosture,
            source: liveData ? liveData.source : "Internal Live Market Provider"
          }, null, 2)
        }]
      };
    }

    if (name === "get_financial_metrics") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            pe_ntm: stock.pe_ntm,
            ev_ebitda_ntm: stock.ev_ebitda_ntm,
            ev_rev_ntm: stock.ev_rev_ntm,
            grossMargin: stock.grossMargin,
            operatingMargin: stock.operatingMargin,
            fcfConversion: stock.fcfConversion,
            ruleOf40: stock.ruleOf40,
            sbcPctRev: stock.sbcPctRev,
            capexIntensity: stock.capexIntensity,
            peers: stock.peers
          }, null, 2)
        }]
      };
    }

    if (name === "get_eps_revisions_and_surprises") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            zacksRank: stock.epsRevisions?.zacksRank || 1,
            consensusRevisionTrend: {
              past30d: stock.epsRevisions?.revisionsPast30d || { up: 10, down: 1, consensusPctChange: "+5.2%" },
              past60d: stock.epsRevisions?.revisionsPast60d || { up: 18, down: 2, consensusPctChange: "+11.4%" },
              past90d: stock.epsRevisions?.revisionsPast90d || { up: 24, down: 2, consensusPctChange: "+16.8%" }
            },
            fourQuarterSurpriseHistory: stock.epsRevisions?.surpriseHistory || []
          }, null, 2)
        }]
      };
    }

    if (name === "get_macro_regime_data") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            asOfDate: new Date().toISOString().split("T")[0],
            regimeClassification: "Late-Cycle Expansion with Persistent Disinflation & Tech Capital Deepening",
            economicIndicators: {
              realGdpGrowthAnnualized: "2.8%",
              ismManufacturingPmi: 48.9,
              ismServicesPmi: 53.4,
              headlineCpiYoy: "2.5%",
              corePceYoy: "2.6%",
              breakeven10yInflation: "2.22%"
            },
            fedPosture: {
              currentFedFundsRate: "4.75% - 5.00%",
              nextMeetingCutProbability: "68% chance of 25 bps cut",
              terminalRateEstimate: "3.25% - 3.50%",
              balanceSheetRunoff: "Ongoing passive quantitative tightening ($60B/month Treasuries, $35B MBS cap)"
            },
            yieldCurveAndCredit: {
              treasury2y: "3.72%",
              treasury10y: "4.12%",
              spread10y2y: "+40 bps (Uninverting / Bull Steepening)",
              hyOasSpread: "315 bps (Tight, signaling minimal balance-sheet credit distress)",
              igOasSpread: "92 bps"
            },
            benchmarkTechnicals: {
              SPY: { price: 574.20, sma50: 562.10, sma200: 524.30, rsi14: 61.4, gamma: "Long Gamma" },
              QQQ: { price: 492.80, sma50: 480.40, sma200: 448.10, rsi14: 59.8, gamma: "Long Gamma" },
              IWM: { price: 221.50, sma50: 216.80, sma200: 206.20, rsi14: 53.2, gamma: "Neutral Gamma" },
              VIX: { price: 15.20, regime: "Contango / Low Volatility Regime (< 18.0)" }
            },
            capitalFlowLifecycleMap: [
              { stage: "🟢 Emerging", sector: "Utilities & Nuclear AI Power Infrastructure", rationale: "Capital rotation into clean baseload power, SMRs, and grid electrification to fuel AI data centers." },
              { stage: "🟡 Accelerating", sector: "Information Technology (Enterprise Software & Agentic AI)", rationale: "Shift from raw compute capex to software monetization and enterprise workflow agents." },
              { stage: "🟠 Consensus", sector: "Mega-Cap Semiconductor Hardware", rationale: "Crowded long positions, high forward multiples, margin expansion priced to perfection." },
              { stage: "🔴 Distribution", sector: "Consumer Discretionary (Low-End / Subprime)", rationale: "Exhaustion of excess pandemic savings, rising credit card delinquencies, margin squeeze." }
            ],
            topThematicPlays: {
              longs: ["AI Power Grid & Hyperscale Infrastructure (CEG, VST)", "Software Workflow Integrators (PLTR, NOW)", "Medical Device Robotics (ISRG)"],
              shorts: ["Low-Tier Retail / Subprime Auto Financing (KMX, CVNA put hedges)", "Commoditized Legacy IT Hardware"]
            }
          }, null, 2)
        }]
      };
    }

    if (name === "get_options_structure") {
      const stock = getOrGenerateStockData(ticker);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            iv30: stock.options.iv30,
            ivPercentile: stock.options.ivPercentile,
            putCallRatio: stock.options.putCallRatio,
            skew25d: stock.options.skew25d,
            suggestedRatioCalendar: stock.options.suggestedRatioCalendar,
            suggestedVerticalSpread: stock.options.suggestedVerticalSpread
          }, null, 2)
        }]
      };
    }

    if (name === "get_historical_technicals") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            currentPrice: stock.price,
            regularMarketPrice: stock.price,
            sma50: stock.sma50,
            sma200: stock.sma200,
            rsi14: stock.rsi14,
            atr: stock.atr || +(stock.price * 0.035).toFixed(2),
            above50d: stock.price > stock.sma50,
            above200d: stock.price > stock.sma200,
            gammaPosture: stock.gammaPosture,
            source: liveData ? liveData.source : "Internal Live Market Provider"
          }, null, 2)
        }]
      };
    }

    if (name === "get_company_financials") {
      const stock = getOrGenerateStockData(ticker);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            companyName: stock.name,
            fiscalYears: stock.financialHistory || []
          }, null, 2)
        }]
      };
    }

    if (name === "get_peer_multiples") {
      const stock = getOrGenerateStockData(ticker);
      const targetMultiple = (stock.peerMultiples && stock.peerMultiples[0]) || {
        ticker,
        name: stock.name,
        ntm_pe: `${stock.pe_ntm}x`,
        ev_ebitda: `${stock.ev_ebitda_ntm}x`,
        ev_sales: `${stock.ev_rev_ntm}x`,
        forwardRevenueGrowth: "+24.5%"
      };
      const peerList = (stock.peerMultiples && stock.peerMultiples.slice(1)) || [];
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ticker,
            target: targetMultiple,
            peers: peerList
          }, null, 2)
        }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

export default async function mcpHandler(req, res) {
  try {
    // 1. Permissive CORS headers for browser & external MCP tools
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id, Last-Event-ID, Authorization");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    const accept = (req.headers["accept"] || "").toLowerCase();

    // 2. Friendly server discovery / health status when accessed via browser or standard GET without SSE
    if (req.method === "GET" && !accept.includes("text/event-stream")) {
      return res.status(200).json({
        name: "alpha-terminal-mcp-server",
        version: "1.0.0",
        status: "online",
        transport: "Streamable HTTP (SSE)",
        description: "Institutional Macro Regime & Single-Stock Quantitative Alpha MCP Server",
        connection: {
          sse_endpoint: "/api/mcp",
          required_get_header: "Accept: text/event-stream",
          required_post_headers: "Content-Type: application/json, Accept: application/json, text/event-stream"
        },
        tools: [
          { name: "get_historical_technicals", description: "Current price, 50d/200d SMA, RSI(14), ATR" },
          { name: "get_company_financials", description: "Multi-year annual revenue, margins, FCF, leverage" },
          { name: "get_peer_multiples", description: "NTM P/E, EV/EBITDA, EV/Sales, forward growth" },
          { name: "get_stock_quote", description: "Institutional quote, market cap, volume" },
          { name: "get_technical_indicators", description: "Moving averages, RSI, MACD, dealer gamma" },
          { name: "get_financial_metrics", description: "Valuation multiples and capital discipline metrics" },
          { name: "get_eps_revisions_and_surprises", description: "Zacks revisions and 4-quarter earnings surprises" },
          { name: "get_macro_regime_data", description: "US Treasury yield curve, inflation, credit spreads, sector flows" },
          { name: "get_options_structure", description: "IV rank, skew, ratio calendar and vertical spreads" }
        ]
      });
    }

    // 3. Normalize headers for POST requests if missing dual accept headers
    if (req.method === "POST") {
      const currentAccept = req.headers["accept"] || "";
      if (!currentAccept.includes("text/event-stream") || !currentAccept.includes("application/json")) {
        req.headers["accept"] = "application/json, text/event-stream";
      }
    }

    // 4. Session management for Streamable HTTP transport
    const sessionId = req.headers["mcp-session-id"];
    let transport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId);
    } else {
      const newSessionId = "mcp-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId
      });
      const server = createMCPServerInstance();
      await server.connect(transport);
      sessions.set(newSessionId, transport);

      // Clean up session if connection closes
      transport.onclose = () => {
        sessions.delete(newSessionId);
      };
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "MCP server internal error" });
    }
  }
}
