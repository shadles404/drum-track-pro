import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { ProductBreakdown } from '@/components/dashboard/ProductBreakdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDashboardStats, mockSalespeople, mockReturns, mockSales } from '@/data/mockData';
import { DrumReturn, Sale } from '@/types';
import {
  Package,
  RotateCcw,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const pendingReturns = mockReturns.filter((r) => r.status === 'pending');
  const overdueSales = mockSales.filter((s) => s.status === 'overdue');

  const salespersonColumns = [
    { key: 'name', header: 'Name' },
    { key: 'totalSales', header: 'Total Sales' },
    { key: 'totalReturned', header: 'Returned' },
    {
      key: 'totalOverdue',
      header: 'Overdue',
      render: (item: typeof mockSalespeople[0]) => (
        <Badge variant={item.totalOverdue > 0 ? 'overdue' : 'returned'}>
          {item.totalOverdue}
        </Badge>
      ),
    },
  ];

  const pendingReturnColumns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'productType', header: 'Product' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'returnDate',
      header: 'Submitted',
      render: (item: DrumReturn) => format(item.returnDate, 'MMM d, yyyy'),
    },
    { key: 'salespersonName', header: 'Salesperson' },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Button size="sm" variant="success">
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
      ),
    },
  ];

  const overdueColumns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'productType', header: 'Product' },
    { key: 'quantity', header: 'Qty' },
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
    { key: 'customerPhone', header: 'Phone' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Overview of all drum sales and returns">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Sales This Month"
          value={stats.totalSalesThisMonth}
          icon={Package}
          variant="primary"
          trend={{ value: 12, label: 'vs last month' }}
          className="stagger-1"
        />
        <StatCard
          title="All-Time Sales"
          value={stats.totalSalesAllTime}
          icon={TrendingUp}
          variant="default"
          className="stagger-2"
        />
        <StatCard
          title="Pending Approval"
          value={stats.totalPendingApproval}
          icon={Clock}
          variant="warning"
          className="stagger-3"
        />
        <StatCard
          title="Overdue Drums"
          value={stats.totalOverdue}
          icon={AlertTriangle}
          variant="danger"
          className="stagger-4"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Return Approvals
            </h2>
            <DataTable
              data={pendingReturns}
              columns={pendingReturnColumns}
              emptyMessage="No pending returns"
            />
          </div>

          {/* Overdue Drums */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              Overdue Drums
            </h2>
            <DataTable
              data={overdueSales}
              columns={overdueColumns}
              emptyMessage="No overdue drums"
            />
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <ProductBreakdown data={stats.salesByProduct} />

          {/* Salespeople Summary */}
          <div className="rounded-xl border bg-card p-6 animate-slide-up opacity-0 stagger-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Top Salespeople
            </h3>
            <div className="space-y-3">
              {mockSalespeople.slice(0, 4).map((person, index) => (
                <div key={person.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <span className="text-muted-foreground">{person.totalSales} sales</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
