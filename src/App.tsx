import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Salespeople from "./pages/admin/Salespeople";
import Customers from "./pages/admin/Customers";
import AllSales from "./pages/admin/AllSales";
import ReturnsApproval from "./pages/admin/ReturnsApproval";
import OverdueDrums from "./pages/admin/OverdueDrums";
import SalesDashboard from "./pages/sales/SalesDashboard";
import NewSale from "./pages/sales/NewSale";
import SubmitReturn from "./pages/sales/SubmitReturn";
import MyCustomers from "./pages/sales/MyCustomers";
import MyOverdue from "./pages/sales/MyOverdue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'admin' | 'salesperson' }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/sales'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/sales'} replace /> : <Login />}
      />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/salespeople"
        element={
          <ProtectedRoute allowedRole="admin">
            <Salespeople />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRole="admin">
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <ProtectedRoute allowedRole="admin">
            <AllSales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/returns"
        element={
          <ProtectedRoute allowedRole="admin">
            <ReturnsApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overdue"
        element={
          <ProtectedRoute allowedRole="admin">
            <OverdueDrums />
          </ProtectedRoute>
        }
      />

      {/* Salesperson Routes */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRole="salesperson">
            <SalesDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute allowedRole="salesperson">
            <NewSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/return"
        element={
          <ProtectedRoute allowedRole="salesperson">
            <SubmitReturn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers"
        element={
          <ProtectedRoute allowedRole="salesperson">
            <MyCustomers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/overdue"
        element={
          <ProtectedRoute allowedRole="salesperson">
            <MyOverdue />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
