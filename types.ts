
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  subgroup?: string;
  image: string;
  status: 'active' | 'inactive' | 'fractioned';
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  avatar: string;
  isFavorite?: boolean;
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
}

export interface Payment {
  id: string;
  method: 'PIX' | 'Dinheiro' | 'Cartão';
  amount: number;
  createdAt: Date;
  note?: string;
}

export type AppState = 'lock' | 'home' | 'inventory' | 'reports' | 'sale' | 'customer_detail';
