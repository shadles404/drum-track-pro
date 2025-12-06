import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { mockSales, mockReturns } from '@/data/mockData';
import { Sale } from '@/types';
import { Package, RotateCcw, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesDashboard() {
  const { user } = useAuth();
  
  // Filter data for current salesperson
  const mySales = mockSales.filter((s) => s.salespersonId === '1'); // Mock: use first salesperson
  const myReturns = mockReturns.filter((r) => r.salespersonId === '1');
  
  const totalSold = mySales.reduce((sum, s) => sum + s.quantity, 0);
  const totalReturned = myReturns.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.quantity, 0);
  const totalOverdue = mySales.filter((s) => s.status === 'overdue').length;
  const pendingReturns = myReturns.filter((r) => r.status === 'pending').length;

  const recentSalesColumns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'productType', header: 'Product' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'saleDate',
      header: 'Sale Date',
      render: (item: Sale) => format(item.saleDate, 'MMM d, yyyy'),
    },
    {
      key: 'expectedReturnDate',
      header: 'Return Due',
      render: (item: Sale) => format(item.expectedReturnDate, 'MMM d, yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Sale) => <Badge variant={item.status}>{item.status}</Badge>,
    },
  ];

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name || 'Salesperson'}`}
      subtitle="Your sales performance overview"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Drums Sold"
          value={totalSold}
          icon={Package}
          variant="primary"
          trend={{ value: 8, label: 'this month' }}
          className="stagger-1"
        />
        <StatCard
          title="Drums Returned"
          value={totalReturned}
          icon={RotateCcw}
          variant="success"
          className="stagger-2"
        />
        <StatCard
          title="Pending Returns"
          value={pendingReturns}
          icon={TrendingUp}
          variant="warning"
          className="stagger-3"
        />
        <StatCard
          title="Overdue"
          value={totalOverdue}
          icon={AlertTriangle}
          variant="danger"
          className="stagger-4"
        />
      </div>

      {/* Recent Sales */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
        <DataTable
          data={mySales.slice(0, 5)}
          columns={recentSalesColumns}
          emptyMessage="No sales yet"
        />
      </div>
    </DashboardLayout>
  );
}
