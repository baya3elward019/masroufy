import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Category, Expense, PaymentMethod } from "../types";
import { TODAY } from "../data";
import { addDays, daysBetween, fmtFullDate, fmtMoney, inRange, iso } from "../utils";
import { SpendingChart, CategoryBreakdown, PaymentMethodBreakdown } from "../components/Charts";
import { EmptyState } from "../components/Basics";

function statsFor(expenses: Expense[], from: string, to: string, categories: Category[]) {
  const list = expenses.filter((e) => inRange(e.date, from, to));
  const total = list.reduce((s, e) => s + e.amount, 0);
  const nDays = daysBetween(from, to);
  const avgDaily = nDays ? total / nDays : 0;
  const byDay: Record<string, number> = {};
  list.forEach((e) => (byDay[e.date] = (byDay[e.date] || 0) + e.amount));
  const dayEntries = Object.entries(byDay);
  const highestDay = dayEntries.sort((a, b) => b[1] - a[1])[0];
  const lowestDay = dayEntries.sort((a, b) => a[1] - b[1])[0];
  const avgTxn = list.length ? total / list.length : 0;
  const byCat: Record<string, number> = {};
  list.forEach((e) => (byCat[e.categoryId] = (byCat[e.categoryId] || 0) + e.amount));
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const highestCategory = catEntries ? categories.find((c) => c.id === catEntries[0])?.name : null;
  return { total, avgDaily, highestDay, lowestDay, avgTxn, count: list.length, highestCategory, list };
}

export function ReportsPage({
  expenses,
  categories,
  paymentMethods,
  budget,
}: {
  expenses: Expense[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budget: number;
}) {
  const todayStr = iso(TODAY);
  const [from, setFrom] = useState(todayStr.slice(0, 8) + "01");
  const [to, setTo] = useState(todayStr);
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [compare, setCompare] = useState(false);

  const current = useMemo(() => statsFor(expenses, from, to, categories), [expenses, from, to, categories]);

  const prevRange = useMemo(() => {
    const n = daysBetween(from, to);
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -(n - 1));
    return [prevFrom, prevTo] as const;
  }, [from, to]);
  const previous = useMemo(() => statsFor(expenses, prevRange[0], prevRange[1], categories), [expenses, prevRange, categories]);

  const changePct = previous.total ? ((current.total - previous.total) / previous.total) * 100 : null;
  const budgetUtilization = budget ? (current.total / budget) * 100 : 0;

  const rangeInvalid = from > to;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">التقارير</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">من</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">إلى</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
        <button
          onClick={() => setCompare((c) => !c)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            compare ? "bg-emerald-700 border-emerald-700 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          مقارنة بالفترة السابقة
        </button>
      </div>

      {rangeInvalid ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <EmptyState title="نطاق تاريخ غير صحيح" subtitle="تاريخ البداية يجب أن يكون قبل تاريخ النهاية." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">إجمالي المصروفات</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{fmtMoney(current.total)}</div>
              {compare && changePct !== null && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1.5 ${changePct <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {changePct > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(changePct).toFixed(1)}% مقارنة بالفترة السابقة
                </span>
              )}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">متوسط الإنفاق اليومي</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{fmtMoney(current.avgDaily)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">عدد العمليات</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{current.count}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">متوسط قيمة العملية</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{fmtMoney(current.avgTxn)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">أعلى يوم إنفاقًا</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{current.highestDay ? fmtMoney(current.highestDay[1]) : "—"}</div>
              <div className="text-xs text-slate-400 mt-0.5">{current.highestDay ? fmtFullDate(current.highestDay[0]) : ""}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">أقل يوم إنفاقًا</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{current.lowestDay ? fmtMoney(current.lowestDay[1]) : "—"}</div>
              <div className="text-xs text-slate-400 mt-0.5">{current.lowestDay ? fmtFullDate(current.lowestDay[0]) : ""}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">أعلى تصنيف إنفاقًا</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{current.highestCategory || "—"}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">نسبة استخدام الميزانية</span>
              <div className={`text-2xl font-bold tabular-nums mt-1 ${budgetUtilization > 100 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"}`}>
                {budgetUtilization.toFixed(0)}%
              </div>
            </div>
          </div>

          <SpendingChart expenses={current.list} granularity={granularity} setGranularity={setGranularity} title="تطور الإنفاق خلال الفترة" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdown expenses={current.list} categories={categories} />
            <PaymentMethodBreakdown expenses={current.list} paymentMethods={paymentMethods} />
          </div>
        </>
      )}
    </div>
  );
}
