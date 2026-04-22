"use client";

import { create } from "zustand";

import type { SignalFilter, SignalSortKey } from "@/types/api";

interface AppState {
  selectedStocks: string[];
  portfolioInput: string;
  searchQuery: string;
  signalFilter: SignalFilter;
  sortBy: SignalSortKey;
  sidebarOpen: boolean;
  setSelectedStocks: (stocks: string[]) => void;
  toggleSelectedStock: (ticker: string) => void;
  setPortfolioInput: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSignalFilter: (value: SignalFilter) => void;
  setSortBy: (value: SignalSortKey) => void;
  setSidebarOpen: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedStocks: [],
  portfolioInput: "",
  searchQuery: "",
  signalFilter: "ALL",
  sortBy: "expected_return_5d",
  sidebarOpen: false,
  setSelectedStocks: (stocks) =>
    set({
      selectedStocks: [...new Set(stocks.map((ticker) => ticker.toUpperCase()))],
    }),
  toggleSelectedStock: (ticker) =>
    set((state) => {
      const normalized = ticker.toUpperCase();

      return {
        selectedStocks: state.selectedStocks.includes(normalized)
          ? state.selectedStocks.filter((item) => item !== normalized)
          : [...state.selectedStocks, normalized],
      };
    }),
  setPortfolioInput: (portfolioInput) => set({ portfolioInput }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSignalFilter: (signalFilter) => set({ signalFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
