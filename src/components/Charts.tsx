import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Category, Expense, PaymentMethod } from "../types";
import { fmtMoney, startOfWeek } from "../utils";
import { COLOR_OPTIONS } from "../colors";
import { EmptyState } from "./Basics";

export function SpendingChart({
  expenses,
  granularity,
  setGranularity,
  title = "المصروفات خلال الفترة",
}: {
  expenses: Expense[];
  granularity: "daily" | "weekly" | "monthly";
  setGranularity: (g: "daily" | "weekly" | "monthly") => void;
  title?: string;
}) {
  const data = useMemo(() => {
    const buckets: Record<string, { key: string; label: string; total: number }> = {};
    const order: string[] = [];
    expenses.forEach((e) => {
      let key: string, label: string;
      if (granularity === "daily") {
        key = e.date;
        label = new Date(e.date + "T00:00:00").toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
      } else if (granularity === "weekly") {
        key = startOfWeek(e.date);
        label = "أسبوع " + new Date(key + "T00:00:00").toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
      } else {
        key = e.date.slice(0, 7);
        label = new Date(e.date + "T00:00:00").toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
      }
      if (!buckets[key]) {
        buckets[key] = { key, label, total: 0 };
        order.push(key);
      }
      buckets[key].total += e.amount;
    });
    return order.sort().map((k) => buckets[k]);
  }, [expenses, granularity]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-sm">
          {(
            [
              ["daily", "يومي"],
              ["weekly", "أسبوعي"],
              ["monthly", "شهري"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setGranularity(val)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                granularity === val ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <EmptyState title="لا توجد بيانات" subtitle="لا توجد مصروفات في هذه الفترة لعرضها على الرسم البياني." />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p: any = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-slate-300 mb-0.5">{p.label}</div>
                      <div className="font-semibold tabular-nums">{fmtMoney(p.total)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

interface BreakdownItem {
  id: string;
  name: string;
  total: number;
  count: number;
  pct: number;
  chart: string;
  dot: string;
}

function DonutBreakdown({ data, title, emptySubtitle }: { data: BreakdownItem[]; title: string; emptySubtitle: string }) {
  if (!data.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <EmptyState title="لا توجد بيانات" subtitle={emptySubtitle} />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="none">
                {data.map((c) => (
                  <Cell key={c.id} fill={c.chart} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p: any = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                      <div className="mb-0.5">{p.name}</div>
                      <div className="font-semibold tabular-nums">{fmtMoney(p.total)}</div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {data.map((c) => (
            <div key={c.id} className="flex items-center gap-3 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
              <span className="text-slate-700 dark:text-slate-300 font-medium w-16 shrink-0 truncate">{c.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.chart }} />
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs w-10 text-left shrink-0 tabular-nums">{c.pct.toFixed(0)}%</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 w-20 text-left shrink-0 tabular-nums">{fmtMoney(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryBreakdown({ expenses, categories, title = "المصروفات حسب التصنيف" }: { expenses: Expense[]; categories: Category[]; title?: string }) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    let sum = 0;
    expenses.forEach((e) => {
      totals[e.categoryId] = (totals[e.categoryId] || 0) + e.amount;
      counts[e.categoryId] = (counts[e.categoryId] || 0) + 1;
      sum += e.amount;
    });
    return categories
      .map((c) => {
        const spec = COLOR_OPTIONS[c.color] || COLOR_OPTIONS.slate;
        return {
          id: c.id,
          name: c.name,
          total: totals[c.id] || 0,
          count: counts[c.id] || 0,
          pct: sum ? ((totals[c.id] || 0) / sum) * 100 : 0,
          chart: spec.chart,
          dot: spec.dot,
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  return <DonutBreakdown data={data} title={title} emptySubtitle="أضف مصروفات لعرض توزيع الإنفاق حسب التصنيف." />;
}

export function PaymentMethodBreakdown({ expenses, paymentMethods, title = "توزيع طرق الدفع" }: { expenses: Expense[]; paymentMethods: PaymentMethod[]; title?: string }) {
  const palette = ["#059669", "#0284c7", "#d97706", "#7c3aed"];
  const dots = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500"];
  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    let sum = 0;
    expenses.forEach((e) => {
      totals[e.paymentMethod] = (totals[e.paymentMethod] || 0) + e.amount;
      counts[e.paymentMethod] = (counts[e.paymentMethod] || 0) + 1;
      sum += e.amount;
    });
    return paymentMethods
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        total: totals[p.id] || 0,
        count: counts[p.id] || 0,
        pct: sum ? ((totals[p.id] || 0) / sum) * 100 : 0,
        chart: palette[i % palette.length],
        dot: dots[i % dots.length],
      }))
      .filter((p) => p.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses, paymentMethods]);

  return <DonutBreakdown data={data} title={title} emptySubtitle="أضف مصروفات لعرض توزيع طرق الدفع." />;
}
