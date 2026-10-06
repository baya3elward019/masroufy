export interface Category {
  id: string;
  name: string;
  iconKey: string;
  color: string; // key into COLOR_OPTIONS
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconKey: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod: string;
  description: string;
  notes: string;
  createdAt: string;
}

export interface CategoryBudget {
  categoryId: string;
  amount: number;
}

export interface BudgetExtra {
  id: string;
  month: string; // YYYY-MM the extra income applies to
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD it was added
}

export interface AppData {
  expenses: Expense[];
  categories: Category[];
  monthlyBudget: number;
  categoryBudgets: CategoryBudget[];
  budgetExtras: BudgetExtra[];
  theme: "light" | "dark" | "system";
}

export type View = "dashboard" | "expenses" | "reports" | "budget" | "categories" | "settings";
