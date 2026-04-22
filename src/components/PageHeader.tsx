import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, action }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8 pt-12 lg:pt-0">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg text-primary-foreground">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
};
