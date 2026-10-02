import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Category, Expense, PaymentMethod } from "../types";
import { iso } from "../utils";
import { CURRENCY, TODAY, uid } from "../data";
import { IconBadge } from "./Basics";
import { COLOR_OPTIONS } from "../colors";
import { ICONS } from "../icons";

export function ExpenseFormModal({
  initial,
  categories,
  paymentMethods,
  onClose,
  onSave,
}: {
  initial: Expense | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onSave: (e: Expense) => void;
}) {
  const isEdit = !!initial;
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id || "other");
  const [date, setDate] = useState(initial?.date || iso(TODAY));
  const [time, setTime] = useState(initial?.time || "12:00");
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || paymentMethods[0]?.id || "cash");
  const [description, setDescription] = useState(initial?.description || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");

  const submit = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError("من فضلك أدخل مبلغًا صحيحًا أكبر من صفر");
      return;
    }
    if (!date) {
      setError("من فضلك اختر التاريخ");
      return;
    }
    onSave({
      id: initial?.id || uid(),
      amount: Math.round(num * 100) / 100,
      categoryId,
      date,
      time,
      paymentMethod,
      description: description.trim(),
      notes: notes.trim(),
      createdAt: initial?.createdAt || `${date}T${time}:00`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-sheet-in">
        <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 z-10">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{isEdit ? "تعديل المصروف" : "إضافة مصروف"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">المبلغ</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus-within:border-emerald-600 rounded-2xl px-4 py-3 transition-colors">
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setError("");
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                }}
                placeholder="0.000"
                className="flex-1 bg-transparent outline-none text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums w-full"
              />
              <span className="text-slate-400 font-semibold">{CURRENCY.symbol}</span>
            </div>
            {error && <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">التصنيف</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((c) => {
                const spec = COLOR_OPTIONS[c.color] || COLOR_OPTIONS.slate;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                      categoryId === c.id ? `border-emerald-600 ${spec.bg}` : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <IconBadge iconKey={c.iconKey} className={`${spec.bg} ${spec.text} w-9 h-9`} size={17} />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center px-0.5">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 outline-none rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">وقت العملية</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 outline-none rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">طريقة الدفع</label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((p) => {
                const Icon = ICONS[p.iconKey];
                return (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                      paymentMethod === p.id
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[10.5px] font-medium">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">الوصف</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: غداء مطعم"
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 outline-none rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">ملاحظات (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 outline-none rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            إلغاء
          </button>
          <button onClick={submit} className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold text-sm transition-all">
            {isEdit ? "حفظ التعديل" : "إضافة المصروف"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ expense, onClose, onConfirm }: { expense: Expense | null; onClose: () => void; onConfirm: () => void }) {
  if (!expense) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-sheet-in">
        <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <Trash2 size={20} />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">هل تريد حذف هذا المصروف؟</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            إلغاء
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors">
            حذف المصروف
          </button>
        </div>
      </div>
    </div>
  );
}
