import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  LogOut,
  Package,
  UserCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Salespeople', href: '/admin/salespeople', icon: Users },
  { label: 'Customers', href: '/admin/customers', icon: UserCircle },
  { label: 'All Sales', href: '/admin/sales', icon: ShoppingCart },
  { label: 'Returns Approval', href: '/admin/returns', icon: CheckCircle },
  { label: 'Overdue Drums', href: '/admin/overdue', icon: AlertTriangle },
];

const salespersonNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/sales', icon: LayoutDashboard },
  { label: 'New Sale', href: '/sales/new', icon: ShoppingCart },
  { label: 'Submit Return', href: '/sales/return', icon: RotateCcw },
  { label: 'My Customers', href: '/sales/customers', icon: UserCircle },
  { label: 'Overdue', href: '/sales/overdue', icon: AlertTriangle },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navItems = user?.role === 'admin' ? adminNavItems : salespersonNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">DrumTrack</h1>
            <p className="text-xs text-sidebar-foreground/60">25kg Drum Sales</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-semibold">{user?.name.charAt(0)}</span>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
