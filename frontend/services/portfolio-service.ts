import { apiClient } from "@/services/api-client";
import type {
  PortfolioAnalysisRequest,
  PortfolioAnalysisResponse,
} from "@/types/api";

export function analyzePortfolio(payload: PortfolioAnalysisRequest) {
  return apiClient<PortfolioAnalysisResponse>("/portfolio/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
