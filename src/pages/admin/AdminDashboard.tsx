import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { ProductBreakdown } from '@/components/dashboard/ProductBreakdown';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useSalespeopleWithStats, useReturnRequests, useSales } from '@/hooks/useSupabaseData';
import { Package, AlertTriangle, Clock, TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salespeople } = useSalespeopleWithStats();
  const { data: returns } = useReturnRequests();
  const { data: sales } = useSales();

  const pendingReturns = returns?.filter((r) => r.status === 'pending') || [];
  const overdueSales = sales?.filter((s) => s.status === 'active' && isPast(new Date(s.due_date))) || [];

  const pendingReturnColumns = [
    { key: 'customer', header: 'Customer', render: (item: any) => (item.sales as any)?.customer_name || 'Unknown' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Submitted', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
  ];

  const overdueColumns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'daysOverdue', header: 'Days Overdue', render: (item: any) => <Badge variant="danger">{differenceInDays(new Date(), new Date(item.due_date))} days</Badge> },
    { key: 'customer_phone', header: 'Phone' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Overview of all drum sales and returns">
      {/* Primary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatCard 
          title="Sales Today" 
          value={statsLoading ? '...' : stats?.totalSalesToday || 0} 
          icon={Calendar} 
          variant="primary" 
          className="stagger-1" 
        />
        <StatCard 
          title="Sales This Month" 
          value={statsLoading ? '...' : stats?.totalSalesThisMonth || 0} 
          icon={Package} 
          variant="default" 
          className="stagger-2" 
        />
        <StatCard 
          title="All-Time Sales" 
          value={statsLoading ? '...' : stats?.totalSalesAllTime || 0} 
          icon={TrendingUp} 
          variant="default" 
          className="stagger-3" 
        />
        <StatCard 
          title="Total Returned" 
          value={statsLoading ? '...' : stats?.totalReturned || 0} 
          icon={CheckCircle} 
          variant="default" 
          className="stagger-4" 
        />
        <StatCard 
          title="Pending Approval" 
          value={statsLoading ? '...' : stats?.totalPendingApproval || 0} 
          icon={Clock} 
          variant="warning" 
          className="stagger-5" 
        />
        <StatCard 
          title="Overdue Drums" 
          value={statsLoading ? '...' : stats?.totalOverdue || 0} 
          icon={AlertTriangle} 
          variant="danger" 
          className="stagger-6" 
        />
      </div>

      {/* Customer Count */}
      <div className="mb-8">
        <StatCard 
          title="Total Customers" 
          value={statsLoading ? '...' : stats?.totalCustomers || 0} 
          icon={Users} 
          variant="default" 
          className="max-w-xs" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-warning" />Pending Return Approvals</h2>
            <DataTable data={pendingReturns} columns={pendingReturnColumns} emptyMessage="No pending returns" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-danger" />Overdue Drums</h2>
            <DataTable data={overdueSales.slice(0, 5)} columns={overdueColumns} emptyMessage="No overdue drums" />
          </div>
        </div>
        <div className="space-y-6">
          <ProductBreakdown data={stats?.salesByProduct || {}} />
          <div className="rounded-xl border bg-card p-6 animate-slide-up opacity-0 stagger-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Top Salespeople</h3>
            <div className="space-y-3">
              {(salespeople || []).slice(0, 4).map((person, index) => (
                <div 
                  key={person.id} 
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/admin/salespeople/${person.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</div>
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <span className="text-muted-foreground">{person.totalSales} sales</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
