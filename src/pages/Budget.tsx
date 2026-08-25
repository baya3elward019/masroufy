import { useState } from "react";
import { Pencil, Check, X, AlertTriangle } from "lucide-react";
import { Category, CategoryBudget, Expense } from "../types";
import { TODAY } from "../data";
import { fmtMoney, inRange, iso } from "../utils";
import { BudgetGauge, ThinProgress } from "../components/Stats";
import { IconBadge } from "../components/Basics";
import { COLOR_OPTIONS } from "../colors";

export function BudgetPage({
  expenses,
  categories,
  monthlyBudget,
  categoryBudgets,
  onUpdateMonthlyBudget,
  onUpdateCategoryBudget,
}: {
  expenses: Expense[];
  categories: Category[];
  monthlyBudget: number;
  categoryBudgets: CategoryBudget[];
  onUpdateMonthlyBudget: (amount: number) => void;
  onUpdateCategoryBudget: (categoryId: string, amount: number) => void;
}) {
  const todayStr = iso(TODAY);
  const monthStart = todayStr.slice(0, 7) + "-01";
  const monthExpenses = expenses.filter((e) => inRange(e.date, monthStart, todayStr));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(monthlyBudget));

  const catSpent = (id: string) => monthExpenses.filter((e) => e.categoryId === id).reduce((s, e) => s + e.amount, 0);
  const budgetFor = (id: string) => categoryBudgets.find((b) => b.categoryId === id)?.amount ?? 0;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">الميزانية</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">الميزانية الشهرية</h3>
          {!editingBudget ? (
            <button
              onClick={() => {
                setBudgetDraft(String(monthlyBudget));
                setEditingBudget(true);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
            >
              <Pencil size={14} /> تعديل
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none tabular-nums"
              />
              <button
                onClick={() => {
                  const n = parseFloat(budgetDraft);
                  if (!isNaN(n) && n > 0) onUpdateMonthlyBudget(n);
                  setEditingBudget(false);
                }}
                className="p-1.5 rounded-lg bg-emerald-700 text-white"
              >
                <Check size={14} />
              </button>
              <button onClick={() => setEditingBudget(false)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <BudgetGauge spent={monthTotal} budget={monthlyBudget} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">ميزانيات التصنيفات</h3>
        <div className="flex flex-col gap-5">
          {categories.map((c) => {
            const spec = COLOR_OPTIONS[c.color] || COLOR_OPTIONS.slate;
            const spent = catSpent(c.id);
            const b = budgetFor(c.id);
            const pct = b ? (spent / b) * 100 : 0;
            const tone = pct >= 100 ? "danger" : pct >= 80 ? "warn" : "ok";
            return (
              <div key={c.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <IconBadge iconKey={c.iconKey} className={`${spec.bg} ${spec.text} w-9 h-9 shrink-0`} size={16} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{c.name}</span>
                  <CategoryBudgetInput value={b} onChange={(n) => onUpdateCategoryBudget(c.id, n)} />
                </div>
                {b > 0 && (
                  <>
                    <ThinProgress pct={pct} tone={tone} />
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="tabular-nums">
                        {fmtMoney(spent)} من {fmtMoney(b)}
                      </span>
                      {pct >= 80 && pct < 100 && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle size={12} /> اقتربت من الحد المحدد
                        </span>
                      )}
                      {pct >= 100 && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                          <AlertTriangle size={12} /> تجاوزت الميزانية
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryBudgetInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value || ""));

  if (!editing) {
    return (
      <button
        onClick={() => {
          setDraft(String(value || ""));
          setEditing(true);
        }}
        className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums hover:text-emerald-700 dark:hover:text-emerald-400"
      >
        {value ? fmtMoney(value) : "تحديد ميزانية"}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
        className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none tabular-nums"
      />
      <button
        onClick={() => {
          const n = parseFloat(draft);
          onChange(isNaN(n) ? 0 : n);
          setEditing(false);
        }}
        className="p-1 rounded-md bg-emerald-700 text-white"
      >
        <Check size={12} />
      </button>
    </div>
  );
}
