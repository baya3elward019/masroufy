import { Category, Expense, PaymentMethod } from "../types";
import { TODAY } from "../data";
import { fmtMoney, inRange, iso, startOfWeek, sumExpenses } from "../utils";
import { StatCard, BudgetGauge } from "../components/Stats";
import { SpendingChart, CategoryBreakdown } from "../components/Charts";
import { ExpenseRow } from "../components/ExpenseRow";
import { EmptyState } from "../components/Basics";
import { View } from "../types";

export function Dashboard({
  expenses,
  categories,
  paymentMethods,
  budget,
  onAdd,
  onEdit,
  onDelete,
  dateTab,
  setDateTab,
  granularity,
  setGranularity,
  setView,
}: {
  expenses: Expense[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budget: number;
  onAdd: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
  dateTab: string;
  setDateTab: (v: string) => void;
  granularity: "daily" | "weekly" | "monthly";
  setGranularity: (g: "daily" | "weekly" | "monthly") => void;
  setView: (v: View) => void;
}) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const pmMap = Object.fromEntries(paymentMethods.map((p) => [p.id, p]));

  const todayStr = iso(TODAY);
  const weekStart = startOfWeek(todayStr);
  const monthStart = todayStr.slice(0, 7) + "-01";
  const prevMonthStart = "2026-07-01";
  const prevMonthEnd = "2026-07-24";

  const todayTotal = sumExpenses(expenses.filter((e) => e.date === todayStr));
  const weekTotal = sumExpenses(expenses.filter((e) => inRange(e.date, weekStart, todayStr)));
  const monthTotal = sumExpenses(expenses.filter((e) => inRange(e.date, monthStart, todayStr)));
  const prevMonthTotal = sumExpenses(expenses.filter((e) => inRange(e.date, prevMonthStart, prevMonthEnd)));
  const monthTrend = prevMonthTotal ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;
  const remaining = budget - monthTotal;

  const rangeMap: Record<string, [string, string]> = {
    day: [todayStr, todayStr],
    week: [weekStart, todayStr],
    month: [monthStart, todayStr],
    lastMonth: [prevMonthStart, prevMonthEnd],
  };
  const [from, to] = rangeMap[dateTab] || rangeMap.month;
  const scoped = expenses.filter((e) => inRange(e.date, from, to));
  const recent = [...expenses].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">صباح الخير 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">إليك ملخص مصروفاتك</p>
        </div>
        <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-sm flex-wrap">
          {[
            ["day", "اليوم"],
            ["week", "هذا الأسبوع"],
            ["month", "هذا الشهر"],
            ["lastMonth", "الشهر الماضي"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setDateTab(val)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                dateTab === val ? "bg-emerald-700 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="مصروفات اليوم" amount={todayTotal} trendPct={null} />
        <StatCard label="مصروفات هذا الأسبوع" amount={weekTotal} trendPct={null} />
        <StatCard label="مصروفات هذا الشهر" amount={monthTotal} trendPct={monthTrend} trendGood={monthTrend !== null && monthTrend <= 0} />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">المتبقي من الميزانية</span>
          <span className={`text-2xl font-bold tabular-nums ${remaining < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}>{fmtMoney(remaining)}</span>
          <span className="text-xs text-slate-400 mt-1">من إجمالي {fmtMoney(budget)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-6">
          <SpendingChart expenses={expenses} granularity={granularity} setGranularity={setGranularity} />
          <CategoryBreakdown expenses={expenses} categories={categories} />
        </div>
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">حالة الميزانية</h3>
            <BudgetGauge spent={monthTotal} budget={budget} />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">آخر المصروفات</h3>
              <button onClick={() => setView("expenses")} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
                عرض كل المصروفات
              </button>
            </div>
            {recent.length === 0 ? (
              <EmptyState title="لا توجد مصروفات بعد" subtitle="ابدأ بإضافة أول مصروف لك وسنساعدك على متابعة إنفاقك." actionLabel="إضافة مصروف" onAction={onAdd} />
            ) : (
              <div>
                {recent.map((e) => (
                  <ExpenseRow key={e.id} expense={e} category={catMap[e.categoryId]} paymentMethod={pmMap[e.paymentMethod]} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
