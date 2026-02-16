
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Order, Customer, MonthlyAccount, MonthlyItem, MonthlyPayment, Product, User, Payment } from './types';
import { MOCK_PRODUCTS } from './constants';
import LockScreen from './pages/LockScreen';
import Home from './pages/Home';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Sale from './pages/Sale';
import CustomerDetail from './pages/CustomerDetail';
import Customers from './pages/Customers';
import CustomerCreate from './pages/CustomerCreate';
import MonthlyAccounts from './pages/MonthlyAccounts';
import MonthlyDetail from './pages/MonthlyDetail';
import Users from './pages/Users';
import { getMonthlyBalance, getMonthlyAvailableLimit, isMonthlyBlocked } from './utils/monthly';
import { db, forceSyncSeedData, loadAll, seedIfEmpty } from './services/db';
import { ensureDefaultAdmin } from './services/auth';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('lock');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [monthlyAccounts, setMonthlyAccounts] = useState<MonthlyAccount[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const prevCustomersRef = useRef<Customer[]>([]);
  const prevProductsRef = useRef<Product[]>([]);
  const prevOrdersRef = useRef<Order[]>([]);
  const prevMonthlyRef = useRef<MonthlyAccount[]>([]);
  const prevUsersRef = useRef<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await seedIfEmpty();
      await ensureDefaultAdmin();
      const { customers, products, orders, monthlyAccounts, users } = await loadAll();
      if (cancelled) return;
      const parsedMonthly = monthlyAccounts.map(a => ({
        ...a,
        cycleStart: new Date(a.cycleStart),
        items: (a.items || []).map(i => ({ ...i, createdAt: new Date(i.createdAt) })),
        payments: (a.payments || []).map(p => ({ ...p, createdAt: new Date(p.createdAt) }))
      }));
      setCustomers(customers);
      setProducts(products.length > 0 ? products : MOCK_PRODUCTS);
      setActiveOrders(orders);
      setUsers(users);
      setMonthlyAccounts(parsedMonthly);
      prevCustomersRef.current = customers;
      prevProductsRef.current = products.length > 0 ? products : MOCK_PRODUCTS;
      prevOrdersRef.current = orders;
      prevUsersRef.current = users;
      prevMonthlyRef.current = parsedMonthly;
      setDbReady(true);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dbReady) return;
    const userId = localStorage.getItem('auth_user_id');
    if (!userId) {
      setCurrentPage('lock');
      return;
    }
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('home');
      return;
    }
    localStorage.removeItem('auth_user_id');
    setCurrentUser(null);
    setCurrentPage('lock');
  }, [dbReady, users]);

  useEffect(() => {
    if (!dbReady) return;
    const prev = prevCustomersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = customers.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !customers.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.customers.bulkPut(changed);
    if (removed.length > 0) db.customers.bulkDelete(removed);
    prevCustomersRef.current = customers;
  }, [customers, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const prev = prevProductsRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = products.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !products.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.products.bulkPut(changed);
    if (removed.length > 0) db.products.bulkDelete(removed);
    prevProductsRef.current = products;
  }, [products, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const prev = prevOrdersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = activeOrders.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !activeOrders.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.orders.bulkPut(changed);
    if (removed.length > 0) db.orders.bulkDelete(removed);
    prevOrdersRef.current = activeOrders;
  }, [activeOrders, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const prev = prevMonthlyRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = monthlyAccounts.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !monthlyAccounts.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.monthlyAccounts.bulkPut(changed);
    if (removed.length > 0) db.monthlyAccounts.bulkDelete(removed);
    prevMonthlyRef.current = monthlyAccounts;
  }, [monthlyAccounts, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const prev = prevUsersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = users.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !users.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.users.bulkPut(changed);
    if (removed.length > 0) db.users.bulkDelete(removed);
    prevUsersRef.current = users;
  }, [users, dbReady]);

  const navigate = (page: AppState, customerId: string | null = null) => {
    if (customerId) setSelectedCustomerId(customerId);
    if (page === 'lock') {
      localStorage.removeItem('auth_user_id');
      setCurrentUser(null);
    }
    if (page === 'users' && currentUser?.role !== 'admin') {
      return;
    }
    if (page === 'reports' && currentUser?.role !== 'admin') {
      return;
    }
    setCurrentPage(page);
  };

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('auth_user_id', user.id);
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleForceSeedSync = async () => {
    await forceSyncSeedData();
    const { customers, products, orders, monthlyAccounts, users } = await loadAll();
    const parsedMonthly = monthlyAccounts.map(a => ({
      ...a,
      cycleStart: new Date(a.cycleStart),
      items: (a.items || []).map(i => ({ ...i, createdAt: new Date(i.createdAt) })),
      payments: (a.payments || []).map(p => ({ ...p, createdAt: new Date(p.createdAt) }))
    }));
    setCustomers(customers);
    setProducts(products.length > 0 ? products : MOCK_PRODUCTS);
    setActiveOrders(orders);
    setUsers(users);
    setMonthlyAccounts(parsedMonthly);
    prevCustomersRef.current = customers;
    prevProductsRef.current = products.length > 0 ? products : MOCK_PRODUCTS;
    prevOrdersRef.current = orders;
    prevUsersRef.current = users;
    prevMonthlyRef.current = parsedMonthly;
  };

  const renderPage = () => {
    if (!dbReady) {
      return (
        <div className="h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm">Carregando dados...</p>
        </div>
      );
    }
    switch (currentPage) {
      case 'lock':
        return <LockScreen onAuthSuccess={handleAuthSuccess} />;
      case 'home':
        return (
          <Home 
            navigate={navigate} 
            orders={activeOrders} 
            customers={customers}
            products={products}
            monthlyAccounts={monthlyAccounts}
            onForceSeedSync={handleForceSeedSync}
            onSelectTopProduct={(productId) => {
              setSelectedProductId(productId);
              navigate('sale');
            }}
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
            currentUser={currentUser}
          />
        );
      case 'sales':
        return (
          <Sales
            navigate={navigate}
            orders={activeOrders}
            customers={customers}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
            currentUserRole={currentUser?.role}
          />
        );
      case 'monthly_accounts':
        return (
          <MonthlyAccounts
            navigate={navigate}
            customers={customers}
            accounts={monthlyAccounts}
            currentUserRole={currentUser?.role}
          />
        );
      case 'monthly_detail': {
        const account = monthlyAccounts.find(a => a.customerId === selectedCustomerId);
        const customer = customers.find(c => c.id === selectedCustomerId);
        return (
          <MonthlyDetail
            navigate={navigate}
            account={account}
            customer={customer}
            products={products}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
            onAddItem={(productId, quantity) => {
              setMonthlyAccounts(prev => prev.map(a => {
                if (a.customerId !== selectedCustomerId) return a;
                const product = products.find(p => p.id === productId);
                if (!product) return a;
                const newItem: MonthlyItem = {
                  id: `mi_${Date.now()}`,
                  productId,
                  quantity,
                  priceAtSale: product.price,
                  createdAt: new Date()
                };
                return { ...a, items: [...a.items, newItem], updatedAt: Date.now() };
              }));
            }}
            onPayment={(amount, method) => {
              if (!account) return;
              const prevBalance = getMonthlyBalance(account);
              const isBlocked = isMonthlyBlocked(account);
              const unlockApplied = isBlocked && amount >= prevBalance * 0.5;
              setMonthlyAccounts(prev => prev.map(a => {
                if (a.customerId !== selectedCustomerId) return a;
                const newPayment: MonthlyPayment = {
                  id: `mp_${Date.now()}`,
                  amount,
                  method,
                  createdAt: new Date(),
                  unlockApplied
                };
                const updated = {
                  ...a,
                  payments: [...a.payments, newPayment],
                  overdueUnlocked: a.overdueUnlocked || unlockApplied,
                  updatedAt: Date.now()
                };
                const newBalance = getMonthlyBalance(updated);
                if (newBalance <= 0) {
                  return { ...updated, cycleStart: new Date(), overdueUnlocked: false, updatedAt: Date.now() };
                }
                return updated;
              }));
            }}
            getBalance={getMonthlyBalance}
            getAvailableLimit={getMonthlyAvailableLimit}
            isBlocked={isMonthlyBlocked}
          />
        );
      }
      case 'customers':
        return (
          <Customers
            navigate={navigate}
            customers={customers}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
            currentUserRole={currentUser?.role}
          />
        );
      case 'users':
        return (
          <Users
            navigate={navigate}
            users={users}
            setUsers={setUsers}
            currentUser={currentUser}
          />
        );
      case 'customer_create':
        return (
          <CustomerCreate
            navigate={navigate}
            onCreate={(customer) => setCustomers(prev => [...prev, { ...customer, updatedAt: Date.now() }])}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            navigate={navigate} 
            products={products} 
            setProducts={setProducts}
            onRegisterAdjustment={({ productId, delta, reason, note }) => {
              db.inventoryAdjustments.put({
                id: `ia_${Date.now()}`,
                productId,
                delta,
                reason,
                note,
                createdAt: new Date()
              });
            }}
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
            currentUserRole={currentUser?.role}
          />
        );
      case 'reports':
        return (
          <Reports 
            navigate={navigate} 
            orders={activeOrders} 
            monthlyAccounts={monthlyAccounts}
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
            currentUserRole={currentUser?.role}
          />
        );
      case 'sale':
        return (
          <Sale 
            navigate={navigate} 
            products={products} 
            customers={customers}
            monthlyAccounts={monthlyAccounts}
            privacyMode={privacyMode} 
            activeOrders={activeOrders}
            setActiveOrders={setActiveOrders}
            setProducts={setProducts}
            selectedProductId={selectedProductId}
            clearSelectedProduct={() => setSelectedProductId(null)}
          />
        );
      case 'customer_detail':
        const order = activeOrders.find(o => o.customerId === selectedCustomerId);
        const customer = customers.find(c => c.id === selectedCustomerId);
        return (
          <CustomerDetail 
            navigate={navigate} 
            customer={customer} 
            order={order} 
            products={products}
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode}
            currentUserRole={currentUser?.role}
            onAddItem={(productId) => {
              let added = false;
              setActiveOrders(prev => prev.map(currentOrder => {
                if (currentOrder.id !== order?.id) return currentOrder;
                const product = products.find(p => p.id === productId);
                if (!product || product.status === 'inactive' || (product.stock ?? 0) <= 0) return currentOrder;
                added = true;
                return {
                  ...currentOrder,
                  items: [
                    ...currentOrder.items,
                    {
                      productId,
                      quantity: 1,
                      priceAtSale: product.price
                    }
                  ],
                  updatedAt: Date.now()
                };
              }));
              if (added) {
                setProducts(prev => prev.map(product => {
                  if (product.id !== productId || typeof product.stock !== 'number') return product;
                  return { ...product, stock: Math.max(0, product.stock - 1), updatedAt: Date.now() };
                }));
              }
              return added;
            }}
            onRemoveItem={(itemIndex) => {
              if (!order) return false;
              let removedProductId: string | null = null;
              let removedQty = 0;
              setActiveOrders(prev => prev.map(currentOrder => {
                if (currentOrder.id !== order.id) return currentOrder;
                const item = currentOrder.items[itemIndex];
                if (!item) return currentOrder;
                removedProductId = item.productId;
                removedQty = item.quantity;
                return {
                  ...currentOrder,
                  items: currentOrder.items.filter((_, idx) => idx !== itemIndex),
                  updatedAt: Date.now()
                };
              }));
              if (removedProductId && removedQty > 0) {
                setProducts(prev => prev.map(product => {
                  if (product.id !== removedProductId || typeof product.stock !== 'number') return product;
                  return { ...product, stock: product.stock + removedQty, updatedAt: Date.now() };
                }));
                return true;
              }
              return false;
            }}
            onAddPayment={(amount, method) => {
              setActiveOrders(prev => prev.map(currentOrder => {
                if (currentOrder.id !== order?.id) return currentOrder;
                const payment: Payment = {
                  id: `p_${Date.now()}`,
                  method,
                  amount,
                  createdAt: new Date()
                };
                const consumption = currentOrder.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
                const paid = currentOrder.payments.reduce((acc, p) => acc + p.amount, 0) + amount;
                return {
                  ...currentOrder,
                  payments: [...currentOrder.payments, payment],
                  status: paid >= consumption ? 'closed' : currentOrder.status,
                  updatedAt: Date.now()
                };
              }));
            }}
            onRemoveLastPayment={() => {
              if (!order || currentUser?.role !== 'admin' || order.payments.length === 0) return false;
              let removed = false;
              setActiveOrders(prev => prev.map(currentOrder => {
                if (currentOrder.id !== order.id) return currentOrder;
                if (currentOrder.payments.length === 0) return currentOrder;
                removed = true;
                const nextPayments = currentOrder.payments.slice(0, -1);
                const consumption = currentOrder.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
                const paid = nextPayments.reduce((acc, p) => acc + p.amount, 0);
                return {
                  ...currentOrder,
                  payments: nextPayments,
                  status: paid >= consumption ? 'closed' : 'open',
                  updatedAt: Date.now()
                };
              }));
              return removed;
            }}
            onCloseOrder={() => {
              if (!order) return;
              setActiveOrders(prev => prev.map(currentOrder => {
                if (currentOrder.id !== order.id) return currentOrder;
                return {
                  ...currentOrder,
                  status: 'closed',
                  updatedAt: Date.now()
                };
              }));
              navigate('home');
            }}
          />
        );
      default:
        return (
          <Home
            navigate={navigate}
            orders={activeOrders}
            customers={customers}
            products={products}
            monthlyAccounts={monthlyAccounts}
            onForceSeedSync={handleForceSeedSync}
            onSelectTopProduct={(productId) => {
              setSelectedProductId(productId);
              navigate('sale');
            }}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white font-sans overflow-x-hidden selection:bg-primary/30">
      {renderPage()}
      {currentPage !== 'lock' && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-[100] pointer-events-none"></div>
      )}
    </div>
  );
};

export default App;
