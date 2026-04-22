"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import type { PricePoint } from "@/types/api";
import { formatCurrency, formatDateLabel } from "@/utils/format";

interface LineChartProps {
  data: PricePoint[];
}

export function LineChart({ data }: LineChartProps) {
  return (
    <Card>
      <CardContent className="h-[360px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Price History
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-50">
              Closing Trend
            </h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={92}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: "16px",
                color: "#e2e8f0",
              }}
              labelFormatter={(label) => formatDateLabel(label as string)}
              formatter={(value) => [formatCurrency(Number(value)), "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#34d399" }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
