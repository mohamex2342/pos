import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Btn } from "@/components/UI";
import { BarChart3, Printer, TrendingUp, Package, Users, ShoppingBag } from "lucide-react";
import { formatCurrency, formatInt, toArabicDigits, formatDate } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Period = "today" | "week" | "month" | "year" | "all";

export default function Reports() {
  const { sales, products, customers, purchases, settings } = useApp();
  const [period, setPeriod] = useState<Period>("month");
  const [tab, setTab] = useState<"sales" | "stock" | "customers" | "profit">("sales");

  const periodSales = useMemo(() => {
    const now = Date.now();
    const periods: Record<Period, number> = {
      today: now - 86400000,
      week: now - 7 * 86400000,
      month: now - 30 * 86400000,
      year: now - 365 * 86400000,
      all: 0,
    };
    return sales.filter((s) => s.date >= periods[period]);
  }, [sales, period]);

  const totalRevenue = periodSales.reduce((a, s) => a + s.total, 0);
  const totalCost = periodSales.reduce((a, s) => a + s.items.reduce((b, i) => {
    const p = products.find((p) => p.id === i.productId);
    return b + (p?.cost || 0) * i.quantity;
  }, 0), 0);
  const profit = totalRevenue - totalCost;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodSales.forEach((s) => s.items.forEach((it) => {
      const p = products.find((p) => p.id === it.productId);
      const cat = p?.category || "غير مصنف";
      map[cat] = (map[cat] || 0) + it.total;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [periodSales, products]);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    periodSales.forEach((s) => {
      const key = new Date(s.date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
      days[key] = (days[key] || 0) + s.total;
    });
    return Object.entries(days).map(([name, total]) => ({ name, total: Math.round(total) })).slice(-15);
  }, [periodSales]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--warning))", "hsl(var(--success))"];

  return (
    <div>
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle="تحليل أداء النشاط التجاري"
        icon={<BarChart3 className="w-7 h-7" />}
        action={<Btn variant="secondary" onClick={() => window.print()}><Printer className="w-4 h-4" /> طباعة</Btn>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {(["today", "week", "month", "year", "all"] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${period === p ? "gradient-primary text-primary-foreground shadow-lg" : "neu-btn"}`}>
            {{ today: "اليوم", week: "أسبوع", month: "شهر", year: "سنة", all: "الكل" }[p]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "الإيرادات", value: formatCurrency(totalRevenue, settings.currency), icon: TrendingUp, gr: "gradient-primary" },
          { label: "التكاليف", value: formatCurrency(totalCost, settings.currency), icon: ShoppingBag, gr: "gradient-warm" },
          { label: "صافي الربح", value: formatCurrency(profit, settings.currency), icon: BarChart3, gr: "gradient-accent" },
          { label: "عدد الفواتير", value: formatInt(periodSales.length), icon: Users, gr: "gradient-secondary" },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="neu p-5">
              <div className={`w-12 h-12 rounded-xl ${c.gr} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-display font-black text-foreground">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "sales", label: "المبيعات", icon: TrendingUp },
          { id: "stock", label: "المخزون", icon: Package },
          { id: "customers", label: "العملاء", icon: Users },
          { id: "profit", label: "الأرباح", icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${tab === t.id ? "gradient-accent text-accent-foreground shadow-lg" : "neu-btn"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="printable">
        {tab === "sales" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="neu p-6">
              <h3 className="font-display font-bold mb-4">المبيعات اليومية</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="neu p-6">
              <h3 className="font-display font-bold mb-4">المبيعات حسب الفئة</h3>
              {byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>}
            </div>
          </div>
        )}

        {tab === "stock" && (
          <div className="neu p-6">
            <h3 className="font-display font-bold mb-4">حالة المخزون</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-3">المنتج</th>
                    <th className="text-right p-3">الفئة</th>
                    <th className="text-right p-3">الكمية</th>
                    <th className="text-right p-3">السعر</th>
                    <th className="text-right p-3">قيمة المخزون</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-bold">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className={`p-3 ${p.quantity <= p.minQuantity ? "text-destructive font-bold" : ""}`}>{formatInt(p.quantity)}</td>
                      <td className="p-3">{formatCurrency(p.price, settings.currency)}</td>
                      <td className="p-3 font-bold text-primary">{formatCurrency(p.price * p.quantity, settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div className="neu p-6">
            <h3 className="font-display font-bold mb-4">تقرير العملاء</h3>
            <div className="space-y-2">
              {customers.filter((c) => c.id !== "guest").map((c) => {
                const cSales = sales.filter((s) => s.customerId === c.id);
                const totalP = cSales.reduce((a, s) => a + s.total, 0);
                return (
                  <div key={c.id} className="neu-sm p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{toArabicDigits(cSales.length)} فاتورة</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">{formatCurrency(totalP, settings.currency)}</p>
                      {c.balance > 0 && <p className="text-xs text-destructive">مدين: {formatCurrency(c.balance, settings.currency)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "profit" && (
          <div className="neu p-6">
            <h3 className="font-display font-bold mb-4">تقرير الأرباح</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="neu-inset p-4 text-center">
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-display font-black text-primary mt-2">{formatCurrency(totalRevenue, settings.currency)}</p>
              </div>
              <div className="neu-inset p-4 text-center">
                <p className="text-sm text-muted-foreground">إجمالي التكاليف</p>
                <p className="text-2xl font-display font-black text-warning mt-2">{formatCurrency(totalCost, settings.currency)}</p>
              </div>
              <div className="neu-inset p-4 text-center">
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className={`text-2xl font-display font-black mt-2 ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(profit, settings.currency)}
                </p>
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              نسبة الربح: <span className="font-bold text-primary">{toArabicDigits(totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0")}٪</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
