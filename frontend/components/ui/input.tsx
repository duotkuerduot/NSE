import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20",
        className,
      )}
      {...props}
    />
  );
}
