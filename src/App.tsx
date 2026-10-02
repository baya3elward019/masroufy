import { useCallback, useEffect, useMemo, useState } from "react";
import { AppData, Category, CategoryBudget, Expense, View } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_MONTHLY_BUDGET, DEFAULT_PAYMENT_METHODS, seedExpenses } from "./data";
import { loadData, saveData } from "./storage";
import { Sidebar, BottomNav } from "./components/Shell";
import { Toast, ToastState, SkeletonCard } from "./components/Basics";
import { ExpenseFormModal, ConfirmDeleteModal } from "./components/ExpenseModals";
import { Dashboard } from "./pages/Dashboard";
import { ExpensesPage } from "./pages/Expenses";
import { ReportsPage } from "./pages/Reports";
import { BudgetPage } from "./pages/Budget";
import { CategoriesPage } from "./pages/Categories";
import { SettingsPage } from "./pages/Settings";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [monthlyBudget, setMonthlyBudget] = useState(DEFAULT_MONTHLY_BUDGET);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  const [view, setView] = useState<View>("dashboard");
  const [dateTab, setDateTab] = useState("month");
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [modalMode, setModalMode] = useState<null | "add" | Expense>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const paymentMethods = DEFAULT_PAYMENT_METHODS;

  useEffect(() => {
    const stored = loadData();
    if (stored && Array.isArray(stored.expenses)) {
      setExpenses(stored.expenses);
      setCategories(stored.categories && stored.categories.length ? stored.categories : DEFAULT_CATEGORIES);
      setMonthlyBudget(stored.monthlyBudget ?? DEFAULT_MONTHLY_BUDGET);
      setCategoryBudgets(stored.categoryBudgets || []);
      setTheme(stored.theme || "light");
    } else {
      setExpenses(seedExpenses());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const data: AppData = { expenses, categories, monthlyBudget, categoryBudgets, theme };
    saveData(data);
  }, [expenses, categories, monthlyBudget, categoryBudgets, theme, loading]);

  useEffect(() => {
    const root = document.documentElement;
    const applyDark = (dark: boolean) => root.classList.toggle("dark", dark);
    if (theme === "dark") applyDark(true);
    else if (theme === "light") applyDark(false);
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyDark(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSaveExpense = useCallback(
    (expense: Expense) => {
      const isAdd = modalMode === "add";
      setExpenses((prev) => {
        const exists = prev.some((e) => e.id === expense.id);
        return exists ? prev.map((e) => (e.id === expense.id ? expense : e)) : [expense, ...prev];
      });
      setModalMode(null);
      setToast({ type: "success", message: isAdd ? "تمت إضافة المصروف بنجاح" : "تم حفظ التعديل بنجاح" });
    },
    [modalMode]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToast({ type: "success", message: "تم حذف المصروف" });
  }, [deleteTarget]);

  const handleAddCategory = useCallback((c: Category) => {
    setCategories((prev) => [...prev, c]);
    setToast({ type: "success", message: "تمت إضافة التصنيف" });
  }, []);

  const handleUpdateCategory = useCallback((c: Category) => {
    setCategories((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setToast({ type: "success", message: "تم حفظ التصنيف" });
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setExpenses((prev) => prev.map((e) => (e.categoryId === id ? { ...e, categoryId: "other" } : e)));
    setCategoryBudgets((prev) => prev.filter((b) => b.categoryId !== id));
    setToast({ type: "success", message: "تم حذف التصنيف" });
  }, []);

  const handleUpdateCategoryBudget = useCallback((categoryId: string, amount: number) => {
    setCategoryBudgets((prev) => {
      const exists = prev.some((b) => b.categoryId === categoryId);
      if (amount <= 0) return prev.filter((b) => b.categoryId !== categoryId);
      return exists ? prev.map((b) => (b.categoryId === categoryId ? { ...b, amount } : b)) : [...prev, { categoryId, amount }];
    });
  }, []);

  const handleReset = useCallback(() => {
    setExpenses(seedExpenses());
    setCategories(DEFAULT_CATEGORIES);
    setMonthlyBudget(DEFAULT_MONTHLY_BUDGET);
    setCategoryBudgets([]);
    setToast({ type: "success", message: "تم إعادة تعيين البيانات" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex">
      <Sidebar view={view} setView={setView} onAdd={() => setModalMode("add")} />

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : view === "dashboard" ? (
          <Dashboard
            expenses={expenses}
            categories={categories}
            paymentMethods={paymentMethods}
            budget={monthlyBudget}
            onAdd={() => setModalMode("add")}
            onEdit={(e) => setModalMode(e)}
            onDelete={(e) => setDeleteTarget(e)}
            dateTab={dateTab}
            setDateTab={setDateTab}
            granularity={granularity}
            setGranularity={setGranularity}
            setView={setView}
          />
        ) : view === "expenses" ? (
          <ExpensesPage
            expenses={expenses}
            categories={categories}
            paymentMethods={paymentMethods}
            onAdd={() => setModalMode("add")}
            onEdit={(e) => setModalMode(e)}
            onDelete={(e) => setDeleteTarget(e)}
          />
        ) : view === "reports" ? (
          <ReportsPage expenses={expenses} categories={categories} paymentMethods={paymentMethods} budget={monthlyBudget} />
        ) : view === "budget" ? (
          <BudgetPage
            expenses={expenses}
            categories={categories}
            monthlyBudget={monthlyBudget}
            categoryBudgets={categoryBudgets}
            onUpdateMonthlyBudget={setMonthlyBudget}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
          />
        ) : view === "categories" ? (
          <CategoriesPage categories={categories} onAdd={handleAddCategory} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory} />
        ) : (
          <SettingsPage theme={theme} setTheme={setTheme} expenses={expenses} categories={categories} paymentMethods={paymentMethods} onReset={handleReset} setView={setView} />
        )}
      </main>

      <BottomNav view={view} setView={setView} onAdd={() => setModalMode("add")} />

      {modalMode && (
        <ExpenseFormModal
          initial={modalMode === "add" ? null : modalMode}
          categories={categories}
          paymentMethods={paymentMethods}
          onClose={() => setModalMode(null)}
          onSave={handleSaveExpense}
        />
      )}
      <ConfirmDeleteModal expense={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
      <Toast toast={toast} />
    </div>
  );
}
