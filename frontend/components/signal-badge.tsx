import type { SignalType } from "@/types/api";
import { cn } from "@/utils/cn";
import { signalTheme } from "@/utils/signal";

interface SignalBadgeProps {
  signal: SignalType;
  className?: string;
}

export function SignalBadge({ signal, className }: SignalBadgeProps) {
  const theme = signalTheme[signal];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.24em]",
        theme.badge,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", theme.dot)} />
      {theme.label}
    </span>
  );
}
