import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockSales } from '@/data/mockData';
import { Sale } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { AlertTriangle, Users, Package } from 'lucide-react';

export default function OverdueDrums() {
  const overdueSales = mockSales.filter((s) => s.status === 'overdue');
  
  const totalOverdueQty = overdueSales.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueCustomers = new Set(overdueSales.map((s) => s.customerId)).size;

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
      header: 'Due Date',
      render: (item: Sale) => format(item.expectedReturnDate, 'MMM d, yyyy'),
    },
    {
      key: 'daysOverdue',
      header: 'Days Overdue',
      render: (item: Sale) => {
        const days = differenceInDays(new Date(), item.expectedReturnDate);
        return (
          <Badge variant="danger">
            {days} days
          </Badge>
        );
      },
    },
    { key: 'salespersonName', header: 'Salesperson' },
  ];

  return (
    <DashboardLayout title="Overdue Drums" subtitle="Track drums that have exceeded the 30-day return period">
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="Total Overdue Drums"
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
        emptyMessage="No overdue drums - Great job!"
      />
    </DashboardLayout>
  );
}
