import Dexie, { Table } from 'dexie';
import { Customer, MonthlyAccount, Order, Product, User } from '../types';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';

class BarControllerDB extends Dexie {
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  monthlyAccounts!: Table<MonthlyAccount, string>;
  users!: Table<User, string>;

  constructor() {
    super('bar-controller-pro');
    this.version(2).stores({
      customers: 'id, name, phone, updatedAt',
      products: 'id, name, sku, updatedAt',
      orders: 'id, customerId, status, updatedAt',
      monthlyAccounts: 'id, customerId, updatedAt',
      users: 'id, cpf, role, updatedAt'
    });
  }
}

export const db = new BarControllerDB();

export async function seedIfEmpty() {
  const customersCount = await db.customers.count();
  const usersCount = await db.users.count();
  if (customersCount > 0 && usersCount > 0) return;

  const now = Date.now();
  const localUsersRaw = localStorage.getItem('users_seed');
  let users: User[] = [];
  if (localUsersRaw) {
    try {
      const parsed = JSON.parse(localUsersRaw) as User[];
      if (Array.isArray(parsed)) {
        users = parsed.map(u => ({
          ...u,
          createdAt: u.createdAt ?? now,
          updatedAt: now
        }));
      }
    } catch {
      users = [];
    }
  }

  const localCustomersRaw = localStorage.getItem('customers_seed');
  let customers: Customer[] = [];
  if (localCustomersRaw) {
    try {
      const parsed = JSON.parse(localCustomersRaw) as Customer[];
      if (Array.isArray(parsed)) {
        customers = parsed.map(c => ({
          ...c,
          createdAt: c.createdAt ?? now,
          updatedAt: now
        }));
      }
    } catch {
      customers = [];
    }
  }
  if (customers.length === 0) {
    customers = MOCK_CUSTOMERS.map(c => ({
      ...c,
      createdAt: c.createdAt ?? now,
      updatedAt: now
    }));
  }

  const products: Product[] = MOCK_PRODUCTS.map(p => ({
    ...p,
    createdAt: p.createdAt ?? now,
    updatedAt: now
  }));

  const orders: Order[] = MOCK_ORDERS.map(o => ({
    ...o,
    updatedAt: now
  }));

  const localMonthlyRaw = localStorage.getItem('monthly_accounts_seed');
  let monthlyAccounts: MonthlyAccount[] = [];
  if (localMonthlyRaw) {
    try {
      const parsed = JSON.parse(localMonthlyRaw) as MonthlyAccount[];
      if (Array.isArray(parsed)) {
        monthlyAccounts = parsed.map(a => ({
          ...a,
          cycleStart: new Date(a.cycleStart),
          items: (a.items || []).map(i => ({ ...i, createdAt: new Date(i.createdAt) })),
          payments: (a.payments || []).map(p => ({ ...p, createdAt: new Date(p.createdAt) })),
          createdAt: a.createdAt ?? now,
          updatedAt: now
        }));
      }
    } catch {
      monthlyAccounts = [];
    }
  }
  if (monthlyAccounts.length === 0) {
    monthlyAccounts = customers
      .filter(c => typeof c.monthlyLimit === 'number')
      .map(c => ({
        id: `m_${c.id}`,
        customerId: c.id,
        limit: c.monthlyLimit as number,
        cycleStart: new Date(),
        items: [],
        payments: [],
        overdueUnlocked: false,
        createdAt: now,
        updatedAt: now
      }));
  }

  await db.transaction('rw', db.customers, db.products, db.orders, db.monthlyAccounts, db.users, async () => {
    if (users.length > 0) {
      await db.users.bulkPut(users);
    }
    if (customers.length > 0) {
      await db.customers.bulkPut(customers);
    }
    await db.products.bulkPut(products);
    await db.orders.bulkPut(orders);
    await db.monthlyAccounts.bulkPut(monthlyAccounts);
  });
}

export async function loadAll() {
  const [customers, products, orders, monthlyAccounts, users] = await Promise.all([
    db.customers.toArray(),
    db.products.toArray(),
    db.orders.toArray(),
    db.monthlyAccounts.toArray(),
    db.users.toArray()
  ]);
  return { customers, products, orders, monthlyAccounts, users };
}
