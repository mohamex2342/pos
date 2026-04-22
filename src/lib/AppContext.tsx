import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { db, Product, Customer, Supplier, Sale, Purchase, Payment, Settings } from "./database";

interface AppContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  payments: Payment[];
  settings: Settings;
  isAuthenticated: boolean;
  setProducts: (p: Product[]) => void;
  setCustomers: (c: Customer[]) => void;
  setSuppliers: (s: Supplier[]) => void;
  setSales: (s: Sale[]) => void;
  setPurchases: (p: Purchase[]) => void;
  setPayments: (p: Payment[]) => void;
  setSettings: (s: Settings) => void;
  login: () => void;
  logout: () => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [customers, setCustomersState] = useState<Customer[]>([]);
  const [suppliers, setSuppliersState] = useState<Supplier[]>([]);
  const [sales, setSalesState] = useState<Sale[]>([]);
  const [purchases, setPurchasesState] = useState<Purchase[]>([]);
  const [payments, setPaymentsState] = useState<Payment[]>([]);
  const [settings, setSettingsState] = useState<Settings>(db.getSettings());
  const [isAuthenticated, setIsAuthenticated] = useState(db.isLoggedIn());

  const refresh = useCallback(() => {
    setProductsState(db.getProducts());
    setCustomersState(db.getCustomers());
    setSuppliersState(db.getSuppliers());
    setSalesState(db.getSales());
    setPurchasesState(db.getPurchases());
    setPaymentsState(db.getPayments());
    setSettingsState(db.getSettings());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // تطبيق الثيم
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const setProducts = (p: Product[]) => { db.saveProducts(p); setProductsState(p); };
  const setCustomers = (c: Customer[]) => { db.saveCustomers(c); setCustomersState(c); };
  const setSuppliers = (s: Supplier[]) => { db.saveSuppliers(s); setSuppliersState(s); };
  const setSales = (s: Sale[]) => { db.saveSales(s); setSalesState(s); };
  const setPurchases = (p: Purchase[]) => { db.savePurchases(p); setPurchasesState(p); };
  const setPayments = (p: Payment[]) => { db.savePayments(p); setPaymentsState(p); };
  const setSettings = (s: Settings) => { db.saveSettings(s); setSettingsState(s); };

  const login = () => { db.setLoggedIn(true); setIsAuthenticated(true); };
  const logout = () => { db.setLoggedIn(false); setIsAuthenticated(false); };

  return (
    <AppContext.Provider value={{
      products, customers, suppliers, sales, purchases, payments, settings,
      isAuthenticated,
      setProducts, setCustomers, setSuppliers, setSales, setPurchases, setPayments, setSettings,
      login, logout, refresh,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
