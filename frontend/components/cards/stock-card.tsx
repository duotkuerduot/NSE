import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgePercent, ShieldAlert } from "lucide-react";

import { RiskMeter } from "@/components/risk-meter";
import { SignalBadge } from "@/components/signal-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { StockSignal } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatConfidence, formatPercent } from "@/utils/format";

interface StockCardProps {
  stock: StockSignal;
  className?: string;
}

export function StockCard({ stock, className }: StockCardProps) {
  return (
    <Link href={`/stocks/${stock.ticker}` as Route} className="group block">
      <Card
        className={cn(
          "h-full border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/80 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-glow",
          className,
        )}
      >
        <CardContent className="flex h-full flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
                NSE
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
                {stock.ticker}
              </h3>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:text-cyan-300" />
          </div>
          <SignalBadge signal={stock.signal} className="w-fit" />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <BadgePercent className="h-4 w-4 text-cyan-300" />
                Return
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {formatPercent(stock.expected_return_5d)}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Confidence
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {formatConfidence(stock.confidence)}
              </p>
            </div>
          </div>
          <RiskMeter value={stock.risk_score} />
        </CardContent>
      </Card>
    </Link>
  );
}
