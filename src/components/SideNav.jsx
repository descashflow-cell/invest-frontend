import { Wallet, LineChart, Sparkles, Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS = [
  { id: "cashflow", label: "Cashflow", icon: Wallet, hint: "Salary · expenses" },
  { id: "portfolio", label: "Portfolio", icon: LineChart, hint: "Portfolio · ETFs" },
  { id: "ytd", label: "Year to Date", icon: LineChart, hint: "Year to date" },
  { id: "projection", label: "Projection", icon: Sparkles, hint: "Future growth" },
];

export default function SideNav({ active, onChange, collapsed, onToggleCollapsed }) {
  const [openMobile, setOpenMobile] = useState(false);
  const { user, logout } = useAuth();

  const Link = ({ it, compact }) => {
    const Icon = it.icon;
    const isActive = active === it.id;
    return (
      <button
        type="button"
        onClick={() => { onChange(it.id); setOpenMobile(false); }}
        data-testid={`nav-${it.id}`}
        title={compact ? it.label : undefined}
        className={`group w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors ${
          isActive
            ? "bg-white text-black border-white"
            : "border-transparent text-neutral-300 hover:bg-white/5 hover:border-white/10"
        } ${compact ? "justify-center px-2" : ""}`}
      >
        <Icon className={`w-4 h-4 ${compact ? "" : "mt-0.5"} flex-shrink-0 ${isActive ? "text-black" : "text-neutral-500 group-hover:text-white"}`} />
        {!compact && (
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">{it.label}</div>
            <div className={`text-[10px] uppercase tracking-[0.18em] mt-1 ${isActive ? "text-black/60" : "text-neutral-600"}`}>
              {it.hint}
            </div>
          </div>
        )}
      </button>
    );
  };

  const desktopWidth = collapsed ? "w-[72px]" : "w-[240px]";

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0A0A0A] sticky top-0 z-30">
        <span className="font-display text-xl tracking-tight">PlanWise</span>
        <button
          type="button"
          onClick={() => setOpenMobile((v) => !v)}
          className="w-9 h-9 inline-flex items-center justify-center border border-white/10 rounded-full"
          data-testid="nav-toggle"
          aria-label="Menu"
        >
          {openMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {openMobile && (
        <div className="lg:hidden border-b border-white/5 bg-[#0A0A0A] p-4 space-y-2 sticky top-14 z-30" data-testid="nav-mobile">
          {ITEMS.map((it) => <Link key={it.id} it={it} />)}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 ${desktopWidth} border-r border-white/5 bg-[#0A0A0A] z-20 p-4 transition-[width] duration-300 ease-out`}
        data-testid="nav-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
      >
        <div className={`mb-8 flex ${collapsed ? "justify-center" : "items-start justify-between"}`}>
          {!collapsed && (
            <div>
              <h1 className="font-display text-2xl tracking-tighter font-light">PlanWise</h1>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95 text-neutral-400 hover:text-white"
            data-testid="nav-collapse"
            aria-label={collapsed ? "Espandi menu" : "Comprimi menu"}
            title={collapsed ? "Espandi" : "Comprimi"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        <nav className="space-y-2 flex-1">
          {ITEMS.map((it) => <Link key={it.id} it={it} compact={collapsed} />)}
        </nav>
        {!collapsed && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 truncate mb-2" data-testid="user-email">{user?.email}</p>
            <button type="button" onClick={logout} className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors" data-testid="logout-button">
              <LogOut className="w-3.5 h-3.5" /> Esci
            </button>
          </div>
        )}
        {collapsed && (
          <button type="button" onClick={logout} title="Esci" className="mt-4 mx-auto w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" data-testid="logout-button-compact">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </aside>
    </>
  );
}
