"use client";

import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAppStore } from "@/store/use-app-store";

export function AppShell({ children }: { children: ReactNode }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%),hsl(var(--background))]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="min-h-screen lg:pl-[280px]">
        <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-20 lg:px-10 lg:pt-8">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-panel backdrop-blur-xl md:p-8">
            <Header />
            <div className="mt-8 animate-fade-up">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
