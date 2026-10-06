import { CURRENCY, TODAY } from "./data";
import { Expense } from "./types";
import { fmtFullDate, fmtMoney, iso } from "./utils";

export interface PdfReportOptions {
  ownerName: string;
  expenses: Expense[];
  categoryNameOf: (id: string) => string;
  paymentNameOf: (id: string) => string;
  periodLabel?: string;
  budget?: number;
}

function esc(v: unknown) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

/**
 * Builds a print-ready report and opens the browser's print dialog, where the user picks "Save as PDF".
 * Printing real HTML keeps Arabic shaping and RTL correct, which client-side PDF libraries do not.
 */
export function exportToPDF({ ownerName, expenses, categoryNameOf, paymentNameOf, periodLabel, budget }: PdfReportOptions) {
  const rows = [...expenses].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  const total = rows.reduce((s, e) => s + e.amount, 0);
  const period =
    periodLabel || (rows.length ? `${fmtFullDate(rows[0].date)} — ${fmtFullDate(rows[rows.length - 1].date)}` : "—");

  const byCat: Record<string, number> = {};
  rows.forEach((e) => (byCat[e.categoryId] = (byCat[e.categoryId] || 0) + e.amount));
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  const name = ownerName.trim();
  const title = `تقرير مصروفات${name ? " - " + name : ""} - ${iso(TODAY)}`;

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif; color: #0f172a; margin: 0; font-size: 11pt; line-height: 1.6; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #047857; padding-bottom: 10px; margin-bottom: 16px; }
  h1 { font-size: 20pt; margin: 0; color: #047857; }
  .owner { font-size: 14pt; font-weight: 700; margin-top: 2px; }
  .meta { text-align: left; font-size: 9.5pt; color: #475569; }
  h2 { font-size: 12pt; margin: 18px 0 8px; color: #047857; }
  .cards { display: flex; gap: 8px; }
  .card { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
  .card span { display: block; font-size: 9pt; color: #64748b; }
  .card b { font-size: 13pt; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { background: #ecfdf5; text-align: right; color: #065f46; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 8px; vertical-align: top; }
  td.num, th.num { text-align: left; white-space: nowrap; font-variant-numeric: tabular-nums; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
  tfoot td { font-weight: 700; background: #f8fafc; }
  footer { margin-top: 18px; font-size: 9pt; color: #64748b; text-align: center; }
</style>
</head>
<body>
<header>
  <div>
    <h1>تقرير المصروفات</h1>
    ${name ? `<div class="owner">${esc(name)}</div>` : ""}
  </div>
  <div class="meta">
    <div>الفترة: ${esc(period)}</div>
    <div>تاريخ الإصدار: ${esc(fmtFullDate(iso(TODAY)))}</div>
    <div>العملة: ${esc(CURRENCY.name)}</div>
  </div>
</header>

<div class="cards">
  <div class="card"><span>إجمالي المصروفات</span><b>${esc(fmtMoney(total))}</b></div>
  <div class="card"><span>عدد العمليات</span><b>${rows.length}</b></div>
  ${
    budget !== undefined
      ? `<div class="card"><span>ميزانية الشهر الحالي</span><b>${esc(fmtMoney(budget))}</b></div>`
      : ""
  }
</div>

<h2>حسب التصنيف</h2>
<table>
  <thead><tr><th>التصنيف</th><th class="num">المبلغ</th><th class="num">النسبة</th></tr></thead>
  <tbody>
    ${catRows
      .map(
        ([id, amt]) =>
          `<tr><td>${esc(categoryNameOf(id))}</td><td class="num">${esc(fmtMoney(amt))}</td><td class="num">${total ? Math.round((amt / total) * 100) : 0}%</td></tr>`
      )
      .join("")}
  </tbody>
</table>

<h2>تفاصيل المصروفات</h2>
<table>
  <thead><tr><th>التاريخ</th><th>التصنيف</th><th>الوصف</th><th>طريقة الدفع</th><th class="num">المبلغ</th></tr></thead>
  <tbody>
    ${rows
      .map(
        (e) =>
          `<tr><td style="white-space:nowrap">${esc(e.date)}</td><td>${esc(categoryNameOf(e.categoryId))}</td><td>${esc(e.description)}${
            e.notes ? `<br><small style="color:#64748b">${esc(e.notes)}</small>` : ""
          }</td><td>${esc(paymentNameOf(e.paymentMethod))}</td><td class="num">${esc(fmtMoney(e.amount))}</td></tr>`
      )
      .join("")}
  </tbody>
  <tfoot><tr><td colspan="4">الإجمالي</td><td class="num">${esc(fmtMoney(total))}</td></tr></tfoot>
</table>

<footer>تم إنشاء هذا التقرير بواسطة تطبيق مصروفي</footer>
</body>
</html>`;

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  const win = frame.contentWindow!;
  const prevTitle = document.title;
  let printed = false;
  const print = () => {
    if (printed) return;
    printed = true;
    document.title = title; // some browsers name the saved PDF after the top-level page
    win.focus();
    win.print();
    setTimeout(() => {
      document.title = prevTitle;
      frame.remove();
    }, 1000);
  };
  const fontsReady = (doc as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
  fontsReady.then(() => setTimeout(print, 150));
  setTimeout(print, 2500); // don't wait forever if the font can't load (offline)
}
