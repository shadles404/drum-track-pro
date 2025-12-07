import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Fetch drum categories
export function useDrumCategories() {
  return useQuery({
    queryKey: ['drum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch shops
export function useShops() {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch sales (all for admin, own for salesperson)
export function useSales() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['sales', user?.id, role],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          drum_categories(name),
          shops(name)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch return requests
export function useReturnRequests() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['return-requests', user?.id, role],
    queryFn: async () => {
      let query = supabase
        .from('return_requests')
        .select(`
          *,
          drum_categories(name),
          shops(name),
          sales(customer_name, customer_phone)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch salespeople with stats (admin only)
export function useSalespeopleWithStats() {
  return useQuery({
    queryKey: ['salespeople-stats'],
    queryFn: async () => {
      // Get all salesperson user_roles
      const { data: salespersonRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'salesperson');

      if (rolesError) throw rolesError;

      // Get profiles for these users
      const userIds = salespersonRoles?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get sales stats for each salesperson
      const result = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: sales } = await supabase
            .from('sales')
            .select('quantity, status, due_date')
            .eq('salesperson_id', profile.user_id);

          const { data: returns } = await supabase
            .from('return_requests')
            .select('quantity, status')
            .eq('salesperson_id', profile.user_id)
            .eq('status', 'approved');

          const totalSales = sales?.reduce((sum, s) => sum + s.quantity, 0) || 0;
          const totalReturned = returns?.reduce((sum, r) => sum + r.quantity, 0) || 0;
          const now = new Date();
          const totalOverdue = sales?.filter(s => 
            s.status === 'active' && new Date(s.due_date) < now
          ).length || 0;

          return {
            id: profile.user_id,
            name: profile.name,
            email: profile.email,
            totalSales,
            totalReturned,
            totalOverdue,
          };
        })
      );

      return result;
    },
  });
}

// Fetch profiles
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}

// Create a sale
export function useCreateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (saleData: {
      customer_name: string;
      customer_phone: string;
      customer_address?: string;
      shop_id: string;
      items: { category_id: string; quantity: number }[];
    }) => {
      const results = [];
      
      for (const item of saleData.items) {
        const { data, error } = await supabase
          .from('sales')
          .insert({
            customer_name: saleData.customer_name,
            customer_phone: saleData.customer_phone,
            customer_address: saleData.customer_address,
            shop_id: saleData.shop_id,
            salesperson_id: user!.id,
            category_id: item.category_id,
            quantity: item.quantity,
          })
          .select()
          .single();

        if (error) throw error;
        results.push(data);
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

// Create a return request
export function useCreateReturnRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (returnData: {
      sale_id: string;
      shop_id: string;
      category_id: string;
      customer_phone: string;
      quantity: number;
    }) => {
      const { data, error } = await supabase
        .from('return_requests')
        .insert({
          ...returnData,
          salesperson_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

// Approve a return request (admin only)
export function useApproveReturnRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (returnId: string) => {
      const { data, error } = await supabase
        .from('return_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user!.id,
        })
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
  });
}

// Get dashboard stats
export function useDashboardStats() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id, role],
    queryFn: async () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get sales
      let salesQuery = supabase
        .from('sales')
        .select('quantity, status, due_date, created_at, category_id, drum_categories(name), customer_phone');

      if (role === 'salesperson') {
        salesQuery = salesQuery.eq('salesperson_id', user!.id);
      }

      const { data: sales } = await salesQuery;

      // Get return requests
      let returnsQuery = supabase
        .from('return_requests')
        .select('quantity, status');

      if (role === 'salesperson') {
        returnsQuery = returnsQuery.eq('salesperson_id', user!.id);
      }

      const { data: returns } = await returnsQuery;

      const totalSalesToday = sales
        ?.filter(s => new Date(s.created_at) >= startOfToday)
        .reduce((sum, s) => sum + s.quantity, 0) || 0;

      const totalSalesThisMonth = sales
        ?.filter(s => new Date(s.created_at) >= startOfMonth)
        .reduce((sum, s) => sum + s.quantity, 0) || 0;

      const totalSalesAllTime = sales?.reduce((sum, s) => sum + s.quantity, 0) || 0;

      const totalReturned = returns
        ?.filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.quantity, 0) || 0;

      const totalPendingApproval = returns
        ?.filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.quantity, 0) || 0;

      const totalOverdue = sales?.filter(s => 
        s.status === 'active' && new Date(s.due_date) < now
      ).length || 0;

      // Unique customers count
      const uniqueCustomers = new Set(sales?.map(s => s.customer_phone) || []).size;

      // Sales by product
      const salesByProduct: Record<string, number> = {};
      sales?.forEach(s => {
        const categoryName = (s.drum_categories as any)?.name || 'Unknown';
        salesByProduct[categoryName] = (salesByProduct[categoryName] || 0) + s.quantity;
      });

      return {
        totalSalesToday,
        totalSalesThisMonth,
        totalSalesAllTime,
        totalReturned,
        totalPendingApproval,
        totalOverdue,
        totalCustomers: uniqueCustomers,
        salesByProduct,
      };
    },
    enabled: !!user,
  });
}

// Get single salesperson profile with full details
export function useSalespersonProfile(salespersonId: string) {
  return useQuery({
    queryKey: ['salesperson-profile', salespersonId],
    queryFn: async () => {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', salespersonId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Get all sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, drum_categories(name), shops(name)')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Get all return requests
      const { data: returns, error: returnsError } = await supabase
        .from('return_requests')
        .select('*, drum_categories(name), sales(customer_name, customer_phone)')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      const now = new Date();
      const totalSales = sales?.reduce((sum, s) => sum + s.quantity, 0) || 0;
      const totalReturned = returns?.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.quantity, 0) || 0;
      const overdueSales = sales?.filter(s => s.status === 'active' && new Date(s.due_date) < now) || [];

      return {
        profile,
        sales: sales || [],
        returns: returns || [],
        overdueSales,
        stats: {
          totalSales,
          totalReturned,
          totalOverdue: overdueSales.length,
        },
      };
    },
    enabled: !!salespersonId,
  });
}
