import { useMemo, useState, useRef, useEffect } from "react";
import { Search, Plus, Download, ChevronDown, FileSpreadsheet, FileText, FileDown, SlidersHorizontal } from "lucide-react";
import { Category, Expense, PaymentMethod } from "../types";
import { CURRENCY, TODAY } from "../data";
import { fmtMoney, inRange, iso, startOfWeek } from "../utils";
import { exportToCSV, exportToExcel } from "../utils";
import { ExpenseRow } from "../components/ExpenseRow";
import { EmptyState } from "../components/Basics";
import { PdfExportModal } from "../components/PdfExport";

function ExportMenu({ onCSV, onExcel, onPDF }: { onCSV: () => void; onExcel: () => void; onPDF: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl"
      >
        <Download size={16} /> تصدير <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
          <button
            onClick={() => {
              onCSV();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileText size={15} className="text-slate-400" /> ملف CSV
          </button>
          <button
            onClick={() => {
              onExcel();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet size={15} className="text-slate-400" /> ملف Excel
          </button>
          <button
            onClick={() => {
              onPDF();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileDown size={15} className="text-slate-400" /> تقرير PDF
          </button>
        </div>
      )}
    </div>
  );
}

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
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

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
      .filter((e) => (minAmount ? e.amount >= parseFloat(minAmount) : true))
      .filter((e) => (maxAmount ? e.amount <= parseFloat(maxAmount) : true))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [expenses, search, categoryFilter, paymentFilter, quickRange, minAmount, maxAmount]);

  const amountFilterActive = minAmount !== "" || maxAmount !== "";

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <PdfExportModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        expenses={filtered}
        categoryNameOf={(id) => catMap[id]?.name || id}
        paymentNameOf={(id) => pmMap[id]?.name || id}
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">المصروفات</h1>
        <div className="hidden md:flex items-center gap-2">
          <ExportMenu
            onCSV={() => exportToCSV(filtered, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            onExcel={() => exportToExcel(filtered, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            onPDF={() => setPdfOpen(true)}
          />
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
          <button
            onClick={() => setShowMoreFilters((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              amountFilterActive
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <SlidersHorizontal size={15} /> نطاق المبلغ
          </button>
        </div>

        {showMoreFilters && (
          <div className="flex items-center gap-3 flex-wrap bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-3 animate-fade-in">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">من</span>
            <input
              inputMode="decimal"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none tabular-nums"
            />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إلى</span>
            <input
              inputMode="decimal"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="بلا حد"
              className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none tabular-nums"
            />
            <span className="text-slate-400 text-xs">{CURRENCY.symbol}</span>
            {amountFilterActive && (
              <button
                onClick={() => {
                  setMinAmount("");
                  setMaxAmount("");
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline mr-auto"
              >
                مسح النطاق
              </button>
            )}
          </div>
        )}

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

      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} /> إضافة مصروف
        </button>
        <ExportMenu
          onCSV={() => exportToCSV(filtered, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
          onExcel={() => exportToExcel(filtered, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            onPDF={() => setPdfOpen(true)}
        />
      </div>

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
