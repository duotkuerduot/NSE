import type { PortfolioBreakdownItem } from "@/types/api";

const NSE_SECTOR_MAP: Record<string, string> = {
  KCB: "Banking",
  EQTY: "Banking",
  SCBK: "Banking",
  ABSA: "Banking",
  COOP: "Banking",
  NCBA: "Banking",
  CFC: "Banking",
  BAMB: "Construction",
  BAT: "Consumer Staples",
  EABL: "Consumer Staples",
  KQ: "Transport",
  KPLC: "Utilities",
  KGEN: "Utilities",
  TOTL: "Energy",
  SCOM: "Telecoms",
  JUB: "Insurance",
  BRIT: "Insurance",
  CICC: "Insurance",
  ARM: "Construction",
  SASN: "Agriculture",
  TOTLENERG: "Energy",
};

export function deriveSectorBreakdown(stocks: string[]): PortfolioBreakdownItem[] {
  if (stocks.length === 0) {
    return [];
  }

  const grouped = stocks.reduce<Record<string, string[]>>((acc, ticker) => {
    const normalized = ticker.trim().toUpperCase();
    const sector = NSE_SECTOR_MAP[normalized] ?? "Diversified";
    acc[sector] = [...(acc[sector] ?? []), normalized];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([sector, tickers]) => ({
      sector,
      tickers,
      weight: Number(((tickers.length / stocks.length) * 100).toFixed(1)),
    }))
    .sort((left, right) => right.weight - left.weight);
}
