import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Modal, Input, Btn, Select, Textarea, ConfirmDialog } from "@/components/UI";
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Product, genId } from "@/lib/database";
import { formatCurrency, formatInt } from "@/lib/format";
import { toast } from "sonner";

export default function Products() {
  const { products, setProducts, settings } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.includes(search) || p.barcode?.includes(search);
      const matchCat = category === "all" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const openAdd = () => { setEditing(null); setForm({ name: "", price: 0, cost: 0, quantity: 0, category: "", minQuantity: 5, description: "" }); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm(p); setOpen(true); };

  const save = () => {
    if (!form.name || !form.price) { toast.error("الاسم والسعر مطلوبان"); return; }
    if (editing) {
      setProducts(products.map((p) => p.id === editing.id ? { ...p, ...form } as Product : p));
      toast.success("تم تحديث المنتج");
    } else {
      const newP: Product = {
        id: genId(),
        name: form.name!,
        description: form.description || "",
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        quantity: Number(form.quantity) || 0,
        category: form.category || "عام",
        minQuantity: Number(form.minQuantity) || 5,
        barcode: form.barcode,
        createdAt: Date.now(),
      };
      setProducts([newP, ...products]);
      toast.success("تمت إضافة المنتج");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("تم الحذف");
  };

  return (
    <div>
      <PageHeader
        title="المنتجات"
        subtitle={`إجمالي ${formatInt(products.length)} منتج`}
        icon={<Package className="w-7 h-7" />}
        action={<Btn onClick={openAdd}><Plus className="w-5 h-5" /> منتج جديد</Btn>}
      />

      <div className="neu p-4 mb-6 grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنتج أو الباركود..."
            className="w-full pr-11 pl-4 py-3 neu-inset bg-transparent outline-none"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">جميع الفئات</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="neu p-12 text-center text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>لا توجد منتجات</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const low = p.quantity <= p.minQuantity;
            return (
              <div key={p.id} className="neu p-5 hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  {low && <AlertTriangle className="w-5 h-5 text-warning shrink-0" />}
                </div>
                {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                <div className="flex justify-between items-center mb-3 pt-3 border-t border-border">
                  <span className="text-lg font-display font-black text-primary">{formatCurrency(p.price, settings.currency)}</span>
                  <span className={`text-sm font-bold ${low ? "text-warning" : "text-success"}`}>
                    الكمية: {formatInt(p.quantity)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Btn variant="secondary" className="flex-1 py-2 text-sm" onClick={() => openEdit(p)}>
                    <Edit2 className="w-4 h-4" /> تعديل
                  </Btn>
                  <Btn variant="danger" className="py-2 px-3" onClick={() => setDeleteId(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "تعديل المنتج" : "إضافة منتج جديد"} size="lg">
        <div className="space-y-4">
          <Input label="اسم المنتج *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="الوصف" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="سعر البيع *" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            <Input label="سعر التكلفة" type="number" value={form.cost || ""} onChange={(e) => setForm({ ...form, cost: +e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="الكمية" type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
            <Input label="الحد الأدنى للتنبيه" type="number" value={form.minQuantity || ""} onChange={(e) => setForm({ ...form, minQuantity: +e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="الفئة" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="الباركود (اختياري)" value={form.barcode || ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Btn variant="secondary" onClick={() => setOpen(false)}>إلغاء</Btn>
            <Btn onClick={save}>حفظ</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع."
      />
    </div>
  );
}
