import { Home, Receipt, PlusCircle, Wallet, Tag, Settings, Moon, HelpCircle, User, TrendingUp } from "lucide-react";
import { View } from "../types";

const NAV_ITEMS: { id: View; label: string; Icon: any }[] = [
  { id: "dashboard", label: "الرئيسية", Icon: Home },
  { id: "expenses", label: "المصروفات", Icon: Receipt },
  { id: "reports", label: "التقارير", Icon: TrendingUp },
  { id: "budget", label: "الميزانية", Icon: Wallet },
  { id: "categories", label: "التصنيفات", Icon: Tag },
  { id: "settings", label: "الإعدادات", Icon: Settings },
];

export function Sidebar({ view, setView, onAdd }: { view: View; setView: (v: View) => void; onAdd: () => void }) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">م</div>
        <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">مصروفي</span>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-sm py-2.5 rounded-xl mb-6"
      >
        <PlusCircle size={17} /> إضافة مصروف
      </button>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              view === item.id ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <item.Icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => setView("settings")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Moon size={18} />
          المظهر
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed" title="قريبًا">
          <HelpCircle size={18} />
          مساعدة
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed" title="قريبًا">
          <User size={18} />
          حساب المستخدم
        </button>
      </div>
    </aside>
  );
}

export function BottomNav({ view, setView, onAdd }: { view: View; setView: (v: View) => void; onAdd: () => void }) {
  const primary = NAV_ITEMS.slice(0, 2);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
      {primary.map((item) => (
        <button key={item.id} onClick={() => setView(item.id)} className="flex flex-col items-center gap-0.5 py-1.5 px-2">
          <item.Icon size={20} className={view === item.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"} />
          <span className={`text-[10px] font-medium ${view === item.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>{item.label}</span>
        </button>
      ))}
      <button onClick={onAdd} className="flex flex-col items-center -mt-6">
        <span className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30">
          <PlusCircle size={26} />
        </span>
      </button>
      <button onClick={() => setView("budget")} className="flex flex-col items-center gap-0.5 py-1.5 px-2">
        <Wallet size={20} className={view === "budget" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"} />
        <span className={`text-[10px] font-medium ${view === "budget" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>الميزانية</span>
      </button>
      <button onClick={() => setView("settings")} className="flex flex-col items-center gap-0.5 py-1.5 px-2">
        <Settings size={20} className={view === "settings" || view === "categories" || view === "reports" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"} />
        <span className={`text-[10px] font-medium ${view === "settings" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>المزيد</span>
      </button>
    </nav>
  );
}
