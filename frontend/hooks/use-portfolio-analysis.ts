"use client";

import { useMutation } from "@tanstack/react-query";

import { analyzePortfolio } from "@/services/portfolio-service";

export function usePortfolioAnalysis() {
  return useMutation({
    mutationFn: analyzePortfolio,
  });
}
