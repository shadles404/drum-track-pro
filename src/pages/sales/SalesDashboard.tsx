import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useSales, useDashboardStats } from '@/hooks/useSupabaseData';
import { Package, RotateCcw, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function SalesDashboard() {
  const { profile } = useAuth();
  const { data: sales, isLoading: salesLoading } = useSales();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const recentSalesColumns = [
    { key: 'customer_name', header: 'Customer' },
    { 
      key: 'category', 
      header: 'Product',
      render: (item: any) => (item.drum_categories as any)?.name || 'Unknown',
    },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (item: any) => `$${Number(item.total_amount || 0).toLocaleString()}`,
    },
    {
      key: 'created_at',
      header: 'Sale Date',
      render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'due_date',
      header: 'Return Due',
      render: (item: any) => format(new Date(item.due_date), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => {
        const isOverdue = item.status === 'active' && isPast(new Date(item.due_date));
        const displayStatus = isOverdue ? 'overdue' : item.status === 'active' ? 'pending' : 'returned';
        return <Badge variant={displayStatus}>{displayStatus}</Badge>;
      },
    },
  ];

  return (
    <DashboardLayout
      title={`Welcome, ${profile?.name || 'Salesperson'}`}
      subtitle="Your sales performance overview"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Drums Sold"
          value={statsLoading ? '...' : stats?.totalSalesAllTime || 0}
          icon={Package}
          variant="primary"
          className="stagger-1"
        />
        <StatCard
          title="Total Revenue"
          value={statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          variant="success"
          className="stagger-2"
        />
        <StatCard
          title="Drums Returned"
          value={statsLoading ? '...' : stats?.totalReturned || 0}
          icon={RotateCcw}
          variant="default"
          className="stagger-3"
        />
        <StatCard
          title="Pending Returns"
          value={statsLoading ? '...' : stats?.totalPendingApproval || 0}
          icon={TrendingUp}
          variant="warning"
          className="stagger-4"
        />
        <StatCard
          title="Overdue"
          value={statsLoading ? '...' : stats?.totalOverdue || 0}
          icon={AlertTriangle}
          variant="danger"
          className="stagger-5"
        />
      </div>

      {/* Recent Sales */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
        <DataTable
          data={sales?.slice(0, 5) || []}
          columns={recentSalesColumns}
          emptyMessage={salesLoading ? "Loading..." : "No sales yet"}
        />
      </div>
    </DashboardLayout>
  );
}