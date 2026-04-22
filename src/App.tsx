import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/AppContext";
import { Login } from "@/components/Login";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Debts from "./pages/Debts";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const LoginRoute = () => {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/" element={<Protected><Dashboard /></Protected>} />
    <Route path="/products" element={<Protected><Products /></Protected>} />
    <Route path="/sales" element={<Protected><Sales /></Protected>} />
    <Route path="/customers" element={<Protected><Customers /></Protected>} />
    <Route path="/suppliers" element={<Protected><Suppliers /></Protected>} />
    <Route path="/purchases" element={<Protected><Purchases /></Protected>} />
    <Route path="/debts" element={<Protected><Debts /></Protected>} />
    <Route path="/reports" element={<Protected><Reports /></Protected>} />
    <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" dir="rtl" />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
