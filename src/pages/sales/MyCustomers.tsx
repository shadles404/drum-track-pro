import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSales } from '@/hooks/useSupabaseData';
import { format, isPast } from 'date-fns';

export default function MyCustomers() {
  const { data: sales, isLoading } = useSales();

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
    <DashboardLayout title="My Customers" subtitle="View all customers you have sold to">
      <DataTable
        data={sales || []}
        columns={columns}
        emptyMessage={isLoading ? "Loading..." : "No customers yet"}
      />
    </DashboardLayout>
  );
}
