
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  subgroup?: string;
  image: string;
  status: 'active' | 'inactive' | 'fractioned';
  createdAt?: number;
  updatedAt?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isFavorite?: boolean;
  birthday?: string;
  cpf?: string;
  monthlyLimit?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface Order {
  id: string;
  customerId: string;
  table?: string;
  location: 'Mesa' | 'Balcão';
  items: OrderItem[];
  payments: Payment[];
  status: 'open' | 'payment' | 'closed';
  createdAt: Date;
  updatedAt?: number;
}

export interface Payment {
  id: string;
  method: 'PIX' | 'Dinheiro' | 'Cartão';
  amount: number;
  createdAt: Date;
  note?: string;
}

export interface MonthlyItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtSale: number;
  createdAt: Date;
}

export interface MonthlyPayment {
  id: string;
  amount: number;
  method: 'PIX' | 'Dinheiro' | 'Cartão';
  createdAt: Date;
  note?: string;
  unlockApplied?: boolean;
}

export interface MonthlyAccount {
  id: string;
  customerId: string;
  limit: number;
  cycleStart: Date;
  items: MonthlyItem[];
  payments: MonthlyPayment[];
  overdueUnlocked?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type UserRole = 'admin' | 'seller';

export interface User {
  id: string;
  name: string;
  cpf: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: number;
  updatedAt?: number;
}

export type AppState =
  | 'lock'
  | 'home'
  | 'inventory'
  | 'reports'
  | 'sale'
  | 'customer_detail'
  | 'customers'
  | 'customer_create'
  | 'monthly_accounts'
  | 'monthly_detail'
  | 'users';
