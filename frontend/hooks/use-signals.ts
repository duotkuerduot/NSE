"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSignals } from "@/services/signals-service";

export function useSignals() {
  return useQuery({
    queryKey: ["signals"],
    queryFn: fetchSignals,
  });
}
