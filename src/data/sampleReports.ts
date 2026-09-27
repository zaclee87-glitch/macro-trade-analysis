import { ToolCall, UnavailableServer } from "../types.ts";

export const SAMPLE_MACRO_REPORT = `# Top-Down US Equity Macro Regime, Market Health & Capital Flow Strategy
**Execution Horizon:** 2-3 Months (Tactical Swing & Sector Rotation)  
**Regime Classification:** Late-Cycle Expansion with Persistent Disinflation & Tech Capital Deepening  
**Portfolio Posture:** Modest Net Long (+35% Net Beta), Barbell Growth/Quality & Power Infrastructure, Active Gamma Pin Hedging

---

### Phase 1: Macro Regime & Monetary Liquidity Pulse
- **Real GDP Growth:** Annualized **2.8%**, supported by corporate productivity improvements and sustained tech capex spending.
- **PMI Dispersion:** ISM Manufacturing at **48.9** (mild contraction) vs. ISM Services at **53.4** (resilient expansion). The services buffer continues to shield domestic aggregate demand.
- **Inflation Vector:** Headline CPI at **2.5% YoY**, Core PCE at **2.6% YoY**, and 10-Year Breakeven Inflation anchored at **2.22%**. Forward inflation risk is skewed toward tariff implementation rather than wage-push spiraling.
- **Federal Reserve Policy Posture:**
  - Target Range: **4.75% - 5.00%**.
  - Market-implied odds indicate an **68% probability** of a 25 bps rate cut at the next FOMC cycle.
  - Implied Terminal Rate: **3.25% - 3.50%**.
  - Balance Sheet Runoff (QT): Continuing at **$60B/month Treasuries** and **$35B MBS cap**, steadily draining non-bank liquidity reserves.
- **Credit Health & Spreads:** US High Yield OAS is pinned at **315 bps** (near cyclical lows), indicating zero balance-sheet distress across speculative-grade issuers. Investment Grade OAS is tightly compressed at **92 bps**.
- **Fiscal & Geopolitical Headwinds:** Treasury quarterly refunding auctions remain heavily weighted toward bills, preserving duration appetite while keeping the 10-Year yield range-bound between 3.85% and 4.25%.

---

### Phase 2: Benchmark Technical Health & Dealer Gamma Positioning

| Benchmark | Price | 50d SMA | 200d SMA | RSI (14) | MACD Posture | Dealer Net Gamma Regime |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SPY** | $574.20 | $562.10 | $524.30 | 61.4 | Bullish Expansion (+0.72) | **+$3.2B / 1% Long Gamma** (Vol suppression above $565) |
| **QQQ** | $492.80 | $480.40 | $448.10 | 59.8 | Bullish Momentum (+0.45) | **+$2.1B / 1% Long Gamma** (Heavy $500 strike magnet) |
| **IWM** | $221.50 | $216.80 | $206.20 | 53.2 | Consolidation (-0.05) | **Neutral Gamma** (Refinancing wall sensitivity) |
| **VIX** | 15.20 | 16.80 | 15.90 | 42.1 | Negative Slope | **Steep Contango** (Front-month vol suppressed) |

**Dealer Positioning Read:** As long as SPY remains above the $565 Gamma Flip line, market makers remain aggressive buyers of intraday dips and sellers of rips, producing compressed realized volatility. A close below $560 triggers Short Gamma acceleration.

---

### Phase 3: Institutional Capital Flow Map & Flow Lifecycle Matrix

| Lifecycle Stage | Theme / Sector | Institutional Drivers & Thesis |
| :--- | :--- | :--- |
| 🟢 Emerging | **Nuclear & Baseload AI Power Grid** | Accelerating hyper-scaler PPA agreements (Constellation, Vistra, SMR plays) to satisfy 24/7 unconstrained datacenter electricity demand. |
| 🟡 Accelerating | **Enterprise Agentic Software** | Monetization shifting from training cluster hardware to software seat expansions, custom enterprise workflows, and autonomous operational agents. |
| 🟠 Consensus | **Mega-Cap AI Accelerators** | Heavily crowded long book; valuation multiples pricing in multi-year margin durability; asymmetric risk on any supply-chain capex pauses. |
| 🔴 Distribution | **Low-End Consumer & Subprime Auto** | Real wage stagnation among lower-income quartiles, exhaustion of liquid savings, rising credit delinquencies, and discounting pressures. |

---

### Phase 4: GICS Sector Rankings & Tactical Long/Short Pair Baskets

**Ranked Expected Sector Performance (Next 2-3 Months):**
1. **Utilities (XLU)** - High conviction (Grid buildout, rate-cut duration play)
2. **Information Technology (XLK)** - Overweight (Software inflection)
3. **Financials (XLF)** - Overweight (Steepening yield curve, M&A fee recovery)
4. **Industrials (XLI)** - Neutral / Overweight (Electrification capex)
5. **Communication Services (XLC)** - Neutral
6. **Health Care (XLV)** - Neutral (Defensive tilt, selective medtech)
7. **Consumer Staples (XLP)** - Underweight (Lack of pricing power)
8. **Materials (XLB)** - Underweight (China demand headwinds)
9. **Energy (XLE)** - Underweight (OPEC+ spare capacity overhang)
10. **Real Estate (XLRE)** - Underweight (Office refinancing friction)
11. **Consumer Discretionary (XLY)** - Underweight (Bifurcated consumer spending)

**Actionable Pair Trade Baskets:**
- **Long Basket:** CEG, VST, PLTR, NOW, JPM
- **Short / Hedge Basket:** KMX, CVNA, BBY, LOW

---

### Phase 5: Cross-Asset Thematic Plays & Tail Risk Hedging
- **Rates (Yield Curve 2s10s):** Maintain **Bull Steepener** positioning. Short-end yields will compress faster as the Fed cuts towards the neutral rate.
- **FX (USD/DXY):** Neutral to Bearish DXY bias toward 100.50 level.
- **Asymmetric Tail Risk Flag:** A sudden spike in oil over $85/bbl paired with a 10Y Treasury yield breakout above 4.40% would break the current positive correlation regime.
- **Tail Hedge:** Buy 60-day SPY 540 / 510 Put Spread (funded by selling 60-day SPY 605 Call) for net zero cost.`;

export const SAMPLE_MACRO_TOOL_CALLS: ToolCall[] = [
  {
    name: "get_macro_regime_data",
    args: {},
    status: "success",
    timestamp: "2026-09-26T11:15:32.412Z"
  },
  {
    name: "get_technical_indicators",
    args: { ticker: "SPY", indicators: ["50d_ma", "200d_ma", "rsi", "macd", "gamma_posture"] },
    status: "success",
    timestamp: "2026-09-26T11:15:33.104Z"
  },
  {
    name: "get_technical_indicators",
    args: { ticker: "QQQ", indicators: ["50d_ma", "200d_ma", "rsi", "macd", "gamma_posture"] },
    status: "success",
    timestamp: "2026-09-26T11:15:33.821Z"
  },
  {
    name: "get_technical_indicators",
    args: { ticker: "IWM", indicators: ["50d_ma", "200d_ma", "rsi", "macd", "gamma_posture"] },
    status: "success",
    timestamp: "2026-09-26T11:15:34.502Z"
  }
];

export const SAMPLE_TICKER_REPORT = `# Individual Stock Trade Report & Structural Alpha Deep Dive: PLTR
**Company:** Palantir Technologies Inc. (NYSE: PLTR)  
**Target Horizon:** 2-3 Months  
**Current Price:** $189.67 | **Market Cap:** $432.5B | **Zacks Rank:** #1 (Strong Buy)

---

### 1. Executive Presentation Summary
- **Thesis 1 (AIP Flywheel):** Palantir's Artificial Intelligence Platform (AIP) bootcamps continue to compress enterprise sales cycles from 9 months to under 14 days, creating a self-reinforcing deployment velocity.
- **Thesis 2 (Operating Leverage Inflection):** Rule of 40 score of **84.2%** combined with a GAAP operating margin expansion to **38.2%** demonstrates that AIP scaling requires near-zero marginal software distribution capex.
- **Thesis 3 (Government Defense Moat):** Deep-rooted integration into US DoD Maven and TITAN architectures establishes an irreplaceable multi-decade revenue floor that commercial competitors cannot penetrate.
- **Actionable Verdict:** **TACTICAL LONG** | Conviction Rating: **8.5 / 10** | 3-Month Target: **$215.00 (+13.4%)**

---

### 2. Business Model & Core Monetization Engine
- **US Commercial Business:** Revenue accelerating at **+55% YoY**, driven by enterprise AIP conversions.
- **Government Segment:** Expanding at **+23% YoY**, driven by major contract expansions across defense and intelligence agencies.
- **Unit Economics:** Net Dollar Retention Rate exceeds **124%** in US Commercial, with average customer value expanding over 3.2x by Year 3 of deployment.

---

### 3. Structural Moat & AI Defensibility / Displacement Matrix
- **Data Ontology Moat:** Palantir does not build LLMs; it provides the mission-critical ontological pipeline that enables enterprise LLMs to interact with secure operational databases without hallucinations.
- **Switching Friction:** Extremely high; ripping out Palantir Gotham/Foundry requires rewriting the enterprise data architecture and workflow pipelines.
- **AI Displacement Risk:** **Extremely Low (Defensible Beneficiary)**. As new open-source models proliferate, Palantir's model-agnostic ontology becomes more valuable, not obsolete.

---

### 4. Comprehensive Financial Quality & Capital Discipline

| Financial Metric | Reported Value | Benchmark Comparison | Institutional Quality Assessment |
| :--- | :--- | :--- | :--- |
| **Gross Margin** | **81.6%** | Peer Median: 71.0% | Tier-1 Software Gross Profitability |
| **Operating Margin** | **34.5%** | Peer Median: 18.5% | Exceptional GAAP Operating Leverage |
| **FCF Conversion** | **112.4%** | Peer Median: 75.0% | High Cash Conversion via Pre-paid Contracts |
| **Rule of 40 Score** | **78.2%** | Standard Threshold: 40.0% | Elite SaaS Financial Efficiency |
| **SBC % of Revenue** | **14.2%** | Historical: 32.0% | Substantial Discipline & Dilution Deceleration |
| **CapEx Intensity** | **1.2%** | Peer Median: 4.5% | Asset-Light Scalability |

---

### 5. Forward Multiples & Peer Benchmarking Table

| Ticker | Company Name | NTM EV/EBITDA | NTM P/E | EV / Revenue | Gross Margin | FCF Margin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PLTR** | **Palantir Technologies** | **64.2x** | **82.5x** | **26.4x** | **81.6%** | **38.5%** |
| **SNOW** | Snowflake Inc. | 38.0x | 58.2x | 12.1x | 67.8% | 25.1% |
| **NOW** | ServiceNow Inc. | 28.5x | 48.0x | 14.5x | 78.9% | 33.2% |
| **DDOG** | Datadog Inc. | 36.2x | 52.4x | 13.8x | 81.2% | 27.8% |

**Valuation Assessment:** PLTR commands an unmistakable scarcity premium. The multiple is elevated, but supported by superior growth acceleration and FCF conversion.

---

### 6. Consensus EPS Revision Trajectory (Zacks Tracking)
- **30-Day Revision Trend:** 14 Upward Revisions vs. 0 Downward (+7.4% consensus increase).
- **60-Day Revision Trend:** 22 Upward Revisions vs. 1 Downward (+14.6% consensus increase).
- **90-Day Revision Trend:** 28 Upward Revisions vs. 2 Downward (+21.0% consensus increase).
- **Earnings Momentum Read:** Relentless institutional upward revisions indicate continuous buy-side model adjustments ahead of quarterly prints.

---

### 7. 4-Quarter Earnings Surprise History

| Quarter | Est EPS | Act EPS | Surprise % | Post-Earnings Price Move |
| :--- | :--- | :--- | :--- | :--- |
| **Q2 2026** | $0.09 | $0.11 | **+22.2%** | **+11.4%** |
| **Q1 2026** | $0.08 | $0.09 | **+12.5%** | **+7.8%** |
| **Q4 2025** | $0.07 | $0.08 | **+14.3%** | **+14.2%** |
| **Q3 2025** | $0.06 | $0.07 | **+16.7%** | **+5.1%** |

---

### 8. Quantitative Technical Indicators
- **Current Price:** $189.67
- **50-Day SMA:** $163.90 (Price is +15.7% above 50d SMA)
- **200-Day SMA:** $152.00 (Price is +24.8% above 200d SMA)
- **14-Day RSI:** **69.4** (Constructive bull-market momentum; consolidating near upper band)
- **MACD (12, 26, 9):** MACD Line: 5.42, Signal: 4.10, Histogram: +1.32 (Expanding bullish momentum)

---

### 9. Dealer Gamma Posture & Liquidity Dynamics
- **Gamma Regime:** **Dealer Net Long Gamma** clustered heavily around the $190-$200 strikes.
- **Hedging Dynamics:** Market makers are actively absorbing dips back toward $178-$180. A sustained breakout above $200 triggers an accelerating dealer short-covering gamma squeeze into the $215-$220 zone.

---

### 10. Alpha vs. Benchmark (QQQ / IGV)
- **Relative Strength:** Outperforming QQQ by **+42.4%** and IGV (Tech-Software ETF) by **+58.2%** over a trailing 6-month window.
- **Alpha Verdict:** Pure structural alpha driver; stock moves on idiosyncratic AIP contract milestones rather than broad tech beta.

---

### 11. 3-Scenario Valuation Table

| Scenario | Probability | Target Multiples | Implied Target | Implied Return | Key Catalysts & Assumptions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bear Case** | 20% | 75x NTM P/E, 28x EV/Rev | **$145.00** | **-23.5%** | Federal spending delays, broader multiple contraction across high-beta tech. |
| **Base Case** | 55% | 110x NTM P/E, 42x EV/Rev | **$215.00** | **+13.4%** | US Commercial revenue maintains 50%+ YoY pace; steady institutional passive inflows. |
| **Bull Case** | 25% | 135x NTM P/E, 54x EV/Rev | **$260.00** | **+37.1%** | Multi-billion NATO autonomous defense contract signed; enterprise AIP becomes default enterprise AI operating system. |

**Probability-Weighted Expected Value:** **$212.25 (+11.9% Expected Alpha)**

---

### 12. Key Catalysts (0-12 Months)
- **0-3 Months:** Next earnings announcement with US Commercial customer count metrics; AIP developer conference updates.
- **3-12 Months:** Expansion of government Project Maven deployment into allied NATO defense ministries; potential inclusion in key mega-cap institutional indices.

---

### 13. Primary Risk Factors & Mitigants
- **Risk 1:** Multiples compression in a higher-for-longer bond yield spike. *Mitigant: Net cash balance sheet with over $4.2B in Treasury bills yielding ~4.5%.*
- **Risk 2:** Insider stock sales under Rule 10b5-1 plans. *Mitigant: Strong passive index fund accumulation absorbs supply.*

---

### 14. Derivative Volatility & Options Trade Structure
- **30-Day Implied Volatility (IV):** **58.4%** (74th IV Percentile)
- **Put/Call Ratio:** **0.48** (Strong institutional call bias)
- **25-Delta Skew:** -6.8% (OTM calls trade at premium to OTM puts)

**Recommended Options Trade Structures:**
- **Structure A: Ratio Calendar Spread (High Conviction)**
  - Sell 45-Day OTM 210.00 Call against Buying 120-Day 190.00 Call for a net debit of ~$8.40.
  - *Rationale:* Harvests elevated near-term implied volatility while locking in convex long exposure for the multi-quarter AIP rollout.
- **Structure B: Defined-Risk Vertical Bull Call Spread**
  - Buy 60-Day 185.00 Call / Sell 60-Day 215.00 Call for ~$11.20 debit. Max Reward: $18.80 (1.68x R:R).

---

### 15. Executive Tear-Sheet & "10-Second Pitch" Snapshot
**\`PLTR\` (\`Palantir Technologies Inc.\`) — \`[Long]\`, \`[Enterprise AI & Defense Software]\`**
* **Product:** Mission-critical enterprise ontology platform (Foundry, Gotham, AIP) that operationalizes proprietary customer data with LLMs. Creates insurmountable switching costs by integrating directly into core enterprise and defense decision loops.
* **What's happening:** GAAP operating margins inflecting to 38.2%, US Commercial revenue accelerating +55% YoY, FCF conversion at 118%, and Zacks Consensus EPS revisions surging +27% over 90 days.
* **Catalysts:**
  - \`[Earnings / Hurdle]\` — Upcoming Q3 2026 earnings with US commercial customer count hurdle of >450 enterprise clients.
  - \`[Commercial / Adoption]\` — 5-day AIP boot camp conversion rate to 7-figure annual recurring revenue contracts.
  - \`[Operational / Milestone]\` — Full-scale battlefield rollout of DoD Project Maven Smart System and TITAN prototypes.
  - \`[Capital Structure / Financing]\` — Debt-free balance sheet with >$4.2B in liquid Treasury cash generating accretive net interest income.
* **10 seconds:** *"Palantir is the de facto operating system for enterprise and defense AI, converting complex multi-year deployments into 14-day AIP bootcamps that lock in customers forever. With 82%+ gross margins, accelerating US commercial growth, and an irreplaceable defense ontology moat, this is an elite structural compounder for the AI infrastructure era."*`;

export const SAMPLE_TICKER_METADATA = {
  valuationScenarios: {
    currentPrice: 189.67,
    bear: {
      targetPrice: 145.00,
      upsidePct: -23.5,
      multiple: "75x NTM P/E, 28x EV/Rev",
      probability: 20,
      catalysts: "Federal spending delays, broader multiple contraction across high-beta tech."
    },
    base: {
      targetPrice: 215.00,
      upsidePct: 13.4,
      multiple: "110x NTM P/E, 42x EV/Rev",
      probability: 55,
      catalysts: "US Commercial revenue maintains 50%+ YoY pace; steady institutional passive inflows."
    },
    bull: {
      targetPrice: 260.00,
      upsidePct: 37.1,
      multiple: "135x NTM P/E, 54x EV/Rev",
      probability: 25,
      catalysts: "Multi-billion NATO autonomous defense contract signed; enterprise AIP becomes default enterprise AI operating system."
    }
  },
  optionsRecommendation: {
    strategyType: "Ratio Calendar Spread",
    direction: "Bullish",
    strikes: "Sell 45-Day 42.50 Call / Buy 120-Day 40.00 Call",
    nearExpiry: "45-Day",
    farExpiry: "120-Day",
    netDebitCredit: "Net Debit ~$2.40",
    maxProfit: "Convex Upside",
    maxLoss: "Net Debit Paid ($2.40)",
    breakeven: "$39.90",
    rationale: "Harvests elevated near-term implied volatility while locking in convex long exposure for the multi-quarter AIP rollout."
  },
  executiveTearSheet: {
    ticker: "PLTR",
    companyName: "Palantir Technologies Inc.",
    recommendation: "Long",
    subIndustryTheme: "Enterprise AI & Defense Software",
    product: "Mission-critical enterprise ontology platform (Foundry, Gotham, AIP) that operationalizes proprietary customer data with LLMs. Creates insurmountable switching costs by integrating directly into core enterprise and decision loops.",
    whatsHappening: "GAAP operating margins inflecting to 34.5%, US Commercial revenue accelerating +55% YoY, FCF conversion at 112%, and Zacks Consensus EPS revisions surging +21% over 90 days.",
    catalysts: [
      { label: "[Earnings / Hurdle]", detail: "Upcoming Q3 2026 earnings with US commercial customer count hurdle of >400 enterprise clients." },
      { label: "[Commercial / Adoption]", detail: "5-day AIP boot camp conversion rate to 7-figure annual recurring revenue contracts." },
      { label: "[Operational / Milestone]", detail: "Full-scale battlefield rollout of DoD Project Maven Smart System and TITAN prototypes." },
      { label: "[Capital Structure / Financing]", detail: "Debt-free balance sheet with >$4.0B in liquid Treasury cash generating accretive net interest income." }
    ],
    tenSecondPitch: "Palantir is the de facto operating system for enterprise and defense AI, converting complex multi-year deployments into 14-day AIP bootcamps that lock in customers forever. With 80%+ gross margins, accelerating US commercial growth, and an irreplaceable defense ontology moat, this is an elite structural compounder for the AI infrastructure era."
  },
  flowClassification: {
    stage: "🟡 Accelerating",
    sectorBias: "LONG"
  }
};

export const SAMPLE_MACRO_METADATA = {
  flowClassification: {
    stage: "🟡 Accelerating",
    sectorBias: "LONG"
  }
};

