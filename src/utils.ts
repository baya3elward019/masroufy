import { TODAY } from "./data";
import { Expense } from "./types";

export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function fmtMoney(n: number) {
  const rounded = Math.round(n * 100) / 100;
  const isWhole = Number.isInteger(rounded);
  return (
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }) + " ج.م"
  );
}

export function fmtDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((new Date(iso(TODAY) + "T00:00:00").getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

export function fmtFullDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

export function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function startOfWeek(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return iso(d);
}

export function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

export function daysBetween(from: string, to: string) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

export function inRange(dateStr: string, from: string, to: string) {
  return dateStr >= from && dateStr <= to;
}

export function sumExpenses(list: Expense[]) {
  return list.reduce((s, e) => s + e.amount, 0);
}

export function exportToCSV(expenses: Expense[], categoryNameOf: (id: string) => string, paymentNameOf: (id: string) => string) {
  const header = ["التاريخ", "التصنيف", "الوصف", "طريقة الدفع", "المبلغ", "ملاحظات"];
  const rows = expenses.map((e) => [
    e.date,
    categoryNameOf(e.categoryId),
    e.description,
    paymentNameOf(e.paymentMethod),
    String(e.amount),
    e.notes,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `masrofy-export-${iso(TODAY)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
