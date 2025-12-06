import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockSales } from '@/data/mockData';
import { Sale } from '@/types';
import { format } from 'date-fns';

export default function MyCustomers() {
  // Filter for current salesperson (mock: salesperson 1)
  const mySales = mockSales.filter((s) => s.salespersonId === '1');

  const columns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'customerPhone', header: 'Phone' },
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
    <DashboardLayout title="My Customers" subtitle="View all customers you have sold to">
      <DataTable
        data={mySales}
        columns={columns}
        emptyMessage="No customers yet"
      />
    </DashboardLayout>
  );
}
