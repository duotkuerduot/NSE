"use client";

import { toast } from "sonner";
import {
  BrainCircuit,
  Layers3,
  PieChart,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { SectorBreakdownChart } from "@/components/charts/sector-breakdown-chart";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { MetricsCard } from "@/components/cards/metrics-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis";
import { useSignals } from "@/hooks/use-signals";
import { useAppStore } from "@/store/use-app-store";
import { deriveSectorBreakdown } from "@/utils/sector";

function parsePortfolioInput(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((ticker) => ticker.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];
}

export default function PortfolioPage() {
  const portfolioInput = useAppStore((state) => state.portfolioInput);
  const setPortfolioInput = useAppStore((state) => state.setPortfolioInput);
  const setSelectedStocks = useAppStore((state) => state.setSelectedStocks);
  const signalsQuery = useSignals();
  const portfolioMutation = usePortfolioAnalysis();

  const parsedTickers = parsePortfolioInput(portfolioInput);
  const quickIdeas =
    signalsQuery.data
      ?.filter((item) => item.signal === "BUY")
      .sort((left, right) => right.expected_return_5d - left.expected_return_5d)
      .slice(0, 5) ?? [];

  const breakdown =
    portfolioMutation.data?.breakdown && portfolioMutation.data.breakdown.length > 0
      ? portfolioMutation.data.breakdown
      : deriveSectorBreakdown(parsedTickers);

  function handleAnalyze() {
    if (parsedTickers.length === 0) {
      toast.error("Add at least one NSE ticker to analyze the portfolio.");
      return;
    }

    setSelectedStocks(parsedTickers);
    portfolioMutation.mutate(
      { stocks: parsedTickers },
      {
        onSuccess: () => {
          toast.success("Portfolio analysis completed.");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function appendTicker(ticker: string) {
    const nextTickers = [...new Set([...parsedTickers, ticker])];
    setPortfolioInput(nextTickers.join(", "));
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(15,23,42,0.72),rgba(2,6,23,0.96))]">
          <CardContent className="space-y-6 p-7">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                Portfolio Lab
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                Run AI analysis on multi-stock NSE portfolios.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Combine tickers, inspect risk concentration, and surface allocation
                improvements through an explainable AI layer.
              </p>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="portfolio-input"
                className="text-xs uppercase tracking-[0.24em] text-slate-500"
              >
                Portfolio Tickers
              </label>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  id="portfolio-input"
                  value={portfolioInput}
                  onChange={(event) => setPortfolioInput(event.target.value)}
                  placeholder="KCB, EQTY, SCOM, KPLC"
                  className="flex-1"
                />
                <Button
                  onClick={handleAnalyze}
                  className="min-w-[180px]"
                  disabled={portfolioMutation.isPending}
                >
                  {portfolioMutation.isPending ? "Analyzing..." : "Analyze Portfolio"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {parsedTickers.map((ticker) => (
                <span
                  key={ticker}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-cyan-200"
                >
                  {ticker}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Quick Build
                </p>
                <h3 className="text-xl font-semibold text-slate-50">
                  Top BUY names
                </h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Seed the analyzer with the strongest model-rated BUY opportunities,
              then refine the basket using the AI recommendation below.
            </p>
            <div className="flex flex-wrap gap-2">
              {quickIdeas.map((idea) => (
                <Button
                  key={idea.ticker}
                  variant="secondary"
                  size="sm"
                  onClick={() => appendTicker(idea.ticker)}
                >
                  {idea.ticker}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {portfolioMutation.isPending ? (
        <LoadingSkeleton rows={5} />
      ) : portfolioMutation.data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricsCard
              label="Portfolio Risk"
              value={`${portfolioMutation.data.risk.toFixed(1)}/10`}
              hint="Aggregate risk across submitted holdings."
              icon={<ShieldAlert className="h-5 w-5" />}
              accent={
                portfolioMutation.data.risk >= 7
                  ? "danger"
                  : portfolioMutation.data.risk >= 4
                    ? "warning"
                    : "success"
              }
            />
            <MetricsCard
              label="Diversification"
              value={`${portfolioMutation.data.diversification_score.toFixed(1)}/10`}
              hint="Higher scores indicate better spread across exposures."
              icon={<Layers3 className="h-5 w-5" />}
              accent="success"
            />
            <MetricsCard
              label="Holdings"
              value={`${parsedTickers.length}`}
              hint="Names included in the submitted portfolio."
              icon={<PieChart className="h-5 w-5" />}
            />
            <MetricsCard
              label="Model Assessment"
              value={
                portfolioMutation.data.risk <= 4 &&
                portfolioMutation.data.diversification_score >= 6
                  ? "Healthy"
                  : "Review"
              }
              hint="Quick summary of construction quality."
              icon={<BrainCircuit className="h-5 w-5" />}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectorBreakdownChart data={breakdown} />

            <Card>
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Allocation View
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-50">
                    Breakdown Details
                  </h3>
                </div>
                <div className="space-y-3">
                  {breakdown.map((item) => (
                    <div
                      key={item.sector}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-100">
                          {item.sector}
                        </p>
                        <p className="font-mono text-sm text-cyan-300">
                          {item.weight.toFixed(1)}%
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {item.tickers.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border-cyan-400/15 bg-[linear-gradient(135deg,rgba(14,116,144,0.16),rgba(15,23,42,0.85),rgba(2,6,23,0.98))]">
            <CardContent className="space-y-4 p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    AI Recommendation
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-50">
                    Portfolio Guidance
                  </h3>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-6">
                <p className="text-base leading-8 text-slate-200">
                  {portfolioMutation.data.recommendations}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Awaiting Analysis
            </p>
            <h3 className="text-2xl font-semibold text-slate-50">
              Submit a portfolio to unlock risk and diversification insights.
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">
              Enter a comma-separated list of NSE tickers and the platform will
              return portfolio risk, diversification score, sector exposure, and
              an AI recommendation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
