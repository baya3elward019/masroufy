import { Category, Expense, PaymentMethod } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "أكل", iconKey: "Utensils", color: "emerald", isDefault: true },
  { id: "transport", name: "مواصلات", iconKey: "Car", color: "sky", isDefault: true },
  { id: "shopping", name: "تسوق", iconKey: "ShoppingBag", color: "violet", isDefault: true },
  { id: "bills", name: "فواتير", iconKey: "Zap", color: "amber", isDefault: true },
  { id: "entertainment", name: "ترفيه", iconKey: "Gamepad2", color: "pink", isDefault: true },
  { id: "health", name: "صحة", iconKey: "HeartPulse", color: "rose", isDefault: true },
  { id: "education", name: "تعليم", iconKey: "BookOpen", color: "indigo", isDefault: true },
  { id: "other", name: "أخرى", iconKey: "Package", color: "slate", isDefault: true },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cash", name: "كاش", iconKey: "Wallet" },
  { id: "card", name: "بطاقة", iconKey: "CreditCard" },
  { id: "bank", name: "تحويل بنكي", iconKey: "Landmark" },
  { id: "wallet", name: "محفظة إلكترونية", iconKey: "Smartphone" },
];

export const DEFAULT_MONTHLY_BUDGET = 10000;

export const TODAY = new Date("2026-08-24T18:00:00");

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function seedExpenses(): Expense[] {
  const rows: [string, string, string, string, string, string, number][] = [
    // July (previous month, used for comparisons)
    ["2026-07-02", "09:15", "food", "cash", "فطار", "", 65],
    ["2026-07-03", "13:40", "transport", "wallet", "أوبر للشغل", "", 90],
    ["2026-07-05", "19:20", "bills", "bank", "فاتورة الكهرباء", "", 420],
    ["2026-07-07", "16:00", "shopping", "card", "هدوم", "", 850],
    ["2026-07-10", "12:30", "food", "cash", "غداء مطعم", "", 210],
    ["2026-07-12", "21:00", "entertainment", "card", "سينما", "", 180],
    ["2026-07-15", "08:45", "transport", "cash", "بنزين", "", 300],
    ["2026-07-17", "14:10", "health", "wallet", "دوا", "", 150],
    ["2026-07-20", "20:30", "food", "card", "عشا مع الأصحاب", "", 320],
    ["2026-07-23", "10:00", "bills", "bank", "فاتورة الإنترنت", "", 250],
    ["2026-07-24", "17:45", "other", "cash", "متنوع", "", 140],
    // August (current month)
    ["2026-08-01", "09:00", "bills", "bank", "إيجار الشقة", "", 3500],
    ["2026-08-02", "13:15", "food", "cash", "غداء", "دجاج مشوي", 140],
    ["2026-08-03", "18:40", "transport", "wallet", "أوبر", "", 75],
    ["2026-08-05", "11:20", "shopping", "card", "مستلزمات البيت", "", 480],
    ["2026-08-06", "20:10", "entertainment", "card", "اشتراك نتفلكس", "", 220],
    ["2026-08-08", "14:00", "food", "cash", "قهوة وحلويات", "", 95],
    ["2026-08-09", "09:30", "transport", "cash", "بنزين", "", 350],
    ["2026-08-11", "19:00", "health", "wallet", "كشف دكتور", "", 400],
    ["2026-08-13", "12:45", "food", "card", "غداء شغل", "", 180],
    ["2026-08-15", "16:30", "education", "bank", "كورس أونلاين", "", 600],
    ["2026-08-17", "21:15", "entertainment", "cash", "خروجة أصحاب", "", 260],
    ["2026-08-19", "10:00", "bills", "bank", "فاتورة الموبايل", "", 180],
    ["2026-08-20", "13:00", "food", "cash", "غداء", "", 155],
    ["2026-08-21", "17:20", "shopping", "card", "حذاء رياضة", "", 650],
    ["2026-08-22", "08:50", "transport", "wallet", "مواصلات", "", 60],
    ["2026-08-23", "12:30", "food", "card", "فطار متأخر", "", 120],
    ["2026-08-24", "14:30", "food", "cash", "غداء", "مطعم", 250],
    ["2026-08-24", "09:10", "transport", "wallet", "أوبر للشغل", "", 85],
  ];
  return rows.map(([date, time, categoryId, paymentMethod, description, notes, amount]) => ({
    id: uid(),
    date,
    time,
    categoryId,
    paymentMethod,
    description,
    notes,
    amount,
    createdAt: `${date}T${time}:00`,
  }));
}
