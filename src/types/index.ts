export type UserRole = 'admin' | 'salesperson';

export type DrumProductType = 'Love White' | 'Mango White' | 'King White' | 'SOS White';

export type SaleStatus = 'pending' | 'returned' | 'overdue';

export type ReturnStatus = 'pending' | 'approved';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  salespersonId: string;
  salespersonName: string;
  productType: DrumProductType;
  quantity: number;
  saleDate: Date;
  expectedReturnDate: Date;
  status: SaleStatus;
}

export interface DrumReturn {
  id: string;
  saleId: string;
  customerId: string;
  customerName: string;
  salespersonId: string;
  salespersonName: string;
  productType: DrumProductType;
  quantity: number;
  returnDate: Date;
  status: ReturnStatus;
}

export interface Salesperson {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSales: number;
  totalReturned: number;
  totalOverdue: number;
}

export interface DashboardStats {
  totalSalesThisMonth: number;
  totalSalesAllTime: number;
  totalReturned: number;
  totalPendingApproval: number;
  totalOverdue: number;
  salesByProduct: Record<DrumProductType, number>;
}
