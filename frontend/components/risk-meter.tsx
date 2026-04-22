import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";

interface RiskMeterProps {
  value: number;
  className?: string;
}

export function RiskMeter({ value, className }: RiskMeterProps) {
  const statusTone =
    value >= 7
      ? "text-rose-300"
      : value >= 4
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
        <span>Risk Meter</span>
        <span className={cn("font-mono text-sm tracking-normal", statusTone)}>
          {value.toFixed(1)}/10
        </span>
      </div>
      <Progress value={Math.min(value * 10, 100)} />
    </div>
  );
}
