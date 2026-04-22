import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Textarea, ConfirmDialog } from "@/components/UI";
import { Users, Plus, Search, Edit2, Trash2, Phone, Printer } from "lucide-react";
import { Customer, genId } from "@/lib/database";
import { formatCurrency, toArabicDigits } from "@/lib/format";
import { toast } from "sonner";
import { printCustomerStatement } from "@/lib/print";

export default function Customers() {
  const { customers, setCustomers, sales, settings } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  const filtered = useMemo(() => customers.filter((c) => !search || c.name.includes(search) || c.phone.includes(search)), [customers, search]);

  const openAdd = () => { setEditing(null); setForm({ name: "", phone: "", email: "", address: "", balance: 0 }); setOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm(c); setOpen(true); };

  const save = () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    if (editing) {
      setCustomers(customers.map((c) => c.id === editing.id ? { ...c, ...form } as Customer : c));
      toast.success("تم التحديث");
    } else {
      const newC: Customer = { id: genId(), name: form.name!, phone: form.phone || "", email: form.email || "", address: form.address || "", balance: Number(form.balance) || 0, createdAt: Date.now() };
      setCustomers([...customers, newC]);
      toast.success("تمت الإضافة");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    if (id === "guest") { toast.error("لا يمكن حذف العميل الافتراضي"); return; }
    setCustomers(customers.filter((c) => c.id !== id));
    toast.success("تم الحذف");
  };

  return (
    <div>
      <PageHeader
        title="العملاء"
        subtitle={`${toArabicDigits(customers.length - 1)} عميل`}
        icon={<Users className="w-7 h-7" />}
        action={<Btn onClick={openAdd}><Plus className="w-5 h-5" /> عميل جديد</Btn>}
      />

      <div className="neu p-4 mb-6 relative">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..." className="w-full pr-11 pl-4 py-3 neu-inset bg-transparent outline-none" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="neu p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-display font-black text-lg shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{c.name}</h3>
                {c.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{toArabicDigits(c.phone)}</p>}
              </div>
            </div>
            {c.address && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{c.address}</p>}
            <div className="flex justify-between items-center mb-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">الرصيد</span>
              <span className={`font-display font-black ${c.balance > 0 ? "text-destructive" : c.balance < 0 ? "text-success" : "text-muted-foreground"}`}>
                {formatCurrency(Math.abs(c.balance), settings.currency)}
                {c.balance > 0 && <span className="text-xs mr-1">مدين</span>}
              </span>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" className="flex-1 py-2 text-sm" onClick={() => openEdit(c)}>
                <Edit2 className="w-4 h-4" />
              </Btn>
              <Btn variant="secondary" className="py-2 px-3" onClick={() => printCustomerStatement(c, sales, settings)}>
                <Printer className="w-4 h-4" />
              </Btn>
              {c.id !== "guest" && (
                <Btn variant="danger" className="py-2 px-3" onClick={() => setDeleteId(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Btn>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "تعديل العميل" : "إضافة عميل جديد"}>
        <div className="space-y-4">
          <Input label="اسم العميل *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="رقم الهاتف" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="البريد الإلكتروني" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea label="العنوان" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="الرصيد الافتتاحي (موجب=مدين)" type="number" value={form.balance || ""} onChange={(e) => setForm({ ...form, balance: +e.target.value })} />
          <div className="flex gap-2 justify-end pt-4">
            <Btn variant="secondary" onClick={() => setOpen(false)}>إلغاء</Btn>
            <Btn onClick={save}>حفظ</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="حذف العميل" message="هل أنت متأكد؟" />
    </div>
  );
}
