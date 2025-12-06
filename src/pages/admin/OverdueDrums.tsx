import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useSales, useProfiles } from '@/hooks/useSupabaseData';
import { format, differenceInDays, isPast } from 'date-fns';
import { AlertTriangle, Users, Package } from 'lucide-react';

export default function OverdueDrums() {
  const { data: sales, isLoading } = useSales();
  const { data: profiles } = useProfiles();

  const overdueSales = sales?.filter((s) => s.status === 'active' && isPast(new Date(s.due_date))).map(s => ({ ...s, salespersonName: profiles?.find(p => p.user_id === s.salesperson_id)?.name || 'Unknown' })) || [];
  const totalOverdueQty = overdueSales.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueCustomers = new Set(overdueSales.map((s) => s.customer_phone)).size;

  const columns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'customer_phone', header: 'Phone' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Sale Date', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { key: 'due_date', header: 'Due Date', render: (item: any) => format(new Date(item.due_date), 'MMM d, yyyy') },
    { key: 'daysOverdue', header: 'Days Overdue', render: (item: any) => <Badge variant="danger">{differenceInDays(new Date(), new Date(item.due_date))} days</Badge> },
    { key: 'salespersonName', header: 'Salesperson' },
  ];

  return (
    <DashboardLayout title="Overdue Drums" subtitle="Track drums that have exceeded the 30-day return period">
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard title="Total Overdue Drums" value={totalOverdueQty} icon={Package} variant="danger" className="stagger-1" />
        <StatCard title="Affected Customers" value={uniqueCustomers} icon={Users} variant="warning" className="stagger-2" />
        <StatCard title="Overdue Transactions" value={overdueSales.length} icon={AlertTriangle} variant="danger" className="stagger-3" />
      </div>
      <DataTable data={overdueSales} columns={columns} emptyMessage={isLoading ? "Loading..." : "No overdue drums - Great job!"} />
    </DashboardLayout>
  );
}
