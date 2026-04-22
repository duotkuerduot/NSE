import { apiClient } from "@/services/api-client";
import type { StockDetail } from "@/types/api";

export function fetchStockDetail(ticker: string) {
  return apiClient<StockDetail>(`/stock/${ticker.toUpperCase()}`);
}
