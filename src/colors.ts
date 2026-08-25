export interface ColorSpec {
  bg: string;
  text: string;
  dot: string;
  chart: string;
}

export const COLOR_OPTIONS: Record<string, ColorSpec> = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", chart: "#059669" },
  sky: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500", chart: "#0284c7" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500", chart: "#7c3aed" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", chart: "#d97706" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-700 dark:text-pink-400", dot: "bg-pink-500", chart: "#db2777" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500", chart: "#e11d48" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500", chart: "#4f46e5" },
  slate: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400", chart: "#64748b" },
  teal: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500", chart: "#0d9488" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500", chart: "#ea580c" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-400", dot: "bg-cyan-500", chart: "#0891b2" },
  fuchsia: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", text: "text-fuchsia-700 dark:text-fuchsia-400", dot: "bg-fuchsia-500", chart: "#c026d3" },
};

export const COLOR_KEYS = Object.keys(COLOR_OPTIONS);
