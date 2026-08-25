import { useState } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { Category } from "../types";
import { COLOR_KEYS, COLOR_OPTIONS } from "../colors";
import { CATEGORY_ICON_CHOICES } from "../icons";
import { IconBadge } from "../components/Basics";
import { uid } from "../data";

export function CategoriesPage({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[];
  onAdd: (c: Category) => void;
  onUpdate: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">التصنيفات</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} /> تصنيف جديد
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => {
          const spec = COLOR_OPTIONS[c.color] || COLOR_OPTIONS.slate;
          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 text-center group relative">
              <IconBadge iconKey={c.iconKey} className={`${spec.bg} ${spec.text} w-12 h-12`} size={22} />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                  تعديل
                </button>
                {c.id !== "other" && (
                  <button onClick={() => setConfirmDelete(c)} className="text-xs font-medium text-rose-600 dark:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    حذف
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <CategoryFormModal
          initial={editing}
          onClose={() => setShowForm(false)}
          onSave={(c) => {
            if (editing) onUpdate(c);
            else onAdd(c);
            setShowForm(false);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-sheet-in">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">حذف تصنيف "{confirmDelete.name}"؟</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">أي مصروفات مرتبطة بهذا التصنيف ستُنقل إلى تصنيف "أخرى". لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                إلغاء
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors"
              >
                حذف التصنيف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryFormModal({ initial, onClose, onSave }: { initial: Category | null; onClose: () => void; onSave: (c: Category) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [iconKey, setIconKey] = useState(initial?.iconKey || CATEGORY_ICON_CHOICES[0]);
  const [color, setColor] = useState(initial?.color || COLOR_KEYS[0]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError("من فضلك أدخل اسم التصنيف");
      return;
    }
    onSave({
      id: initial?.id || uid(),
      name: name.trim(),
      iconKey,
      color,
      isDefault: initial?.isDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-sheet-in">
        <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{initial ? "تعديل التصنيف" : "تصنيف جديد"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">اسم التصنيف</label>
            <input
              value={name}
              onChange={(e) => {
                setError("");
                setName(e.target.value);
              }}
              placeholder="مثال: هدايا"
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-600 outline-none rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            />
            {error && <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5">{error}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">الأيقونة</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_ICON_CHOICES.map((key) => {
                const spec = COLOR_OPTIONS[color];
                return (
                  <button
                    key={key}
                    onClick={() => setIconKey(key)}
                    className={`flex items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      iconKey === key ? `border-emerald-600 ${spec.bg}` : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <IconBadge iconKey={key} className={iconKey === key ? spec.text : "text-slate-500 dark:text-slate-400"} size={18} />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">اللون</label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setColor(key)}
                  className={`w-9 h-9 rounded-full ${COLOR_OPTIONS[key].dot} transition-transform ${color === key ? "ring-2 ring-offset-2 ring-emerald-600 scale-105" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            إلغاء
          </button>
          <button onClick={submit} className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold text-sm transition-all">
            {initial ? "حفظ" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}
