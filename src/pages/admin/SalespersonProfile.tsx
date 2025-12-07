import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSalespersonProfile } from '@/hooks/useSupabaseData';
import { ArrowLeft, Package, RotateCcw, AlertTriangle, User, Mail } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';

export default function SalespersonProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useSalespersonProfile(id || '');

  if (isLoading) {
    return (
      <DashboardLayout title="Salesperson Profile" subtitle="Loading...">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!data?.profile) {
    return (
      <DashboardLayout title="Salesperson Profile" subtitle="Not found">
        <div className="text-muted-foreground">Salesperson not found</div>
      </DashboardLayout>
    );
  }

  const { profile, sales, returns, overdueSales, stats } = data;

  const salesColumns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'customer_phone', header: 'Phone' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Sale Date', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { key: 'due_date', header: 'Return Due', render: (item: any) => format(new Date(item.due_date), 'MMM d, yyyy') },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: any) => {
        const isOverdue = item.status === 'active' && isPast(new Date(item.due_date));
        if (item.status === 'returned') return <Badge variant="returned">Returned</Badge>;
        if (isOverdue) return <Badge variant="overdue">Overdue</Badge>;
        return <Badge variant="pending">Active</Badge>;
      } 
    },
  ];

  const returnColumns = [
    { key: 'customer', header: 'Customer', render: (item: any) => (item.sales as any)?.customer_name || 'Unknown' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Submitted', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: any) => (
        <Badge variant={item.status === 'approved' ? 'returned' : 'pending'}>
          {item.status === 'approved' ? 'Approved' : 'Pending'}
        </Badge>
      ) 
    },
  ];

  const overdueColumns = [
    { key: 'customer_name', header: 'Customer' },
    { key: 'customer_phone', header: 'Phone' },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { 
      key: 'daysOverdue', 
      header: 'Days Overdue', 
      render: (item: any) => (
        <Badge variant="danger">{differenceInDays(new Date(), new Date(item.due_date))} days</Badge>
      ) 
    },
  ];

  return (
    <DashboardLayout title="Salesperson Profile" subtitle="Complete sales and returns history">
      <div className="space-y-6">
        {/* Back Button & Profile Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/salespeople')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border bg-card p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Drums Sold" value={stats.totalSales} icon={Package} variant="primary" />
          <StatCard title="Total Returned" value={stats.totalReturned} icon={RotateCcw} variant="default" />
          <StatCard title="Total Overdue" value={stats.totalOverdue} icon={AlertTriangle} variant="danger" />
        </div>

        {/* All Sales */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            All Sales ({sales.length})
          </h3>
          <DataTable data={sales} columns={salesColumns} emptyMessage="No sales found" />
        </div>

        {/* Return Requests */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-success" />
            Return Requests ({returns.length})
          </h3>
          <DataTable data={returns} columns={returnColumns} emptyMessage="No return requests" />
        </div>

        {/* Overdue Drums */}
        {overdueSales.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              Overdue Drums ({overdueSales.length})
            </h3>
            <DataTable data={overdueSales} columns={overdueColumns} emptyMessage="No overdue drums" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
