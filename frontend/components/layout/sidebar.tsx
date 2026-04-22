"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: BriefcaseBusiness,
  },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/10 bg-slate-950/95 px-6 py-8 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <BarChart3 className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
              NSE
            </p>
            <h1 className="text-lg font-semibold text-slate-50">
              Intelligence Terminal
            </h1>
          </div>
        </div>

        <div className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname.startsWith("/dashboard") || pathname.startsWith("/stocks/")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                  active
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Desk Status
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            AI research models are live for signal triage, portfolio stress tests,
            and narrative explainability.
          </p>
        </div>
      </aside>
      {open ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
          onClick={onToggle}
        />
      ) : null}
    </>
  );
}
