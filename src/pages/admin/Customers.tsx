import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { mockCustomers, mockSales } from '@/data/mockData';
import { format } from 'date-fns';

export default function Customers() {
  const customersWithStats = mockCustomers.map((customer) => {
    const customerSales = mockSales.filter((s) => s.customerId === customer.id);
    const totalPurchased = customerSales.reduce((sum, s) => sum + s.quantity, 0);
    const hasOverdue = customerSales.some((s) => s.status === 'overdue');
    
    return {
      ...customer,
      totalPurchased,
      hasOverdue,
      lastPurchase: customerSales.length > 0 
        ? format(Math.max(...customerSales.map(s => s.saleDate.getTime())), 'MMM d, yyyy')
        : 'N/A',
    };
  });

  const columns = [
    { key: 'name', header: 'Customer Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'totalPurchased', header: 'Total Drums Purchased' },
    { key: 'lastPurchase', header: 'Last Purchase' },
    {
      key: 'hasOverdue',
      header: 'Status',
      render: (item: typeof customersWithStats[0]) => (
        <span className={item.hasOverdue ? 'text-danger font-medium' : 'text-success'}>
          {item.hasOverdue ? 'Has Overdue' : 'Good Standing'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Customers" subtitle="View all customer accounts and their purchase history">
      <DataTable data={customersWithStats} columns={columns} />
    </DashboardLayout>
  );
}
