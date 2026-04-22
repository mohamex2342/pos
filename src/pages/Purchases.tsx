import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Select } from "@/components/UI";
import { ShoppingBag, Plus, Trash2, X } from "lucide-react";
import { Purchase, SaleItem, genId } from "@/lib/database";
import { formatCurrency, formatInt, toArabicDigits, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function Purchases() {
  const { products, setProducts, suppliers, setSuppliers, purchases, setPurchases, settings, setSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [paid, setPaid] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const total = items.reduce((a, i) => a + i.total, 0);

  const addItem = () => {
    const p = products.find((x) => x.id === productId);
    if (!p) { toast.error("اختر منتج"); return; }
    const q = +qty; const pr = +price || p.cost || p.price;
    if (q <= 0) { toast.error("الكمية غير صحيحة"); return; }
    setItems([...items, { productId: p.id, name: p.name, price: pr, quantity: q, total: q * pr }]);
    setProductId(""); setQty("1"); setPrice("");
  };

  const save = () => {
    if (!supplierId) { toast.error("اختر المورد"); return; }
    if (items.length === 0) { toast.error("أضف منتجات"); return; }
    const sup = suppliers.find((s) => s.id === supplierId)!;
    const paidAmount = paymentMethod === "cash" ? total : (+paid || 0);

    const purchase: Purchase = {
      id: genId(), invoiceNumber: settings.purchaseCounter + 1,
      supplierId, supplierName: sup.name, items,
      subtotal: total, total, paymentMethod, paid: paidAmount,
      remaining: total - paidAmount, date: Date.now(),
    };

    // تحديث المخزون
    const updP = products.map((p) => {
      const it = items.find((i) => i.productId === p.id);
      return it ? { ...p, quantity: p.quantity + it.quantity, cost: it.price } : p;
    });

    // تحديث رصيد المورد
    if (purchase.remaining > 0) {
      setSuppliers(suppliers.map((s) => s.id === supplierId ? { ...s, balance: s.balance + purchase.remaining } : s));
    }

    setProducts(updP);
    setPurchases([purchase, ...purchases]);
    setSettings({ ...settings, purchaseCounter: settings.purchaseCounter + 1 });
    toast.success("تم حفظ فاتورة الشراء");
    setOpen(false); setItems([]); setSupplierId(""); setPaid("");
  };

  return (
    <div>
      <PageHeader
        title="المشتريات"
        subtitle={`${toArabicDigits(purchases.length)} فاتورة`}
        icon={<ShoppingBag className="w-7 h-7" />}
        action={<Btn onClick={() => setOpen(true)}><Plus className="w-5 h-5" /> فاتورة شراء</Btn>}
      />

      {purchases.length === 0 ? (
        <div className="neu p-12 text-center text-muted-foreground">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>لا توجد مشتريات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="neu p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">فاتورة #{toArabicDigits(p.invoiceNumber)}</p>
                <p className="text-xs text-muted-foreground">{p.supplierName}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(p.date)}</p>
              </div>
              <div className="text-left">
                <p className="font-display font-black text-primary">{formatCurrency(p.total, settings.currency)}</p>
                {p.remaining > 0 && <p className="text-xs text-destructive mt-1">متبقي: {formatCurrency(p.remaining, settings.currency)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="فاتورة شراء جديدة" size="xl">
        <div className="space-y-4">
          <Select label="المورد *" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">اختر المورد</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <div className="neu-inset p-4 rounded-xl">
            <p className="font-bold mb-3">إضافة منتج</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">اختر منتج</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Input type="number" placeholder="الكمية" value={qty} onChange={(e) => setQty(e.target.value)} />
              <Input type="number" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} />
              <Btn onClick={addItem}><Plus className="w-4 h-4" /> إضافة</Btn>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((it, i) => (
              <div key={i} className="neu-sm p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{formatInt(it.quantity)} × {formatCurrency(it.price, settings.currency)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{formatCurrency(it.total, settings.currency)}</span>
                  <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-destructive"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xl pt-3 border-t border-border">
            <span className="font-display font-black">الإجمالي:</span>
            <span className="font-display font-black text-primary">{formatCurrency(total, settings.currency)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "cash" | "credit")}>
              <option value="cash">نقد</option>
              <option value="credit">على الحساب</option>
            </Select>
            {paymentMethod === "credit" && <Input type="number" placeholder="المدفوع" value={paid} onChange={(e) => setPaid(e.target.value)} />}
          </div>

          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setOpen(false)}>إلغاء</Btn>
            <Btn onClick={save}>حفظ الفاتورة</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
