"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

export function Progress({
  className,
  value,
  ...props
}: ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80",
        className,
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 transition-all"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
