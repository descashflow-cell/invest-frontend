import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getSummary } from "@/lib/api";
import { monthKey } from "@/lib/format";
import FullscreenLoader from "@/components/FullscreenLoader";
import MonthSwitcher from "@/components/MonthSwitcher";
import BalanceCard from "@/components/BalanceCard";
import SalaryCard from "@/components/SalaryCard";
import FixedExpensesCard from "@/components/FixedExpensesCard";
import ExtraExpensesCard from "@/components/ExtraExpensesCard";
import CategoryChart from "@/components/CategoryChart";
import InvestmentsCard from "@/components/InvestmentsCard";
import MonthlyPortfolioCard from "@/components/MonthlyPortfolioCard";
import PortfolioCard from "@/components/PortfolioCard";
import YtdCard from "@/components/YtdCard";
import ProjectionCard from "@/components/ProjectionCard";
import SideNav from "@/components/SideNav";
import InvestmentsList from "@/components/InvestmentsList";

const TITLES = {
  cashflow: {
    kicker: "Overview · cashflow",
    title: "My balance",
    italic: "for the month.",
  },
  ytd: { kicker: "YTD", title: "Year", italic: "to date." },
  portfolio: { kicker: "Assets", title: "Portfolio", italic: "" },
  projection: { kicker: "Planning", title: "Future", italic: "projection." },
};

export default function Dashboard() {
  const [active, setActive] = useState("cashflow");
  const [navCollapsed, setNavCollapsed] = useState(() => {
    try {
      return localStorage.getItem("navCollapsed") === "1";
    } catch {
      return false;
    }
  });
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyPortfolioRefresh, setMonthlyPortfolioRefresh] = useState(0);
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);
  const [ytdKey, setYtdKey] = useState(0);

  const refresh = useCallback(async (m) => {
    setLoading(true);
    try {
      setData(await getSummary(m));
    } catch {
      toast.error("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(month);
  }, [month, refresh]);

  const onChanged = () => {
    refresh(month);
    setYtdKey((n) => n + 1);
  };
  const onInvestmentChanged = () => {
    refresh(month);
    setMonthlyPortfolioRefresh((n) => n + 1);
    setYtdKey((n) => n + 1);
  };
  const onInvestmentListChanged = () => {
    setPortfolioRefresh((n) => n + 1);
  };

  const toggleNav = () => {
    setNavCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("navCollapsed", next ? "1" : "0");
      } catch (e) {
        /* ignore */
      }
      return next;
    });
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  };

  const t = TITLES[active];

  return (
    <div className="relative z-10 min-h-screen">
      <SideNav
        active={active}
        onChange={setActive}
        collapsed={navCollapsed}
        onToggleCollapsed={toggleNav}
      />

      <main
        className={`${navCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"} transition-[margin] duration-300 ease-out px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-[1400px]`}
      >
        {loading && (
          <FullscreenLoader />
        )}
        {!loading && (
          <>
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10 sm:mb-12">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold text-neutral-500 mb-3">
                  {t.kicker}
                </p>
                <h1 className="font-display text-5xl sm:text-6xl tracking-tighter font-light leading-none">
                  {t.title}{" "}
                  <span className="italic text-neutral-400">{t.italic}</span>
                </h1>
              </div>
              {active === "cashflow" && (
                <MonthSwitcher month={month} onChange={setMonth} />
              )}
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6"
              >
                {active === "cashflow" && (
                  <>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-5"
                    >
                      <BalanceCard data={data} loading={loading} />
                    </motion.div>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-7"
                    >
                      <SalaryCard
                        month={month}
                        items={data?.incomes ?? []}
                        onUpdated={onChanged}
                      />
                    </motion.div>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-7"
                    >
                      <FixedExpensesCard
                        month={month}
                        items={data?.fixed_expenses ?? []}
                        onChanged={onChanged}
                      />
                    </motion.div>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-5"
                    >
                      <CategoryChart
                        byCategory={data?.by_category ?? []}
                        total={data?.extra_total ?? 0}
                      />
                    </motion.div>
                    <motion.div variants={item} className="md:col-span-12">
                      <ExtraExpensesCard
                        month={month}
                        items={data?.extra_expenses ?? []}
                        onChanged={onChanged}
                      />
                    </motion.div>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-7"
                    >
                      <InvestmentsCard
                        month={month}
                        items={data?.investments_month ?? []}
                        suggested={data?.suggested_investable ?? 0}
                        totalMonth={data?.investments_month_total ?? 0}
                        onChanged={onInvestmentChanged}
                      />
                    </motion.div>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-5"
                    >
                      <MonthlyPortfolioCard
                        month={month}
                        refreshKey={monthlyPortfolioRefresh}
                      />
                    </motion.div>
                  </>
                )}

                {active === "ytd" && (
                  <motion.div variants={item} className="md:col-span-12">
                    <YtdCard key={ytdKey} />
                  </motion.div>
                )}

                {active === "portfolio" && (
                  <>
                    <motion.div
                      variants={item}
                      className="md:col-span-12 lg:col-span-7"
                    >
                      <PortfolioCard refreshKey={portfolioRefresh} />
                    </motion.div>
                    <motion.div variants={item} className="md:col-span-12">
                      <InvestmentsList onChanged={onInvestmentListChanged} />
                    </motion.div>
                  </>
                )}

                {active === "projection" && (
                  <motion.div variants={item} className="md:col-span-12">
                    <ProjectionCard key={ytdKey} />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between text-xs text-neutral-600">
              <span className="font-mono-num">v1.0 · single-user</span>
              <span className="uppercase tracking-[0.2em]">
                Tactical Minimalism
              </span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
