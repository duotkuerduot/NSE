"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Gauge,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";

import { LineChart } from "@/components/charts/line-chart";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { MetricsCard } from "@/components/cards/metrics-card";
import { RiskMeter } from "@/components/risk-meter";
import { SignalBadge } from "@/components/signal-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSignals } from "@/hooks/use-signals";
import { useStock } from "@/hooks/use-stock";
import type { SignalType } from "@/types/api";
import { formatCurrency, formatPercent } from "@/utils/format";

function deriveSignal(expectedReturn: number, risk: number): SignalType {
  if (expectedReturn >= 5 && risk <= 5) {
    return "BUY";
  }

  if (expectedReturn >= 1 && risk <= 7) {
    return "HOLD";
  }

  return "AVOID";
}

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = params.ticker.toUpperCase();
  const stockQuery = useStock(ticker);
  const signalsQuery = useSignals();

  if (stockQuery.isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (stockQuery.isError || !stockQuery.data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="space-y-4 p-7">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-200">
            Security Unavailable
          </p>
          <h3 className="text-2xl font-semibold text-white">
            We couldn&apos;t load {ticker}.
          </h3>
          <p className="text-sm text-rose-100/80">
            {stockQuery.error?.message ?? "Try again when the feed recovers."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const stock = stockQuery.data;
  const matchedSignal =
    signalsQuery.data?.find((item) => item.ticker === ticker)?.signal ??
    deriveSignal(stock.expected_return, stock.risk_score);
  const latestPrice = stock.price_history.at(-1)?.price ?? 0;
  const firstPrice = stock.price_history[0]?.price ?? latestPrice;
  const priceDelta = latestPrice - firstPrice;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <SignalBadge signal={matchedSignal} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Latest Price
          </p>
          <p className="mt-1 font-mono text-2xl text-slate-50">
            {formatCurrency(latestPrice)}
          </p>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.85),rgba(8,47,73,0.35),rgba(2,6,23,0.95))]">
          <CardContent className="space-y-6 p-7">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
                  NSE Listing
                </p>
                <h3 className="mt-3 text-4xl font-semibold text-white">{ticker}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Model-based outlook combining expected return, risk calibration,
                  and recent market behavior for a single-name decision.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Price Change
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold ${
                    priceDelta >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {formatCurrency(priceDelta)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Versus first visible point in the current chart window.
                </p>
              </div>
            </div>
            <RiskMeter value={stock.risk_score} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <MetricsCard
            label="Expected Return"
            value={formatPercent(stock.expected_return)}
            hint="Forward-looking expected return from the model."
            icon={<Sparkles className="h-5 w-5" />}
            accent={stock.expected_return >= 0 ? "success" : "danger"}
          />
          <MetricsCard
            label="Risk Score"
            value={`${stock.risk_score.toFixed(1)}/10`}
            hint="Composite downside and stability score."
            icon={<ShieldAlert className="h-5 w-5" />}
            accent={stock.risk_score >= 7 ? "danger" : stock.risk_score >= 4 ? "warning" : "success"}
          />
          <MetricsCard
            label="Volatility"
            value={stock.volatility}
            hint="Observed price movement regime."
            icon={<Waves className="h-5 w-5" />}
          />
          <MetricsCard
            label="Liquidity"
            value={stock.liquidity}
            hint="Ease of entering and exiting the position."
            icon={<Gauge className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <LineChart data={stock.price_history} />

        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Snapshot
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-50">
                Trading Pulse
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Current Price
                </p>
                <p className="mt-2 font-mono text-2xl text-slate-100">
                  {formatCurrency(latestPrice)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Starting Window Price
                </p>
                <p className="mt-2 font-mono text-2xl text-slate-100">
                  {formatCurrency(firstPrice)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Risk Posture
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-100">
                  {stock.risk_score >= 7
                    ? "Capital preservation focus"
                    : stock.risk_score >= 4
                      ? "Balanced exposure"
                      : "Favorable for accumulation"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-cyan-400/15 bg-[linear-gradient(135deg,rgba(8,47,73,0.35),rgba(15,23,42,0.85),rgba(2,6,23,0.95))]">
        <CardContent className="space-y-5 p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                AI Explanation
              </p>
              <h3 className="text-2xl font-semibold text-slate-50">
                Narrative Insight
              </h3>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-6">
            <p className="text-base leading-8 text-slate-200">{stock.explanation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
