import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReturnRequests, useApproveReturnRequest, useProfiles } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReturnsApproval() {
  const { data: returns, isLoading } = useReturnRequests();
  const { data: profiles } = useProfiles();
  const approveReturn = useApproveReturnRequest();
  const { toast } = useToast();

  const handleApprove = async (id: string) => {
    try {
      await approveReturn.mutateAsync(id);
      toast({ title: 'Return Approved', description: 'The drum return has been approved successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const pendingReturns = returns?.filter((r) => r.status === 'pending').map(r => ({ ...r, salespersonName: profiles?.find(p => p.user_id === r.salesperson_id)?.name || 'Unknown' })) || [];
  const approvedReturns = returns?.filter((r) => r.status === 'approved').map(r => ({ ...r, salespersonName: profiles?.find(p => p.user_id === r.salesperson_id)?.name || 'Unknown' })) || [];

  const pendingColumns = [
    { key: 'customer', header: 'Customer', render: (item: any) => (item.sales as any)?.customer_name || item.customer_phone },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Submitted', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { key: 'salespersonName', header: 'Salesperson' },
    { key: 'actions', header: 'Actions', render: (item: any) => <Button size="sm" variant="success" onClick={() => handleApprove(item.id)} disabled={approveReturn.isPending}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button> },
  ];

  const approvedColumns = [
    { key: 'customer', header: 'Customer', render: (item: any) => (item.sales as any)?.customer_name || item.customer_phone },
    { key: 'product', header: 'Product', render: (item: any) => (item.drum_categories as any)?.name },
    { key: 'quantity', header: 'Qty' },
    { key: 'created_at', header: 'Return Date', render: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy') },
    { key: 'salespersonName', header: 'Salesperson' },
    { key: 'status', header: 'Status', render: () => <Badge variant="returned">Approved</Badge> },
  ];

  return (
    <DashboardLayout title="Returns Approval" subtitle="Review and approve empty drum returns">
      <div className="space-y-8">
        <div><h2 className="text-lg font-semibold mb-4">Pending Approval ({pendingReturns.length})</h2><DataTable data={pendingReturns} columns={pendingColumns} emptyMessage={isLoading ? "Loading..." : "No pending returns"} /></div>
        <div><h2 className="text-lg font-semibold mb-4">Recently Approved</h2><DataTable data={approvedReturns} columns={approvedColumns} emptyMessage="No approved returns yet" /></div>
      </div>
    </DashboardLayout>
  );
}
