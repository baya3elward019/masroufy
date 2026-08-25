import { TrendingUp, TrendingDown } from "lucide-react";
import { fmtMoney } from "../utils";

export function StatCard({
  label,
  amount,
  trendPct,
  trendGood,
  highlight,
}: {
  label: string;
  amount: number;
  trendPct: number | null;
  trendGood?: boolean;
  highlight?: "danger" | "ok";
}) {
  const showTrend = trendPct !== null && isFinite(trendPct);
  const trendUp = showTrend && (trendPct as number) > 0;
  const trendColor = trendGood ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const amountColor = highlight === "danger" ? "text-rose-600 dark:text-rose-400" : highlight === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100";
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-2 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${amountColor}`}>{fmtMoney(amount)}</span>
      {showTrend && (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trendPct as number).toFixed(1)}% مقارنة بالفترة السابقة
        </span>
      )}
    </div>
  );
}

export function BudgetGauge({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const remaining = budget - spent;
  const size = 128;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const over = spent > budget;
  const ringColor = over ? "#e11d48" : pct > 0.8 ? "#d97706" : "#047857";
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-700 ease-out animate-gauge-breathe"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">{Math.round(pct * 100)}%</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">مستخدم</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">الميزانية الشهرية: </span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{fmtMoney(budget)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">المصروف: </span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{fmtMoney(spent)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">{over ? "تجاوزت الميزانية بـ " : "المتبقي: "}</span>
          <span className={`font-semibold tabular-nums ${over ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}>
            {fmtMoney(Math.abs(remaining))}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ThinProgress({ pct, tone }: { pct: number; tone: "ok" | "warn" | "danger" }) {
  const color = tone === "danger" ? "bg-rose-500" : tone === "warn" ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}
