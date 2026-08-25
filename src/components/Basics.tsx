import { Check, AlertTriangle, Inbox, Plus } from "lucide-react";
import { ICONS } from "../icons";

export function IconBadge({ iconKey, className = "", size = 20 }: { iconKey: string; className?: string; size?: number }) {
  const Icon = ICONS[iconKey] || Inbox;
  return (
    <span className={`inline-flex items-center justify-center rounded-xl ${className}`}>
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}

export interface ToastState {
  type: "success" | "error";
  message: string;
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[70] animate-toast-in">
      <div className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl">
        {toast.type === "success" ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
        <Inbox size={28} />
      </div>
      <p className="text-slate-800 dark:text-slate-100 font-semibold mb-1">{title}</p>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-5 leading-relaxed">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} /> {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
        <AlertTriangle size={26} />
      </div>
      <p className="text-slate-800 dark:text-slate-100 font-semibold mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
