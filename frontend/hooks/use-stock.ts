"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchStockDetail } from "@/services/stocks-service";

export function useStock(ticker: string) {
  return useQuery({
    queryKey: ["stock", ticker],
    queryFn: () => fetchStockDetail(ticker),
    enabled: Boolean(ticker),
  });
}
