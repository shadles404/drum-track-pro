import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { useSales } from '@/hooks/useSupabaseData';
import { format, isPast } from 'date-fns';

export default function Customers() {
  const { data: sales, isLoading } = useSales();

  const customerMap = new Map<string, { name: string; phone: string; totalPurchased: number; hasOverdue: boolean; lastPurchase: string }>();
  sales?.forEach((sale) => {
    const existing = customerMap.get(sale.customer_phone) || { name: sale.customer_name, phone: sale.customer_phone, totalPurchased: 0, hasOverdue: false, lastPurchase: sale.created_at };
    existing.totalPurchased += sale.quantity;
    if (sale.status === 'active' && isPast(new Date(sale.due_date))) existing.hasOverdue = true;
    if (new Date(sale.created_at) > new Date(existing.lastPurchase)) existing.lastPurchase = sale.created_at;
    customerMap.set(sale.customer_phone, existing);
  });

  const customers = Array.from(customerMap.values()).map((c, i) => ({ id: i, ...c, lastPurchase: format(new Date(c.lastPurchase), 'MMM d, yyyy') }));

  const columns = [
    { key: 'name', header: 'Customer Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'totalPurchased', header: 'Total Drums Purchased' },
    { key: 'lastPurchase', header: 'Last Purchase' },
    { key: 'hasOverdue', header: 'Status', render: (item: any) => <span className={item.hasOverdue ? 'text-danger font-medium' : 'text-success'}>{item.hasOverdue ? 'Has Overdue' : 'Good Standing'}</span> },
  ];

  return (
    <DashboardLayout title="Customers" subtitle="View all customer accounts and their purchase history">
      <DataTable data={customers} columns={columns} emptyMessage={isLoading ? "Loading..." : "No customers found"} />
    </DashboardLayout>
  );
}
