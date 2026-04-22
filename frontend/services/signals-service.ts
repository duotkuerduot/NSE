import { apiClient } from "@/services/api-client";
import type { StockSignal } from "@/types/api";

export function fetchSignals() {
  return apiClient<StockSignal[]>("/signals");
}
