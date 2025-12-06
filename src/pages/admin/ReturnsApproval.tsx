import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockReturns } from '@/data/mockData';
import { DrumReturn } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReturnsApproval() {
  const [returns, setReturns] = useState(mockReturns);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
    toast({
      title: 'Return Approved',
      description: 'The drum return has been approved successfully.',
    });
  };

  const pendingReturns = returns.filter((r) => r.status === 'pending');
  const approvedReturns = returns.filter((r) => r.status === 'approved');

  const pendingColumns = [
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
      header: 'Actions',
      render: (item: DrumReturn) => (
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => handleApprove(item.id)}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </div>
      ),
    },
  ];

  const approvedColumns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'productType', header: 'Product' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'returnDate',
      header: 'Return Date',
      render: (item: DrumReturn) => format(item.returnDate, 'MMM d, yyyy'),
    },
    { key: 'salespersonName', header: 'Salesperson' },
    {
      key: 'status',
      header: 'Status',
      render: () => <Badge variant="returned">Approved</Badge>,
    },
  ];

  return (
    <DashboardLayout title="Returns Approval" subtitle="Review and approve empty drum returns">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Approval ({pendingReturns.length})</h2>
          <DataTable
            data={pendingReturns}
            columns={pendingColumns}
            emptyMessage="No pending returns to approve"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recently Approved</h2>
          <DataTable
            data={approvedReturns}
            columns={approvedColumns}
            emptyMessage="No approved returns yet"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
