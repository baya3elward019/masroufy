import { useState } from "react";
import { Sun, Moon, Monitor, Download, RotateCcw, TrendingUp, Tag, ChevronLeft, FileSpreadsheet, FileDown } from "lucide-react";
import { Expense, View } from "../types";
import { exportToCSV, exportToExcel } from "../utils";
import { Category, PaymentMethod } from "../types";
import { PdfExportModal } from "../components/PdfExport";

export function SettingsPage({
  budget,
  theme,
  setTheme,
  expenses,
  categories,
  paymentMethods,
  onReset,
  setView,
}: {
  budget: number;
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  expenses: Expense[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onReset: () => void;
  setView: (v: View) => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const pmMap = Object.fromEntries(paymentMethods.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8 max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">الإعدادات</h1>

      <div className="md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <button onClick={() => setView("reports")} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <TrendingUp size={18} className="text-slate-500 dark:text-slate-400" />
          <span className="flex-1 text-right text-sm font-medium text-slate-700 dark:text-slate-200">التقارير</span>
          <ChevronLeft size={16} className="text-slate-300" />
        </button>
        <button onClick={() => setView("categories")} className="w-full flex items-center gap-3 px-5 py-3.5">
          <Tag size={18} className="text-slate-500 dark:text-slate-400" />
          <span className="flex-1 text-right text-sm font-medium text-slate-700 dark:text-slate-200">التصنيفات</span>
          <ChevronLeft size={16} className="text-slate-300" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">المظهر</h3>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["light", "فاتح", Sun],
              ["dark", "داكن", Moon],
              ["system", "تلقائي", Monitor],
            ] as const
          ).map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setTheme(val)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                theme === val ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">العملة</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">العملة الافتراضية للتطبيق</p>
        <select
          disabled
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none opacity-70"
        >
          <option>دينار ليبي (LYD)</option>
        </select>
        <p className="text-xs text-slate-400 mt-2">دعم عملات إضافية سيتوفر قريبًا.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">تصدير البيانات</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">تصدير كل مصروفاتك كملف CSV أو Excel أو تقرير PDF باسمك.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToCSV(expenses, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <Download size={16} /> تصدير CSV
          </button>
          <button
            onClick={() => exportToExcel(expenses, (id) => catMap[id]?.name || id, (id) => pmMap[id]?.name || id)}
            className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <FileSpreadsheet size={16} /> تصدير Excel
          </button>
          <button
            onClick={() => setPdfOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <FileDown size={16} /> تقرير PDF
          </button>
        </div>
        <PdfExportModal
          open={pdfOpen}
          onClose={() => setPdfOpen(false)}
          expenses={expenses}
          budget={budget}
          categoryNameOf={(id) => catMap[id]?.name || id}
          paymentNameOf={(id) => pmMap[id]?.name || id}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6">
        <h3 className="font-semibold text-rose-700 dark:text-rose-400 mb-1">إعادة تعيين البيانات</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">حذف كل المصروفات والتصنيفات المخصصة والعودة إلى بيانات المثال.</p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-400 text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <RotateCcw size={16} /> إعادة التعيين
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">متأكد؟ لا يمكن التراجع.</span>
            <button onClick={() => { onReset(); setConfirmReset(false); }} className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg">
              تأكيد الحذف
            </button>
            <button onClick={() => setConfirmReset(false)} className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5">
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
