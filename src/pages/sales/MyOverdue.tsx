import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useSales } from '@/hooks/useSupabaseData';
import { format, differenceInDays, isPast } from 'date-fns';
import { AlertTriangle, Package, Users } from 'lucide-react';

export default function MyOverdue() {
  const { data: sales, isLoading } = useSales();

  const overdueSales = sales?.filter(s => 
    s.status === 'active' && isPast(new Date(s.due_date))
  ) || [];
  
  const totalOverdueQty = overdueSales.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueCustomers = new Set(overdueSales.map((s) => s.customer_phone)).size;

  const columns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'customer_phone', header: 'Phone' },
    { 
      key: 'category', 
      header: 'Product',
      render: (item: any) => (item.drum_categories as any)?.name || 'Unknown',
    },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'created_at',
      header: 'Sale Date',
      render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'daysOverdue',
      header: 'Days Overdue',
      render: (item: any) => {
        const days = differenceInDays(new Date(), new Date(item.due_date));
        return <Badge variant="danger">{days} days</Badge>;
      },
    },
  ];

  return (
    <DashboardLayout title="My Overdue Drums" subtitle="Drums that need to be followed up for return">
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="Overdue Drums"
          value={totalOverdueQty}
          icon={Package}
          variant="danger"
          className="stagger-1"
        />
        <StatCard
          title="Affected Customers"
          value={uniqueCustomers}
          icon={Users}
          variant="warning"
          className="stagger-2"
        />
        <StatCard
          title="Overdue Transactions"
          value={overdueSales.length}
          icon={AlertTriangle}
          variant="danger"
          className="stagger-3"
        />
      </div>

      <DataTable
        data={overdueSales}
        columns={columns}
        emptyMessage={isLoading ? "Loading..." : "No overdue drums - Great job!"}
      />
    </DashboardLayout>
  );
}
