import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Select } from "@/components/UI";
import { ShoppingCart, Plus, Trash2, Search, Printer, X } from "lucide-react";
import { Sale, SaleItem, genId, Product } from "@/lib/database";
import { formatCurrency, formatInt, toArabicDigits } from "@/lib/format";
import { toast } from "sonner";
import { printInvoice } from "@/lib/print";

export default function Sales() {
  const { products, setProducts, customers, setCustomers, sales, setSales, settings, setSettings } = useApp();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("guest");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [paid, setPaid] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);

  const filtered = useMemo(() => products.filter((p) => p.name.includes(search) || p.barcode?.includes(search)).slice(0, 12), [products, search]);

  const subtotal = cart.reduce((a, i) => a + i.total, 0);
  const taxAmount = (subtotal * settings.taxRate) / 100;
  const total = subtotal + taxAmount;

  const addToCart = (p: Product) => {
    if (p.quantity <= 0) { toast.error("نفذ المخزون"); return; }
    const existing = cart.find((i) => i.productId === p.id);
    if (existing) {
      if (existing.quantity >= p.quantity) { toast.error("الكمية غير متوفرة"); return; }
      setCart(cart.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
    } else {
      setCart([...cart, { productId: p.id, name: p.name, price: p.price, quantity: 1, total: p.price }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { setCart(cart.filter((i) => i.productId !== id)); return; }
    const product = products.find((p) => p.id === id);
    if (product && qty > product.quantity) { toast.error("الكمية غير متوفرة"); return; }
    setCart(cart.map((i) => i.productId === id ? { ...i, quantity: qty, total: qty * i.price } : i));
  };

  const checkout = () => {
    if (cart.length === 0) { toast.error("السلة فارغة"); return; }
    const paidAmount = paymentMethod === "cash" ? total : (Number(paid) || 0);
    const customer = customers.find((c) => c.id === customerId)!;

    const sale: Sale = {
      id: genId(),
      invoiceNumber: settings.invoiceCounter + 1,
      customerId,
      customerName: customer.name,
      items: cart,
      subtotal,
      tax: settings.taxRate,
      taxAmount,
      total,
      paymentMethod,
      paid: paidAmount,
      remaining: total - paidAmount,
      date: Date.now(),
    };

    // تحديث المخزون
    const updatedProducts = products.map((p) => {
      const item = cart.find((i) => i.productId === p.id);
      return item ? { ...p, quantity: p.quantity - item.quantity } : p;
    });

    // تحديث رصيد العميل عند الدين
    if (sale.remaining > 0 && customerId !== "guest") {
      setCustomers(customers.map((c) => c.id === customerId ? { ...c, balance: c.balance + sale.remaining } : c));
    }

    setProducts(updatedProducts);
    setSales([sale, ...sales]);
    setSettings({ ...settings, invoiceCounter: settings.invoiceCounter + 1 });
    toast.success(`تم حفظ الفاتورة رقم ${toArabicDigits(sale.invoiceNumber)}`);
    printInvoice(sale, settings);

    setCart([]);
    setCustomerId("guest");
    setPaymentMethod("cash");
    setPaid("");
  };

  return (
    <div>
      <PageHeader
        title="المبيعات"
        subtitle="إنشاء فاتورة مبيعات جديدة"
        icon={<ShoppingCart className="w-7 h-7" />}
        action={<Btn variant="secondary" onClick={() => setShowHistory(true)}>سجل المبيعات</Btn>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* المنتجات */}
        <div className="lg:col-span-2">
          <div className="neu p-4 mb-4 relative">
            <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-11 pl-4 py-3 neu-inset bg-transparent outline-none"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.quantity <= 0}
                className="neu-btn p-4 text-right disabled:opacity-50"
              >
                <p className="font-bold text-sm text-foreground line-clamp-2 mb-2">{p.name}</p>
                <p className="text-primary font-display font-black">{formatCurrency(p.price, settings.currency)}</p>
                <p className={`text-xs mt-1 ${p.quantity <= 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  متوفر: {formatInt(p.quantity)}
                </p>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="neu p-12 text-center text-muted-foreground">لا توجد منتجات</div>
          )}
        </div>

        {/* السلة */}
        <div className="neu p-5 h-fit lg:sticky lg:top-4">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> سلة المشتريات
          </h3>

          <Select label="العميل" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mb-3">
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">السلة فارغة</p>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="neu-sm p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-foreground flex-1 line-clamp-1">{item.name}</p>
                    <button onClick={() => updateQty(item.productId, 0)} className="text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="neu-btn w-7 h-7 flex items-center justify-center">−</button>
                      <span className="font-bold w-8 text-center">{formatInt(item.quantity)}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="neu-btn w-7 h-7 flex items-center justify-center">+</button>
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(item.total, settings.currency)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي:</span>
              <span className="font-bold">{formatCurrency(subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الضريبة ({toArabicDigits(settings.taxRate)}٪):</span>
              <span className="font-bold">{formatCurrency(taxAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-border">
              <span className="font-display font-black">الإجمالي:</span>
              <span className="font-display font-black text-primary">{formatCurrency(total, settings.currency)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "cash" | "credit")}>
              <option value="cash">نقد</option>
              <option value="credit">على الحساب</option>
            </Select>
            {paymentMethod === "credit" && (
              <Input type="number" placeholder="المبلغ المدفوع" value={paid} onChange={(e) => setPaid(e.target.value)} />
            )}
            <Btn className="w-full py-4 text-lg" onClick={checkout}>
              <Printer className="w-5 h-5" /> إتمام البيع وطباعة
            </Btn>
          </div>
        </div>
      </div>

      <Modal open={showHistory} onClose={() => setShowHistory(false)} title="سجل المبيعات" size="xl">
        <div className="space-y-2">
          {sales.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد فواتير</p>
          ) : (
            sales.slice(0, 50).map((s) => (
              <div key={s.id} className="neu-sm p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">فاتورة #{toArabicDigits(s.invoiceNumber)}</p>
                  <p className="text-xs text-muted-foreground">{s.customerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleString("ar-EG")}</p>
                </div>
                <div className="text-left">
                  <p className="font-display font-black text-primary">{formatCurrency(s.total, settings.currency)}</p>
                  <button onClick={() => printInvoice(s, settings)} className="text-xs text-primary hover:underline mt-1">
                    طباعة
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
