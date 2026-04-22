import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Textarea } from "@/components/UI";
import { Wallet, Printer, Plus, AlertTriangle } from "lucide-react";
import { Payment, genId } from "@/lib/database";
import { formatCurrency, toArabicDigits } from "@/lib/format";
import { toast } from "sonner";
import { printReceipt } from "@/lib/print";

export default function Debts() {
  const { customers, setCustomers, suppliers, setSuppliers, payments, setPayments, settings } = useApp();
  const [tab, setTab] = useState<"customers" | "suppliers">("customers");
  const [open, setOpen] = useState(false);
  const [partyId, setPartyId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const debtCustomers = useMemo(() => customers.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance), [customers]);
  const debtSuppliers = useMemo(() => suppliers.filter((s) => s.balance > 0).sort((a, b) => b.balance - a.balance), [suppliers]);

  const totalCustomerDebt = debtCustomers.reduce((a, c) => a + c.balance, 0);
  const totalSupplierDebt = debtSuppliers.reduce((a, s) => a + s.balance, 0);

  const recordPayment = () => {
    const amt = +amount;
    if (!partyId || !amt) { toast.error("أدخل البيانات"); return; }

    if (tab === "customers") {
      const c = customers.find((x) => x.id === partyId)!;
      setCustomers(customers.map((x) => x.id === partyId ? { ...x, balance: x.balance - amt } : x));
      const p: Payment = { id: genId(), type: "customer", partyId, partyName: c.name, amount: amt, date: Date.now(), notes };
      setPayments([p, ...payments]);
      printReceipt({ partyName: c.name, amount: amt, date: Date.now(), notes, type: "customer" }, settings);
    } else {
      const s = suppliers.find((x) => x.id === partyId)!;
      setSuppliers(suppliers.map((x) => x.id === partyId ? { ...x, balance: x.balance - amt } : x));
      const p: Payment = { id: genId(), type: "supplier", partyId, partyName: s.name, amount: amt, date: Date.now(), notes };
      setPayments([p, ...payments]);
      printReceipt({ partyName: s.name, amount: amt, date: Date.now(), notes, type: "supplier" }, settings);
    }
    toast.success("تم تسجيل الدفعة");
    setOpen(false); setPartyId(""); setAmount(""); setNotes("");
  };

  const list = tab === "customers" ? debtCustomers : debtSuppliers;

  return (
    <div>
      <PageHeader
        title="الديون والمدفوعات"
        subtitle="إدارة الديون من العملاء وللموردين"
        icon={<Wallet className="w-7 h-7" />}
        action={<Btn onClick={() => setOpen(true)}><Plus className="w-5 h-5" /> تسجيل دفعة</Btn>}
      />

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="neu p-5 border-r-4 border-destructive">
          <p className="text-xs text-muted-foreground mb-1">إجمالي ديون العملاء</p>
          <p className="font-display font-black text-2xl text-destructive">{formatCurrency(totalCustomerDebt, settings.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{toArabicDigits(debtCustomers.length)} عميل مدين</p>
        </div>
        <div className="neu p-5 border-r-4 border-warning">
          <p className="text-xs text-muted-foreground mb-1">إجمالي ديون الموردين</p>
          <p className="font-display font-black text-2xl text-warning">{formatCurrency(totalSupplierDebt, settings.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{toArabicDigits(debtSuppliers.length)} مورد مستحق له</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("customers")} className={`px-5 py-3 rounded-xl font-bold transition-all ${tab === "customers" ? "gradient-primary text-primary-foreground shadow-lg" : "neu-btn"}`}>
          العملاء المدينون
        </button>
        <button onClick={() => setTab("suppliers")} className={`px-5 py-3 rounded-xl font-bold transition-all ${tab === "suppliers" ? "gradient-primary text-primary-foreground shadow-lg" : "neu-btn"}`}>
          الموردون
        </button>
      </div>

      {list.length === 0 ? (
        <div className="neu p-12 text-center text-muted-foreground">
          <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>لا توجد ديون</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="neu p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{p.name}</p>
                  {p.phone && <p className="text-xs text-muted-foreground">{toArabicDigits(p.phone)}</p>}
                </div>
              </div>
              <div className="text-left">
                <p className="font-display font-black text-destructive text-lg">{formatCurrency(p.balance, settings.currency)}</p>
                <button
                  onClick={() => { setPartyId(p.id); setOpen(true); }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  تسجيل دفعة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-display font-bold text-lg mb-3 text-foreground">آخر المدفوعات</h3>
        <div className="space-y-2">
          {payments.slice(0, 10).map((p) => (
            <div key={p.id} className="neu-sm p-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-foreground">{p.partyName}</p>
                <p className="text-xs text-muted-foreground">{p.type === "customer" ? "استلام من عميل" : "دفع لمورد"} - {new Date(p.date).toLocaleString("ar-EG")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-success">{formatCurrency(p.amount, settings.currency)}</span>
                <button onClick={() => printReceipt({ partyName: p.partyName, amount: p.amount, date: p.date, notes: p.notes, type: p.type }, settings)} className="neu-btn p-2">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="تسجيل دفعة">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{tab === "customers" ? "العميل" : "المورد"}</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className="w-full px-4 py-3 neu-inset bg-transparent outline-none">
              <option value="">اختر</option>
              {(tab === "customers" ? customers : suppliers).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.balance, settings.currency)})</option>
              ))}
            </select>
          </div>
          <Input label="المبلغ *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Textarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setOpen(false)}>إلغاء</Btn>
            <Btn onClick={recordPayment}><Printer className="w-4 h-4" /> حفظ وطباعة الإيصال</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
