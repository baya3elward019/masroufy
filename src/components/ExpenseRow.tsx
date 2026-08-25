import { Pencil, Trash2 } from "lucide-react";
import { Category, Expense, PaymentMethod } from "../types";
import { fmtDateLabel, fmtMoney, fmtTime } from "../utils";
import { IconBadge } from "./Basics";
import { COLOR_OPTIONS } from "../colors";
import { ICONS } from "../icons";

export function ExpenseRow({
  expense,
  category,
  paymentMethod,
  onEdit,
  onDelete,
  isTableRow,
}: {
  expense: Expense;
  category: Category;
  paymentMethod: PaymentMethod;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
  isTableRow?: boolean;
}) {
  const spec = COLOR_OPTIONS[category.color] || COLOR_OPTIONS.slate;
  const PmIcon = ICONS[paymentMethod.iconKey];

  if (isTableRow) {
    return (
      <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
        <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{fmtDateLabel(expense.date)}</td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center gap-2">
            <IconBadge iconKey={category.iconKey} className={`${spec.bg} ${spec.text} w-8 h-8`} size={15} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{category.name}</span>
          </span>
        </td>
        <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-[220px] truncate">{expense.description || "—"}</td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <PmIcon size={14} className="text-slate-400" /> {paymentMethod.name}
          </span>
        </td>
        <td className="py-3.5 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">{fmtMoney(expense.amount)}</td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(expense)} className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400" title="تعديل">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete(expense)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500" title="حذف">
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <IconBadge iconKey={category.iconKey} className={`${spec.bg} ${spec.text} w-11 h-11 shrink-0`} size={19} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{expense.description || category.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {category.name} · {fmtDateLabel(expense.date)}، {fmtTime(expense.time)} · {paymentMethod.name}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-sm">{fmtMoney(expense.amount)}</span>
        <button onClick={() => onEdit(expense)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(expense)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
