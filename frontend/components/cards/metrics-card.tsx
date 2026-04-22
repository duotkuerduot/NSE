import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface MetricsCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const accentMap = {
  default: {
    bar: "from-cyan-400/15 to-sky-400/5",
    icon: "from-cyan-400/15 to-sky-400/5 text-cyan-200",
  },
  success: {
    bar: "from-emerald-400/15 to-lime-400/5",
    icon: "from-emerald-400/15 to-lime-400/5 text-emerald-200",
  },
  warning: {
    bar: "from-amber-400/15 to-orange-400/5",
    icon: "from-amber-400/15 to-orange-400/5 text-amber-200",
  },
  danger: {
    bar: "from-rose-400/15 to-red-400/5",
    icon: "from-rose-400/15 to-red-400/5 text-rose-200",
  },
};

export function MetricsCard({
  label,
  value,
  hint,
  icon,
  accent = "default",
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="relative flex h-full flex-col gap-4">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
            accentMap[accent].bar,
          )}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{value}</p>
          </div>
          {icon ? (
            <div
              className={cn(
                "rounded-xl border border-white/10 bg-gradient-to-br p-3",
                accentMap[accent].icon,
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="text-sm text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
