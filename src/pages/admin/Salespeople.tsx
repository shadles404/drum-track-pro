import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSalespeopleWithStats } from '@/hooks/useSupabaseData';

export default function Salespeople() {
  const { data: salespeople, isLoading } = useSalespeopleWithStats();

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'totalSales', header: 'Total Sales' },
    { key: 'totalReturned', header: 'Returned' },
    { key: 'totalOverdue', header: 'Overdue', render: (item: any) => <Badge variant={item.totalOverdue > 0 ? 'overdue' : 'returned'}>{item.totalOverdue}</Badge> },
    { key: 'returnRate', header: 'Return Rate', render: (item: any) => { const rate = item.totalSales > 0 ? Math.round((item.totalReturned / item.totalSales) * 100) : 0; return <span className={rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-danger'}>{rate}%</span>; } },
  ];

  return (
    <DashboardLayout title="Salespeople" subtitle="Manage and view all salesperson accounts">
      <DataTable data={salespeople || []} columns={columns} emptyMessage={isLoading ? "Loading..." : "No salespeople found"} />
    </DashboardLayout>
  );
}
