import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ open, onClose, title, children, size = "md" }: ModalProps) => {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-card rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = "", ...props }: InputProps) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-2 text-foreground">{label}</label>}
    <input
      {...props}
      className={`w-full px-4 py-3 neu-inset bg-transparent outline-none text-foreground placeholder:text-muted-foreground ${className}`}
    />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = ({ label, className = "", ...props }: TextareaProps) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-2 text-foreground">{label}</label>}
    <textarea
      {...props}
      className={`w-full px-4 py-3 neu-inset bg-transparent outline-none text-foreground placeholder:text-muted-foreground resize-none ${className}`}
      rows={3}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = ({ label, className = "", children, ...props }: SelectProps) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-2 text-foreground">{label}</label>}
    <select
      {...props}
      className={`w-full px-4 py-3 neu-inset bg-transparent outline-none text-foreground ${className}`}
    >
      {children}
    </select>
  </div>
);

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
}

export const Btn = ({ variant = "primary", className = "", children, ...props }: BtnProps) => {
  const variants = {
    primary: "gradient-primary text-primary-foreground shadow-lg hover:shadow-xl",
    secondary: "neu-btn text-foreground",
    ghost: "hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl",
    success: "bg-success text-success-foreground shadow-lg hover:shadow-xl",
  };
  return (
    <button
      {...props}
      className={`px-5 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const ConfirmDialog = ({
  open, onClose, onConfirm, title, message,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl p-6 animate-scale-in">
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="secondary" onClick={onClose}>إلغاء</Btn>
          <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>تأكيد</Btn>
        </div>
      </div>
    </div>
  );
};
