"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { createQueryClient } from "@/utils/query-client";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "border border-white/10 bg-slate-950 text-slate-100 shadow-xl",
          },
        }}
      />
    </QueryClientProvider>
  );
}
