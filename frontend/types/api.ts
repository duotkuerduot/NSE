export type SignalType = "BUY" | "HOLD" | "AVOID";

export type SignalFilter = "ALL" | SignalType;

export type SignalSortKey = "expected_return_5d" | "risk_score" | "confidence";

export interface StockSignal {
  ticker: string;
  signal: SignalType;
  expected_return_5d: number;
  risk_score: number;
  confidence: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface StockDetail {
  ticker: string;
  price_history: PricePoint[];
  expected_return: number;
  risk_score: number;
  volatility: string;
  liquidity: string;
  explanation: string;
}

export interface PortfolioAnalysisRequest {
  stocks: string[];
}

export interface PortfolioBreakdownItem {
  sector: string;
  weight: number;
  tickers: string[];
  averageRisk?: number;
}

export interface PortfolioAnalysisResponse {
  risk: number;
  diversification_score: number;
  recommendations: string;
  breakdown: PortfolioBreakdownItem[];
}
