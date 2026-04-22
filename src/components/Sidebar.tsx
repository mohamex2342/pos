import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  ShoppingBag, Wallet, BarChart3, Settings as SettingsIcon, LogOut, Moon, Sun, Menu, X
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import { toast } from "sonner";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "لوحة المعلومات" },
  { to: "/products", icon: Package, label: "المنتجات" },
  { to: "/sales", icon: ShoppingCart, label: "المبيعات" },
  { to: "/customers", icon: Users, label: "العملاء" },
  { to: "/suppliers", icon: Truck, label: "الموردون" },
  { to: "/purchases", icon: ShoppingBag, label: "المشتريات" },
  { to: "/debts", icon: Wallet, label: "الديون" },
  { to: "/reports", icon: BarChart3, label: "التقارير" },
  { to: "/settings", icon: SettingsIcon, label: "الإعدادات" },
];

export const Sidebar = () => {
  const { logout, settings, setSettings } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" });
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج");
  };

  return (
    <>
      {/* زر القائمة للجوال */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 right-4 z-50 neu-btn p-3"
        aria-label="القائمة"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* الخلفية للجوال */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-72 z-40 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full bg-sidebar flex flex-col p-5 border-l border-sidebar-border">
          {/* الشعار */}
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-black text-xl">ت</span>
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-gradient">تكنوفلاش</h2>
                <p className="text-xs text-muted-foreground">نقاط البيع</p>
              </div>
            </div>
          </div>

          {/* القائمة */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    active
                      ? "gradient-primary text-primary-foreground shadow-lg"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* أدوات أسفل */}
          <div className="space-y-2 pt-4 border-t border-sidebar-border">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground transition-all"
            >
              {settings.theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-semibold text-sm">
                {settings.theme === "dark" ? "الوضع المضيء" : "الوضع الداكن"}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
