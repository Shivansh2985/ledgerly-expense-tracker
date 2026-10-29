export const CATEGORIES = [
  { key: "food", label: "Food & Dining", color: "#F97362", icon: "UtensilsCrossed" },
  { key: "groceries", label: "Groceries", color: "#34C38F", icon: "ShoppingBasket" },
  { key: "transport", label: "Transport", color: "#4C8DFF", icon: "Car" },
  { key: "shopping", label: "Shopping", color: "#B76CFD", icon: "ShoppingBag" },
  { key: "bills", label: "Bills & Utilities", color: "#F5B83D", icon: "Receipt" },
  { key: "rent", label: "Rent & Housing", color: "#6C7AE0", icon: "Home" },
  { key: "entertainment", label: "Entertainment", color: "#FF6FB5", icon: "Clapperboard" },
  { key: "health", label: "Health", color: "#22B8CF", icon: "HeartPulse" },
  { key: "education", label: "Education", color: "#845EF7", icon: "GraduationCap" },
  { key: "travel", label: "Travel", color: "#20C997", icon: "Plane" },
  { key: "personal", label: "Personal Care", color: "#E599F7", icon: "Sparkles" },
  { key: "gifts", label: "Gifts & Donations", color: "#FF922B", icon: "Gift" },
  { key: "investments", label: "Investments", color: "#2F9E44", icon: "TrendingUp" },
  { key: "other", label: "Other", color: "#94A3B8", icon: "CircleDot" },
] as const;

export const PAYMENT_MODES = [
  { key: "cash", label: "Cash", color: "#34C38F", icon: "Banknote" },
  { key: "upi", label: "UPI", color: "#6C5CE7", icon: "Smartphone" },
  { key: "debit_card", label: "Debit Card", color: "#4C8DFF", icon: "CreditCard" },
  { key: "credit_card", label: "Credit Card", color: "#F97362", icon: "CreditCard" },
  { key: "net_banking", label: "Net Banking", color: "#F5B83D", icon: "Landmark" },
  { key: "wallet", label: "Wallet", color: "#FF6FB5", icon: "Wallet" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export type PaymentModeKey = (typeof PAYMENT_MODES)[number]["key"];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [CategoryKey, ...CategoryKey[]];
export const PAYMENT_MODE_KEYS = PAYMENT_MODES.map((m) => m.key) as [PaymentModeKey, ...PaymentModeKey[]];

export const categoryMeta = (key: string) => CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
export const modeMeta = (key: string) => PAYMENT_MODES.find((m) => m.key === key) ?? PAYMENT_MODES[0];

export const AUTH_COOKIE = "et_token";
