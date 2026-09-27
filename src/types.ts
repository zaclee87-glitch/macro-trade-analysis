export type OperationalMode = "macro" | "ticker";

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  status: "success" | "failed";
  timestamp: string;
}

export interface UnavailableServer {
  address: string;
  reason: string;
}

export interface ValuationScenario {
  targetPrice: number;
  upsidePct: number;
  multiple?: string;
  probability?: number;
  catalysts?: string;
}

export interface ValuationScenarios {
  currentPrice?: number;
  bear: ValuationScenario;
  base: ValuationScenario;
  bull: ValuationScenario;
}

export interface OptionsRecommendation {
  strategyType: string;
  direction: "Bullish" | "Bearish" | "Neutral" | string;
  strikes: string;
  nearExpiry: string;
  farExpiry: string;
  netDebitCredit?: string;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  rationale?: string;
}

export interface CatalystItem {
  label: string;
  detail: string;
}

export interface ExecutiveTearSheet {
  ticker: string;
  companyName: string;
  recommendation: "Long" | "Short" | "Do Not Enter" | string;
  subIndustryTheme: string;
  product: string;
  whatsHappening: string;
  catalysts: CatalystItem[];
  tenSecondPitch: string;
}

export interface FlowClassification {
  stage: "🟢 Emerging" | "🟡 Accelerating" | "🟠 Consensus" | "🔴 Distribution" | string;
  sectorBias: "LONG" | "SHORT" | "NEUTRAL" | string;
}

export interface ReportMetadata {
  valuationScenarios?: ValuationScenarios;
  optionsRecommendation?: OptionsRecommendation;
  executiveTearSheet?: ExecutiveTearSheet;
  flowClassification?: FlowClassification;
}

export interface AnalyzeResponse {
  report: string;
  metadata?: ReportMetadata | null;
  tool_calls: ToolCall[];
  unavailable: UnavailableServer[];
  model: string;
  generated_at: string;
  execution_time_ms?: number;
  error?: string;
}

export interface SavedReport {
  id: string;
  mode: OperationalMode;
  ticker?: string;
  title: string;
  timestamp: string;
  report: string;
  metadata?: ReportMetadata | null;
  tool_calls: ToolCall[];
  unavailable: UnavailableServer[];
  model: string;
  execution_time_ms?: number;
}

