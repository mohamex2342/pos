import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Textarea, ConfirmDialog } from "@/components/UI";
import { Truck, Plus, Search, Edit2, Trash2, Phone } from "lucide-react";
import { Supplier, genId } from "@/lib/database";
import { formatCurrency, toArabicDigits } from "@/lib/format";
import { toast } from "sonner";

export default function Suppliers() {
  const { suppliers, setSuppliers, settings } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const filtered = useMemo(() => suppliers.filter((s) => !search || s.name.includes(search) || s.phone.includes(search)), [suppliers, search]);

  const openAdd = () => { setEditing(null); setForm({ name: "", phone: "", email: "", address: "", balance: 0 }); setOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setOpen(true); };

  const save = () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    if (editing) {
      setSuppliers(suppliers.map((s) => s.id === editing.id ? { ...s, ...form } as Supplier : s));
      toast.success("تم التحديث");
    } else {
      setSuppliers([...suppliers, { id: genId(), name: form.name!, phone: form.phone || "", email: form.email || "", address: form.address || "", balance: Number(form.balance) || 0, createdAt: Date.now() }]);
      toast.success("تمت الإضافة");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="الموردون"
        subtitle={`${toArabicDigits(suppliers.length)} مورد`}
        icon={<Truck className="w-7 h-7" />}
        action={<Btn onClick={openAdd}><Plus className="w-5 h-5" /> مورد جديد</Btn>}
      />

      <div className="neu p-4 mb-6 relative">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث..." className="w-full pr-11 pl-4 py-3 neu-inset bg-transparent outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="neu p-12 text-center text-muted-foreground">
          <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>لا يوجد موردون</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="neu p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-secondary-foreground font-display font-black text-lg shrink-0">{s.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{s.name}</h3>
                  {s.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{toArabicDigits(s.phone)}</p>}
                </div>
              </div>
              <div className="flex justify-between items-center mb-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">المستحق له</span>
                <span className={`font-display font-black ${s.balance > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {formatCurrency(Math.abs(s.balance), settings.currency)}
                </span>
              </div>
              <div className="flex gap-2">
                <Btn variant="secondary" className="flex-1 py-2 text-sm" onClick={() => openEdit(s)}><Edit2 className="w-4 h-4" /> تعديل</Btn>
                <Btn variant="danger" className="py-2 px-3" onClick={() => setDeleteId(s.id)}><Trash2 className="w-4 h-4" /></Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "تعديل المورد" : "إضافة مورد جديد"}>
        <div className="space-y-4">
          <Input label="اسم المورد *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="رقم الهاتف" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="البريد الإلكتروني" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea label="العنوان" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="الرصيد الافتتاحي (موجب = مستحق له)" type="number" value={form.balance || ""} onChange={(e) => setForm({ ...form, balance: +e.target.value })} />
          <div className="flex gap-2 justify-end pt-4">
            <Btn variant="secondary" onClick={() => setOpen(false)}>إلغاء</Btn>
            <Btn onClick={save}>حفظ</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { setSuppliers(suppliers.filter((s) => s.id !== deleteId)); toast.success("تم الحذف"); } }} title="حذف المورد" message="هل أنت متأكد؟" />
    </div>
  );
}
