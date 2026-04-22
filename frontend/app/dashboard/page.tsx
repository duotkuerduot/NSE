"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Funnel,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { MetricsCard } from "@/components/cards/metrics-card";
import { StockCard } from "@/components/cards/stock-card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSignals } from "@/hooks/use-signals";
import { useAppStore } from "@/store/use-app-store";
import type { SignalFilter, SignalSortKey, StockSignal } from "@/types/api";
import { formatConfidence, formatPercent } from "@/utils/format";

const FILTER_OPTIONS: SignalFilter[] = ["ALL", "BUY", "HOLD", "AVOID"];
const SORT_OPTIONS: { label: string; value: SignalSortKey }[] = [
  { label: "Return", value: "expected_return_5d" },
  { label: "Risk", value: "risk_score" },
  { label: "Confidence", value: "confidence" },
];

function getSortedSignals(signals: StockSignal[], sortBy: SignalSortKey) {
  return [...signals].sort((left, right) => {
    if (sortBy === "risk_score") {
      return right.risk_score - left.risk_score;
    }

    if (sortBy === "confidence") {
      return right.confidence - left.confidence;
    }

    return right.expected_return_5d - left.expected_return_5d;
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const signalsQuery = useSignals();
  const searchQuery = useAppStore((state) => state.searchQuery);
  const signalFilter = useAppStore((state) => state.signalFilter);
  const sortBy = useAppStore((state) => state.sortBy);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setSignalFilter = useAppStore((state) => state.setSignalFilter);
  const setSortBy = useAppStore((state) => state.setSortBy);
  const toggleSelectedStock = useAppStore((state) => state.toggleSelectedStock);

  const deferredSearch = useDeferredValue(searchQuery.trim().toUpperCase());
  const signals = signalsQuery.data ?? [];

  const filteredSignals = getSortedSignals(
    signals.filter((stock) => {
      const matchesFilter = signalFilter === "ALL" || stock.signal === signalFilter;
      const matchesSearch =
        deferredSearch.length === 0 || stock.ticker.includes(deferredSearch);

      return matchesFilter && matchesSearch;
    }),
    sortBy,
  );

  const topBuySignals = getSortedSignals(
    signals.filter((stock) => stock.signal === "BUY"),
    "expected_return_5d",
  ).slice(0, 4);
  const highRiskSignals = getSortedSignals(signals, "risk_score").slice(0, 3);
  const averageReturn =
    signals.length > 0
      ? signals.reduce((sum, item) => sum + item.expected_return_5d, 0) / signals.length
      : 0;
  const averageRisk =
    signals.length > 0
      ? signals.reduce((sum, item) => sum + item.risk_score, 0) / signals.length
      : 0;
  const averageConfidence =
    signals.length > 0
      ? signals.reduce((sum, item) => sum + item.confidence, 0) / signals.length
      : 0;
  const buyCoverage = signals.filter((stock) => stock.signal === "BUY").length;
  const highestConviction = getSortedSignals(signals, "confidence")[0];

  function openTicker(ticker: string) {
    toggleSelectedStock(ticker);
    router.push(`/stocks/${ticker}`);
  }

  if (signalsQuery.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (signalsQuery.isError) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10">
        <CardContent className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-200">
            Data Feed Error
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Signal ingestion is temporarily unavailable.
          </h3>
          <p className="max-w-2xl text-sm text-rose-100/80">
            {signalsQuery.error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden border-cyan-400/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(15,23,42,0.2)_40%,rgba(2,6,23,0.92))]">
          <CardContent className="relative space-y-6 p-7">
            <div className="fintech-grid absolute inset-0 opacity-25" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                  Live Market Radar
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  AI-ranked conviction signals for NSE names with explainable risk.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Blend momentum, downside risk, and model confidence into one
                  operating view for research, trading, and portfolio triage.
                </p>
              </div>
              {highestConviction ? (
                <div className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Highest Conviction
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-6">
                    <div>
                      <p className="font-mono text-3xl text-slate-50">
                        {highestConviction.ticker}
                      </p>
                      <p className="mt-2 text-sm text-cyan-200">
                        {formatConfidence(highestConviction.confidence)} model confidence
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => openTicker(highestConviction.ticker)}
                    >
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="space-y-5 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Desk Take
                </p>
                <h3 className="text-xl font-semibold text-slate-50">
                  Opportunity pulse
                </h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              BUY coverage is running at{" "}
              <span className="font-semibold text-emerald-300">
                {signals.length ? Math.round((buyCoverage / signals.length) * 100) : 0}%
              </span>
              , with average conviction holding above{" "}
              <span className="font-semibold text-cyan-300">
                {formatConfidence(averageConfidence)}
              </span>
              . Risk remains manageable at an average score of{" "}
              <span className="font-semibold text-amber-300">
                {averageRisk.toFixed(1)}/10
              </span>
              .
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Names Covered
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {signals.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Avg 5D Return
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {formatPercent(averageReturn)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          label="Coverage Universe"
          value={`${signals.length}`}
          hint="Tracked NSE listings with active model signals."
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricsCard
          label="BUY Setups"
          value={`${buyCoverage}`}
          hint="High-conviction opportunities currently rated as BUY."
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="success"
        />
        <MetricsCard
          label="Avg Expected Return"
          value={formatPercent(averageReturn)}
          hint="Cross-market average of 5-day expected return."
          icon={<BrainCircuit className="h-5 w-5" />}
        />
        <MetricsCard
          label="Avg Risk"
          value={`${averageRisk.toFixed(1)}/10`}
          hint="Composite risk signal based on volatility and downside sensitivity."
          icon={<AlertTriangle className="h-5 w-5" />}
          accent={averageRisk >= 7 ? "danger" : averageRisk >= 4 ? "warning" : "success"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Best Ideas
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-50">
                Top BUY Signals
              </h3>
            </div>
            <Link
              href="/portfolio"
              className="text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              Run portfolio analysis
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {topBuySignals.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Risk Watch
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-50">
              High Risk Stocks
            </h3>
          </div>
          <div className="space-y-4">
            {highRiskSignals.map((stock) => (
              <Card
                key={stock.ticker}
                className="cursor-pointer transition hover:border-rose-400/30 hover:bg-white/[0.04]"
                onClick={() => openTicker(stock.ticker)}
              >
                <CardContent className="flex items-center justify-between gap-6 p-5">
                  <div>
                    <p className="font-mono text-lg text-slate-100">{stock.ticker}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {formatPercent(stock.expected_return_5d)} expected return with{" "}
                      {formatConfidence(stock.confidence)} confidence.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Risk
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-rose-300">
                      {stock.risk_score.toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Signal Screener
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-50">
              All Signals
            </h3>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(event) =>
                  startTransition(() => setSearchQuery(event.target.value))
                }
                placeholder="Search ticker"
                className="pl-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={signalFilter === option ? "default" : "secondary"}
                  size="sm"
                  onClick={() => startTransition(() => setSignalFilter(option))}
                >
                  <Funnel className="h-3.5 w-3.5" />
                  {option}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => startTransition(() => setSortBy(option.value))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DataTable data={filteredSignals} onRowClick={openTicker} />
      </section>
    </div>
  );
}
