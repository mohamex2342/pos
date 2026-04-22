import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { db, hashPassword } from "@/lib/database";
import { Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Login = () => {
  const { login } = useApp();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = db.getSettings();
    if (hashPassword(password) === settings.passwordHash) {
      login();
      toast.success("مرحباً بك في تكنوفلاش");
    } else {
      toast.error("كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-primary shadow-lg mb-6">
            <Lock className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-black text-gradient mb-2">تكنوفلاش</h1>
          <p className="text-muted-foreground">نظام إدارة نقاط البيع العربي</p>
        </div>

        <form onSubmit={handleSubmit} className="neu p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-3 text-foreground">كلمة المرور</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-4 neu-inset bg-transparent outline-none text-foreground placeholder:text-muted-foreground pr-4 pl-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 gradient-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <LogIn className="w-5 h-5" />
            تسجيل الدخول
          </button>

          <p className="text-xs text-center text-muted-foreground">
            كلمة المرور الافتراضية: <span className="font-bold text-primary">١٢٣</span>
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © تكنوفلاش - تطوير محمد ربيع
        </p>
      </div>
    </div>
  );
};
