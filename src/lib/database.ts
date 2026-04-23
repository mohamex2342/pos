// طبقة قاعدة البيانات المحلية - localStorage
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
  minQuantity: number;
  barcode?: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number; // موجب = مدين علينا، سالب = له رصيد
  createdAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  createdAt: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: number;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  taxAmount: number;
  total: number;
  paymentMethod: "cash" | "credit";
  paid: number;
  remaining: number;
  date: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: number;
  supplierId: string;
  supplierName: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: "cash" | "credit";
  paid: number;
  remaining: number;
  date: number;
}

export interface Payment {
  id: string;
  type: "customer" | "supplier";
  partyId: string;
  partyName: string;
  amount: number;
  date: number;
  notes?: string;
}

export interface Settings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxRate: number;
  currency: string;
  passwordHash: string;
  theme: "light" | "dark";
  logo?: string;
  invoiceCounter: number;
  purchaseCounter: number;
}

const KEYS = {
  products: "tf_products",
  customers: "tf_customers",
  suppliers: "tf_suppliers",
  sales: "tf_sales",
  purchases: "tf_purchases",
  payments: "tf_payments",
  settings: "tf_settings",
  session: "tf_session",
};

// تشفير بسيط لكلمة المرور
export const hashPassword = (pwd: string): string => {
  let hash = 0;
  const salt = "technoflash_2024";
  const str = pwd + salt;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
};

const get = <T>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const set = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const db = {
  // المنتجات
  getProducts: (): Product[] => get(KEYS.products, []),
  saveProducts: (data: Product[]) => set(KEYS.products, data),

  // العملاء
  getCustomers: (): Customer[] => {
    const list = get<Customer[]>(KEYS.customers, []);
    if (!list.find((c) => c.id === "guest")) {
      list.unshift({
        id: "guest",
        name: "عميل نقدي (ضيف)",
        phone: "",
        email: "",
        address: "",
        balance: 0,
        createdAt: Date.now(),
      });
      set(KEYS.customers, list);
    }
    return list;
  },
  saveCustomers: (data: Customer[]) => set(KEYS.customers, data),

  // الموردون
  getSuppliers: (): Supplier[] => get(KEYS.suppliers, []),
  saveSuppliers: (data: Supplier[]) => set(KEYS.suppliers, data),

  // المبيعات
  getSales: (): Sale[] => get(KEYS.sales, []),
  saveSales: (data: Sale[]) => set(KEYS.sales, data),

  // المشتريات
  getPurchases: (): Purchase[] => get(KEYS.purchases, []),
  savePurchases: (data: Purchase[]) => set(KEYS.purchases, data),

  // المدفوعات
  getPayments: (): Payment[] => get(KEYS.payments, []),
  savePayments: (data: Payment[]) => set(KEYS.payments, data),

  // الإعدادات
  getSettings: (): Settings => {
    const def: Settings = {
      companyName: "اسم المستخدم",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      taxRate: 15,
      currency: "ج.م",
      passwordHash: hashPassword("123"),
      theme: "light",
      invoiceCounter: 1000,
      purchaseCounter: 1000,
    };
    return { ...def, ...get(KEYS.settings, {}) };
  },
  saveSettings: (data: Settings) => set(KEYS.settings, data),

  // الجلسة
  isLoggedIn: (): boolean => get(KEYS.session, false),
  setLoggedIn: (v: boolean) => set(KEYS.session, v),

  // النسخ الاحتياطي
  exportAll: (): string => {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([k, v]) => {
      const item = localStorage.getItem(v);
      if (item) data[k] = JSON.parse(item);
    });
    return JSON.stringify({ version: 1, exportedAt: Date.now(), data }, null, 2);
  },
  importAll: (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const data = parsed.data || parsed;
      Object.entries(KEYS).forEach(([k, v]) => {
        if (data[k]) set(v, data[k]);
      });
      return true;
    } catch {
      return false;
    }
  },
  clearAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

// ID مولّد
export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
