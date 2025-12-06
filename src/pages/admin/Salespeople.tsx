import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockSalespeople } from '@/data/mockData';
import { Salesperson } from '@/types';

export default function Salespeople() {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'totalSales', header: 'Total Sales' },
    { key: 'totalReturned', header: 'Returned' },
    {
      key: 'totalOverdue',
      header: 'Overdue',
      render: (item: Salesperson) => (
        <Badge variant={item.totalOverdue > 0 ? 'overdue' : 'returned'}>
          {item.totalOverdue}
        </Badge>
      ),
    },
    {
      key: 'returnRate',
      header: 'Return Rate',
      render: (item: Salesperson) => {
        const rate = Math.round((item.totalReturned / item.totalSales) * 100);
        return (
          <span className={rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-danger'}>
            {rate}%
          </span>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Salespeople" subtitle="Manage and view all salesperson accounts">
      <DataTable data={mockSalespeople} columns={columns} />
    </DashboardLayout>
  );
}
