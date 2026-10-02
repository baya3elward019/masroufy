import { CURRENCY, TODAY } from "./data";
import { Expense } from "./types";

export function iso(d: Date) {
  // Local date (toISOString is UTC and gives yesterday's date just after midnight in UTC+2).
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtMoney(n: number) {
  // The dinar is divided into 1000 dirhams, so keep up to 3 decimals.
  const rounded = Math.round(n * 1000) / 1000;
  const isWhole = Number.isInteger(rounded);
  return (
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 3,
    }) + " " + CURRENCY.symbol
  );
}

export function fmtDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((new Date(iso(TODAY) + "T00:00:00").getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  return d.toLocaleDateString(CURRENCY.locale, { day: "numeric", month: "short" });
}

export function fmtFullDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(CURRENCY.locale, { day: "numeric", month: "long", year: "numeric" });
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

function buildExportRows(expenses: Expense[], categoryNameOf: (id: string) => string, paymentNameOf: (id: string) => string) {
  const header = ["التاريخ", "التصنيف", "الوصف", "طريقة الدفع", "المبلغ", "ملاحظات"];
  const rows = expenses.map((e) => [
    e.date,
    categoryNameOf(e.categoryId),
    e.description,
    paymentNameOf(e.paymentMethod),
    e.amount,
    e.notes,
  ]);
  return { header, rows };
}

export function exportToCSV(expenses: Expense[], categoryNameOf: (id: string) => string, paymentNameOf: (id: string) => string) {
  const { header, rows } = buildExportRows(expenses, categoryNameOf, paymentNameOf);
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

export async function exportToExcel(expenses: Expense[], categoryNameOf: (id: string) => string, paymentNameOf: (id: string) => string) {
  const XLSX = await import("xlsx");
  const { header, rows } = buildExportRows(expenses, categoryNameOf, paymentNameOf);
  const sheetData = [header, ...rows];
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet["!cols"] = [{ wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 16 }, { wch: 12 }, { wch: 26 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "المصروفات");
  XLSX.writeFile(workbook, `masrofy-export-${iso(TODAY)}.xlsx`);
}
