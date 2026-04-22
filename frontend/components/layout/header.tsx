"use client";

import { Bell, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Market Command Center",
    subtitle: "Monitor conviction-weighted signals across Nairobi Securities Exchange coverage.",
  },
  "/portfolio": {
    title: "Portfolio Intelligence",
    subtitle: "Stress test portfolio construction and get AI-driven allocation guidance.",
  },
};

export function Header() {
  const pathname = usePathname();
  const selectedStocks = useAppStore((state) => state.selectedStocks);

  const dynamicTitle = pathname.startsWith("/stocks/")
    ? {
        title: "Single Name Deep Dive",
        subtitle: "Drill into AI rationale, risk, and recent price behavior for one NSE listing.",
      }
    : titles[pathname] ?? titles["/dashboard"];

  const today = new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col gap-6 border-b border-white/10 pb-8 pt-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
          {today}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
          {dynamicTitle.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {dynamicTitle.subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Watchlist
          </p>
          <p className="mt-1 font-mono text-lg text-slate-100">
            {selectedStocks.length.toString().padStart(2, "0")} Names
          </p>
        </div>
        <Button variant="secondary" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="secondary" className="gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          AI Engine Online
        </Button>
      </div>
    </header>
  );
}
