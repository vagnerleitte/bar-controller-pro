import Dexie, { Table } from 'dexie';
import { Customer, InventoryAdjustment, MonthlyAccount, Order, Product, User } from '../types';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';

export const DEFAULT_TENANT_ID = 't1';

class BarControllerDB extends Dexie {
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  monthlyAccounts!: Table<MonthlyAccount, string>;
  users!: Table<User, string>;
  inventoryAdjustments!: Table<InventoryAdjustment, string>;

  constructor() {
    super('bar-controller-pro');
    this.version(4).stores({
      customers: 'id, tenantId, name, phone, updatedAt',
      products: 'id, tenantId, name, sku, updatedAt',
      orders: 'id, tenantId, customerId, status, updatedAt',
      monthlyAccounts: 'id, tenantId, customerId, updatedAt',
      users: 'id, tenantId, cpf, role, updatedAt',
      inventoryAdjustments: 'id, tenantId, productId, reason, createdAt'
    }).upgrade(async tx => {
      await tx.table('customers').toCollection().modify((item: Customer) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
      await tx.table('products').toCollection().modify((item: Product) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
      await tx.table('orders').toCollection().modify((item: Order) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
      await tx.table('monthlyAccounts').toCollection().modify((item: MonthlyAccount) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
      await tx.table('users').toCollection().modify((item: User) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
      await tx.table('inventoryAdjustments').toCollection().modify((item: InventoryAdjustment) => {
        item.tenantId = item.tenantId || DEFAULT_TENANT_ID;
      });
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
          tenantId: u.tenantId || DEFAULT_TENANT_ID,
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
          tenantId: c.tenantId || DEFAULT_TENANT_ID,
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
      tenantId: DEFAULT_TENANT_ID,
      createdAt: c.createdAt ?? now,
      updatedAt: now
    }));
  }

  const products: Product[] = MOCK_PRODUCTS.map(p => ({
    ...p,
    tenantId: DEFAULT_TENANT_ID,
    createdAt: p.createdAt ?? now,
    updatedAt: now
  }));

  const orders: Order[] = MOCK_ORDERS.map(o => ({
    ...o,
    tenantId: o.tenantId || DEFAULT_TENANT_ID,
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
          tenantId: a.tenantId || DEFAULT_TENANT_ID,
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
        tenantId: c.tenantId || DEFAULT_TENANT_ID,
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

export async function forceSyncSeedData(tenantId: string) {
  const now = Date.now();
  const customers: Customer[] = MOCK_CUSTOMERS.map(c => ({
    ...c,
    tenantId,
    createdAt: c.createdAt ?? now,
    updatedAt: now
  }));
  const products: Product[] = MOCK_PRODUCTS.map(p => ({
    ...p,
    tenantId,
    createdAt: p.createdAt ?? now,
    updatedAt: now
  }));
  const orders: Order[] = MOCK_ORDERS.map(o => ({
    ...o,
    tenantId,
    updatedAt: now
  }));
  const monthlyAccounts: MonthlyAccount[] = customers
    .filter(c => typeof c.monthlyLimit === 'number')
    .map(c => ({
      id: `m_${c.id}`,
      tenantId,
      customerId: c.id,
      limit: c.monthlyLimit as number,
      cycleStart: new Date(),
      items: [],
      payments: [],
      overdueUnlocked: false,
      createdAt: now,
      updatedAt: now
    }));

  await db.transaction('rw', db.customers, db.products, db.orders, db.monthlyAccounts, async () => {
    await db.customers.where('tenantId').equals(tenantId).delete();
    await db.products.where('tenantId').equals(tenantId).delete();
    await db.orders.where('tenantId').equals(tenantId).delete();
    await db.monthlyAccounts.where('tenantId').equals(tenantId).delete();
    await db.customers.bulkPut(customers);
    await db.products.bulkPut(products);
    await db.orders.bulkPut(orders);
    await db.monthlyAccounts.bulkPut(monthlyAccounts);
  });
}
