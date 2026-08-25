import { useMemo, useState } from "react";
import { Search, Plus, Download } from "lucide-react";
import { Category, Expense, PaymentMethod } from "../types";
import { TODAY } from "../data";
import { fmtMoney, inRange, iso, startOfWeek } from "../utils";
import { exportToCSV } from "../utils";
import { ExpenseRow } from "../components/ExpenseRow";
import { EmptyState } from "../components/Basics";

export function ExpensesPage({
  expenses,
  categories,
  paymentMethods,
  onAdd,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [quickRange, setQuickRange] = useState("all");

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const pmMap = Object.fromEntries(paymentMethods.map((p) => [p.id, p]));

  const filtered = useMemo(() => {
    const todayStr = iso(TODAY);
    const weekStart = startOfWeek(todayStr);
    const monthStart = todayStr.slice(0, 7) + "-01";
    return expenses
      .filter((e) => (categoryFilter === "all" ? true : e.categoryId === categoryFilter))
      .filter((e) => (paymentFilter === "all" ? true : e.paymentMethod === paymentFilter))
      .filter((e) => {
        if (quickRange === "day") return e.date === todayStr;
        if (quickRange === "week") return inRange(e.date, weekStart, todayStr);
        if (quickRange === "month") return inRange(e.date, monthStart, todayStr);
        return true;
      })
      .filter((e) => (search ? (e.description + " " + (catMap[e.categoryId]?.name || "")).includes(search) : true))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [expenses, search, categoryFilter, paymentFilter, quickRange]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">المصروفات</h1>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filtered, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <Download size={16} /> تصدير CSV
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <Plus size={16} /> إضافة مصروف
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الوصف أو التصنيف..."
              className="bg-transparent outline-none text-sm flex-1 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">كل طرق الدفع</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            ["all", "الكل"],
            ["day", "اليوم"],
            ["week", "هذا الأسبوع"],
            ["month", "هذا الشهر"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setQuickRange(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                quickRange === val ? "bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-xs text-slate-400 mr-auto">
            {filtered.length} عملية · إجمالي <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{fmtMoney(total)}</span>
          </span>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="md:hidden inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
      >
        <Plus size={16} /> إضافة مصروف
      </button>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <EmptyState title="لا توجد مصروفات مطابقة" subtitle="جرّب تغيير الفلاتر أو أضف مصروفًا جديدًا." actionLabel="إضافة مصروف" onAction={onAdd} />
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  {["التاريخ", "التصنيف", "الوصف", "طريقة الدفع", "المبلغ", "الإجراءات"].map((h) => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <ExpenseRow key={e.id} expense={e} category={catMap[e.categoryId]} paymentMethod={pmMap[e.paymentMethod]} onEdit={onEdit} onDelete={onDelete} isTableRow />
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4">
            {filtered.map((e) => (
              <ExpenseRow key={e.id} expense={e} category={catMap[e.categoryId]} paymentMethod={pmMap[e.paymentMethod]} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
