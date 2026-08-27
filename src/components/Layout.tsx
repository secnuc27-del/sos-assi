import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Wrench,
  Users,
  MonitorSmartphone,
  ClipboardList,
  Search,
  Bell,
  CircleUser,
  LogOut,
  History,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { logoUrl } from "@/lib/logo";

const navItems = [
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/equipamentos", label: "Equipamentos", icon: MonitorSmartphone },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList },
  { to: "/consulta", label: "Consulta de OS", icon: Search },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

export function Layout({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = navItems.find((i) => pathname.startsWith(i.to));
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="border-b border-sidebar-border px-4 py-5 flex justify-center overflow-hidden h-24 items-center">
          <img 
            src={logoUrl} 
            alt="SOS Reparo Logo" 
            className="w-[210px] max-w-none h-auto drop-shadow-sm mix-blend-multiply" 
            style={{ clipPath: "inset(0% 0 20% 0)", transform: "scale(1.05) translateY(6px)" }}
          />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1">
            <CircleUser className="h-7 w-7 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Técnico</p>
              <p className="truncate text-xs text-muted-foreground">admin@sosreparo.com</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>


      {/* Main */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-8 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold text-foreground">
            {current?.label ?? "SOS Reparo"}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-8 py-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
