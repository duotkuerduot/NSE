import { ChevronRight } from "lucide-react";

import { SignalBadge } from "@/components/signal-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { StockSignal } from "@/types/api";
import { formatConfidence, formatPercent } from "@/utils/format";

interface DataTableProps {
  data: StockSignal[];
  onRowClick?: (ticker: string) => void;
}

export function DataTable({ data, onRowClick }: DataTableProps) {
  return (
    <Card>
      <CardContent className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-slate-400">
                <th className="px-6 py-4 font-medium">Ticker</th>
                <th className="px-6 py-4 font-medium">Signal</th>
                <th className="px-6 py-4 font-medium">Expected 5D Return</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row) => (
                <tr
                  key={row.ticker}
                  className="cursor-pointer transition hover:bg-cyan-400/[0.04]"
                  onClick={() => onRowClick?.(row.ticker)}
                >
                  <td className="px-6 py-5">
                    <div className="font-mono text-sm text-slate-200">{row.ticker}</div>
                  </td>
                  <td className="px-6 py-5">
                    <SignalBadge signal={row.signal} />
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-emerald-300">
                    {formatPercent(row.expected_return_5d)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
                          style={{ width: `${Math.min(row.risk_score * 10, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-slate-300">
                        {row.risk_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-200">
                    {formatConfidence(row.confidence)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                        Open
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
