import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSales, useProfiles } from '@/hooks/useSupabaseData';
import { format, isPast } from 'date-fns';

export default function AllSales() {
  const { data: sales, isLoading } = useSales();
  const { data: profiles } = useProfiles();

  const salesWithNames = sales?.map(sale => ({
    ...sale,
    salespersonName: profiles?.find(p => p.user_id === sale.salesperson_id)?.name || 'Unknown'
  })) || [];

  const columns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Sale Date', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { key: 'due_date', header: 'Return Due', render: (item: any) => format(new Date(item.due_date), 'MMM d, yyyy') },
    { key: 'salespersonName', header: 'Salesperson' },
    { key: 'status', header: 'Status', render: (item: any) => { const isOverdue = item.status === 'active' && isPast(new Date(item.due_date)); const displayStatus = isOverdue ? 'overdue' : item.status === 'active' ? 'pending' : 'returned'; return <Badge variant={displayStatus}>{displayStatus}</Badge>; } },
  ];

  return (
    <DashboardLayout title="All Sales" subtitle="Complete sales history across all salespeople">
      <DataTable data={salesWithNames} columns={columns} emptyMessage={isLoading ? "Loading..." : "No sales found"} />
    </DashboardLayout>
  );
}
