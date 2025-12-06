import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockSales } from '@/data/mockData';
import { Sale } from '@/types';
import { format } from 'date-fns';

export default function AllSales() {
  const columns = [
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
    { key: 'salespersonName', header: 'Salesperson' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Sale) => (
        <Badge variant={item.status}>{item.status}</Badge>
      ),
    },
  ];

  return (
    <DashboardLayout title="All Sales" subtitle="Complete sales history across all salespeople">
      <DataTable data={mockSales} columns={columns} />
    </DashboardLayout>
  );
}
