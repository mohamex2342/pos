import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:mr-72 p-4 lg:p-8 min-h-screen animate-fade-in">
        {children}
      </main>
    </div>
  );
};
