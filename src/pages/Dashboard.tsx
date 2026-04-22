import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { LayoutDashboard, TrendingUp, Package, Users, AlertTriangle, DollarSign, ShoppingCart, Wallet } from "lucide-react";
import { formatCurrency, formatInt, formatDate } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMemo } from "react";

export default function Dashboard() {
  const { sales, products, customers, settings } = useApp();

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const todaySales = sales.filter((s) => s.date >= today.getTime());
    const monthSales = sales.filter((s) => s.date >= monthStart.getTime());

    const totalSales = sales.reduce((a, s) => a + s.total, 0);
    const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
    const monthTotal = monthSales.reduce((a, s) => a + s.total, 0);
    const lowStock = products.filter((p) => p.quantity <= p.minQuantity);
    const totalDebts = customers.reduce((a, c) => a + Math.max(0, c.balance), 0);

    return { totalSales, todayTotal, monthTotal, lowStock, totalDebts, todayCount: todaySales.length };
  }, [sales, products, customers]);

  const chartData = useMemo(() => {
    const days: { name: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = d.getTime() + 86400000;
      const total = sales.filter((s) => s.date >= d.getTime() && s.date < next).reduce((a, s) => a + s.total, 0);
      days.push({ name: d.toLocaleDateString("ar-EG", { weekday: "short" }), total: Math.round(total) });
    }
    return days;
  }, [sales]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; total: number }> = {};
    sales.forEach((s) => s.items.forEach((it) => {
      counts[it.productId] = counts[it.productId] || { name: it.name, qty: 0, total: 0 };
      counts[it.productId].qty += it.quantity;
      counts[it.productId].total += it.total;
    }));
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const cards = [
    { label: "إجمالي المبيعات", value: formatCurrency(stats.totalSales, settings.currency), icon: DollarSign, gradient: "gradient-primary" },
    { label: "مبيعات اليوم", value: formatCurrency(stats.todayTotal, settings.currency), icon: TrendingUp, gradient: "gradient-accent" },
    { label: "مبيعات الشهر", value: formatCurrency(stats.monthTotal, settings.currency), icon: ShoppingCart, gradient: "gradient-secondary" },
    { label: "إجمالي الديون", value: formatCurrency(stats.totalDebts, settings.currency), icon: Wallet, gradient: "gradient-warm" },
    { label: "المنتجات", value: formatInt(products.length), icon: Package, gradient: "gradient-primary" },
    { label: "العملاء", value: formatInt(customers.length - 1), icon: Users, gradient: "gradient-accent" },
    { label: "فواتير اليوم", value: formatInt(stats.todayCount), icon: ShoppingCart, gradient: "gradient-secondary" },
    { label: "تنبيهات المخزون", value: formatInt(stats.lowStock.length), icon: AlertTriangle, gradient: "gradient-warm" },
  ];

  return (
    <div>
      <PageHeader
        title="لوحة المعلومات"
        subtitle={`أهلاً بك في ${settings.companyName} - ${formatDate(Date.now())}`}
        icon={<LayoutDashboard className="w-7 h-7" />}
      />

      {/* البطاقات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="neu p-5 hover:scale-[1.02] transition-transform">
              <div className={`w-12 h-12 rounded-xl ${c.gradient} flex items-center justify-center shadow-lg mb-3`}>
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className="text-lg font-display font-black text-foreground">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* رسم بياني */}
        <div className="neu p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground">مبيعات الأسبوع</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* أفضل المنتجات */}
        <div className="neu p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground">أفضل المنتجات مبيعاً</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="qty" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">لا توجد بيانات بعد</div>
          )}
        </div>
      </div>

      {/* تنبيهات المخزون */}
      {stats.lowStock.length > 0 && (
        <div className="neu p-6 border-r-4 border-warning">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">تنبيهات المخزون المنخفض</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStock.slice(0, 6).map((p) => (
              <div key={p.id} className="neu-sm p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-warning font-bold">{formatInt(p.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
