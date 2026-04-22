import { useState, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { Input, Btn, ConfirmDialog } from "@/components/UI";
import { Settings as SettingsIcon, Save, Download, Upload, KeyRound, Trash2, Building2 } from "lucide-react";
import { db, hashPassword } from "@/lib/database";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, setSettings, refresh } = useApp();
  const [form, setForm] = useState(settings);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveCompany = () => {
    setSettings(form);
    toast.success("تم حفظ الإعدادات");
  };

  const changePassword = () => {
    if (hashPassword(oldPwd) !== settings.passwordHash) { toast.error("كلمة المرور القديمة غير صحيحة"); return; }
    if (!newPwd || newPwd !== confirmPwd) { toast.error("كلمة المرور غير متطابقة"); return; }
    setSettings({ ...settings, passwordHash: hashPassword(newPwd) });
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success("تم تغيير كلمة المرور");
  };

  const exportBackup = () => {
    const data = db.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technoflash-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير النسخة الاحتياطية");
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const ok = db.importAll(e.target?.result as string);
      if (ok) { refresh(); toast.success("تم استيراد البيانات"); } else { toast.error("ملف غير صحيح"); }
    };
    reader.readAsText(file);
  };

  const resetAll = () => { db.clearAll(); window.location.reload(); };

  return (
    <div>
      <PageHeader title="الإعدادات" subtitle="تخصيص النظام" icon={<SettingsIcon className="w-7 h-7" />} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* بيانات الشركة */}
        <div className="neu p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" /> بيانات الشركة
          </h3>
          <div className="space-y-4">
            <Input label="اسم الشركة" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <Input label="العنوان" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} />
            <Input label="الهاتف" value={form.companyPhone} onChange={(e) => setForm({ ...form, companyPhone: e.target.value })} />
            <Input label="البريد الإلكتروني" type="email" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="نسبة الضريبة (٪)" type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: +e.target.value })} />
              <Input label="رمز العملة" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <Btn className="w-full" onClick={saveCompany}><Save className="w-4 h-4" /> حفظ التغييرات</Btn>
          </div>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="neu p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> تغيير كلمة المرور
          </h3>
          <div className="space-y-4">
            <Input label="كلمة المرور الحالية" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
            <Input label="كلمة المرور الجديدة" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            <Input label="تأكيد كلمة المرور" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
            <Btn className="w-full" onClick={changePassword}><KeyRound className="w-4 h-4" /> تغيير كلمة المرور</Btn>
          </div>
        </div>

        {/* النسخ الاحتياطي */}
        <div className="neu p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-foreground">النسخ الاحتياطي</h3>
          <p className="text-sm text-muted-foreground mb-4">احفظ نسخة من كل بياناتك أو استعدها من ملف.</p>
          <div className="space-y-3">
            <Btn className="w-full" variant="secondary" onClick={exportBackup}>
              <Download className="w-4 h-4" /> تصدير نسخة احتياطية
            </Btn>
            <input ref={fileRef} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
            <Btn className="w-full" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> استيراد نسخة احتياطية
            </Btn>
          </div>
        </div>

        {/* منطقة الخطر */}
        <div className="neu p-6 border-r-4 border-destructive">
          <h3 className="font-display font-bold text-lg mb-4 text-destructive">منطقة الخطر</h3>
          <p className="text-sm text-muted-foreground mb-4">حذف كل البيانات لا يمكن التراجع عنه. تأكد من عمل نسخة احتياطية أولاً.</p>
          <Btn variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
            <Trash2 className="w-4 h-4" /> حذف جميع البيانات
          </Btn>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        تكنوفلاش - الإصدار ١.٠ • تطوير محمد ربيع • مجاني ومفتوح المصدر
      </p>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetAll}
        title="حذف جميع البيانات" message="سيتم حذف كل البيانات نهائياً. هل أنت متأكد؟" />
    </div>
  );
}
