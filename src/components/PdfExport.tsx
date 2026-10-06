import { useEffect, useState } from "react";
import { X, FileDown } from "lucide-react";
import { exportToPDF, PdfReportOptions } from "../pdf";

const NAME_KEY = "masrofy-report-name";

export function PdfExportModal({
  open,
  onClose,
  ...report
}: { open: boolean; onClose: () => void } & Omit<PdfReportOptions, "ownerName">) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {
      /* storage unavailable */
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* storage unavailable */
    }
    exportToPDF({ ...report, ownerName: name });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl animate-sheet-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">تصدير تقرير PDF</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form
          className="p-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">اسم صاحب التقرير</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب الاسم اللي هيظهر على التقرير"
              maxLength={60}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            هيتضمن التقرير {report.expenses.length} عملية. هتفتح نافذة الطباعة — اختر «حفظ بصيغة PDF» كوجهة.
          </p>
          <button
            type="submit"
            disabled={report.expenses.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold px-4 py-3 rounded-xl"
          >
            <FileDown size={16} /> تصدير PDF
          </button>
        </form>
      </div>
    </div>
  );
}
