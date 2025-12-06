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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'store_manager' | 'salesperson')[] }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'admin' || role === 'store_manager') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/sales" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const getDefaultRedirect = () => {
    if (!isAuthenticated || !role) return '/login';
    if (role === 'admin' || role === 'store_manager') return '/admin';
    return '/sales';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login />}
      />
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/salespeople"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <Salespeople />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <AllSales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/returns"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <ReturnsApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overdue"
        element={
          <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
            <OverdueDrums />
          </ProtectedRoute>
        }
      />

      {/* Salesperson Routes */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['salesperson']}>
            <SalesDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute allowedRoles={['salesperson']}>
            <NewSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/return"
        element={
          <ProtectedRoute allowedRoles={['salesperson']}>
            <SubmitReturn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers"
        element={
          <ProtectedRoute allowedRoles={['salesperson']}>
            <MyCustomers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/overdue"
        element={
          <ProtectedRoute allowedRoles={['salesperson']}>
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
