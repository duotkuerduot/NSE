"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import type { PortfolioBreakdownItem } from "@/types/api";

const barPalette = ["#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa"];

export function SectorBreakdownChart({
  data,
}: {
  data: PortfolioBreakdownItem[];
}) {
  return (
    <Card>
      <CardContent className="h-[320px] p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Diversification View
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">
            Sector Breakdown
          </h3>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={104}
            />
            <Tooltip
              cursor={{ fill: "rgba(34,211,238,0.06)" }}
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: "16px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [`${value}%`, "Weight"]}
            />
            <Bar dataKey="weight" radius={[0, 12, 12, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.sector}-${index}`}
                  fill={barPalette[index % barPalette.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
