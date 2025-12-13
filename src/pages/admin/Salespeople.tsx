import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSalespeopleWithStats } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Eye } from 'lucide-react';

export default function Salespeople() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: salespeople, isLoading } = useSalespeopleWithStats();

  // Real-time subscription for sales, return_requests, and profiles
  useEffect(() => {
    const channel = supabase
      .channel('salespeople-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        queryClient.invalidateQueries({ queryKey: ['salespeople-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['salespeople-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['salespeople-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const formatCurrency = (amount: number) => `$${amount?.toLocaleString() || 0}`;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'totalSales', header: 'Total Sales' },
    { key: 'totalReturned', header: 'Returned' },
    { 
      key: 'totalRevenue', 
      header: 'Revenue', 
      render: (item: any) => formatCurrency(item.totalRevenue || 0)
    },
    { 
      key: 'totalOverdue', 
      header: 'Overdue', 
      render: (item: any) => (
        <Badge variant={item.totalOverdue > 0 ? 'overdue' : 'returned'}>
          {item.totalOverdue}
        </Badge>
      ) 
    },
    { 
      key: 'returnRate', 
      header: 'Return Rate', 
      render: (item: any) => { 
        const rate = item.totalSales > 0 ? Math.round((item.totalReturned / item.totalSales) * 100) : 0; 
        return (
          <span className={rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-danger'}>
            {rate}%
          </span>
        ); 
      } 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/admin/salespeople/${item.id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View Profile
        </Button>
      )
    },
  ];

  return (
    <DashboardLayout title="Salespeople" subtitle="Manage and view all salesperson accounts">
      <DataTable 
        data={salespeople || []} 
        columns={columns} 
        emptyMessage={isLoading ? "Loading..." : "No salespeople found"} 
      />
    </DashboardLayout>
  );
}
