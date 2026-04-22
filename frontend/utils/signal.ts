import type { SignalType } from "@/types/api";

export const signalTheme: Record<
  SignalType,
  {
    label: SignalType;
    dot: string;
    badge: string;
    ring: string;
  }
> = {
  BUY: {
    label: "BUY",
    dot: "bg-emerald-400",
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]",
    ring: "ring-emerald-500/30",
  },
  HOLD: {
    label: "HOLD",
    dot: "bg-amber-400",
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.14)]",
    ring: "ring-amber-500/30",
  },
  AVOID: {
    label: "AVOID",
    dot: "bg-rose-400",
    badge:
      "border-rose-500/20 bg-rose-500/10 text-rose-200 shadow-[0_0_0_1px_rgba(244,63,94,0.14)]",
    ring: "ring-rose-500/30",
  },
};
