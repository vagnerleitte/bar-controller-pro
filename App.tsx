
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
import HomeIndicatorBar from './components/HomeIndicatorBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMonthlyBalance, getMonthlyAvailableLimit, isMonthlyBlocked } from './utils/monthly';
import { db, DEFAULT_TENANT_ID, forceSyncSeedData, loadAll, seedIfEmpty } from './services/db';
import { clearAuthSession, ensureDefaultAdmin, logout, restoreAuthUser, upsertSessionUser } from './services/auth';
import { applyThemeMode, getStoredThemeMode, ThemeMode } from './services/theme';

const PAGE_TO_PATH: Record<AppState, string> = {
  lock: '/lock',
  home: '/',
  sales: '/sales',
  inventory: '/inventory',
  reports: '/reports',
  sale: '/sale',
  customer_detail: '/customers/detail',
  customers: '/customers',
  customer_create: '/customers/new',
  monthly_accounts: '/monthly',
  monthly_detail: '/monthly/detail',
  users: '/users'
};

const PATH_TO_PAGE: Record<string, AppState> = {
  '/lock': 'lock',
  '/': 'home',
  '/sales': 'sales',
  '/inventory': 'inventory',
  '/reports': 'reports',
  '/sale': 'sale',
  '/customers/detail': 'customer_detail',
  '/customers': 'customers',
  '/customers/new': 'customer_create',
  '/monthly': 'monthly_accounts',
  '/monthly/detail': 'monthly_detail',
  '/users': 'users'
};

const App: React.FC = () => {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const currentPage = PATH_TO_PAGE[location.pathname] || 'home';
  const [privacyMode, setPrivacyMode] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [monthlyAccounts, setMonthlyAccounts] = useState<MonthlyAccount[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');
  const prevCustomersRef = useRef<Customer[]>([]);
  const prevProductsRef = useRef<Product[]>([]);
  const prevOrdersRef = useRef<Order[]>([]);
  const prevMonthlyRef = useRef<MonthlyAccount[]>([]);
  const prevUsersRef = useRef<User[]>([]);

  useEffect(() => {
    setThemeMode(getStoredThemeMode());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await seedIfEmpty();
      await ensureDefaultAdmin();
      const { users } = await loadAll();
      if (cancelled) return;
      setAllUsers(users.map(user => ({ ...user, tenantId: user.tenantId || DEFAULT_TENANT_ID })));
      setDbReady(true);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadTenantScopedData = async (tenantId: string) => {
    const { customers, products, orders, monthlyAccounts, users } = await loadAll();
    const tenantCustomers = customers.filter(item => (item.tenantId || DEFAULT_TENANT_ID) === tenantId);
    const tenantProducts = products.filter(item => (item.tenantId || DEFAULT_TENANT_ID) === tenantId);
    const tenantOrders = orders.filter(item => (item.tenantId || DEFAULT_TENANT_ID) === tenantId);
    const tenantUsers = users
      .map(item => ({ ...item, tenantId: item.tenantId || DEFAULT_TENANT_ID }))
      .filter(item => item.tenantId === tenantId);
    const parsedMonthly = monthlyAccounts
      .filter(item => (item.tenantId || DEFAULT_TENANT_ID) === tenantId)
      .map(a => ({
        ...a,
        tenantId,
        cycleStart: new Date(a.cycleStart),
        items: (a.items || []).map(i => ({ ...i, createdAt: new Date(i.createdAt) })),
        payments: (a.payments || []).map(p => ({ ...p, createdAt: new Date(p.createdAt) }))
      }));

    setCustomers(tenantCustomers);
    setProducts(tenantProducts.length > 0 ? tenantProducts : MOCK_PRODUCTS.map(p => ({ ...p, tenantId })));
    setActiveOrders(tenantOrders);
    setUsers(tenantUsers);
    setMonthlyAccounts(parsedMonthly);
    prevCustomersRef.current = tenantCustomers;
    prevProductsRef.current = tenantProducts.length > 0 ? tenantProducts : MOCK_PRODUCTS.map(p => ({ ...p, tenantId }));
    prevOrdersRef.current = tenantOrders;
    prevUsersRef.current = tenantUsers;
    prevMonthlyRef.current = parsedMonthly;
  };

  useEffect(() => {
    if (!dbReady) return;
    let cancelled = false;

    const restore = async () => {
      const user = await restoreAuthUser(allUsers);
      if (cancelled) return;
      if (!user) {
        clearAuthSession();
        setCurrentUser(null);
        setCurrentTenantId(null);
        routerNavigate(PAGE_TO_PATH.lock, { replace: true });
        return;
      }

      const tenantId = user.tenantId || DEFAULT_TENANT_ID;
      setCurrentTenantId(tenantId);
      setCurrentUser(user);
      if (location.pathname === PAGE_TO_PATH.lock) {
        routerNavigate(PAGE_TO_PATH.home, { replace: true });
      }
      loadTenantScopedData(tenantId);
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [dbReady, allUsers, location.pathname, routerNavigate]);

  useEffect(() => {
    if (!dbReady || !currentTenantId) return;
    const prev = prevCustomersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = customers.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !customers.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.customers.bulkPut(changed.map(item => ({ ...item, tenantId: currentTenantId })));
    if (removed.length > 0) db.customers.bulkDelete(removed);
    prevCustomersRef.current = customers;
  }, [customers, dbReady, currentTenantId]);

  useEffect(() => {
    if (!dbReady || !currentTenantId) return;
    const prev = prevProductsRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = products.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !products.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.products.bulkPut(changed.map(item => ({ ...item, tenantId: currentTenantId })));
    if (removed.length > 0) db.products.bulkDelete(removed);
    prevProductsRef.current = products;
  }, [products, dbReady, currentTenantId]);

  useEffect(() => {
    if (!dbReady || !currentTenantId) return;
    const prev = prevOrdersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = activeOrders.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !activeOrders.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.orders.bulkPut(changed.map(item => ({ ...item, tenantId: currentTenantId })));
    if (removed.length > 0) db.orders.bulkDelete(removed);
    prevOrdersRef.current = activeOrders;
  }, [activeOrders, dbReady, currentTenantId]);

  useEffect(() => {
    if (!dbReady || !currentTenantId) return;
    const prev = prevMonthlyRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = monthlyAccounts.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !monthlyAccounts.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.monthlyAccounts.bulkPut(changed.map(item => ({ ...item, tenantId: currentTenantId })));
    if (removed.length > 0) db.monthlyAccounts.bulkDelete(removed);
    prevMonthlyRef.current = monthlyAccounts;
  }, [monthlyAccounts, dbReady, currentTenantId]);

  useEffect(() => {
    if (!dbReady || !currentTenantId) return;
    const prev = prevUsersRef.current;
    const prevById = new Map(prev.map(item => [item.id, item]));
    const changed = users.filter(item => {
      const previous = prevById.get(item.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(item);
    });
    const removed = prev.filter(item => !users.some(current => current.id === item.id)).map(item => item.id);
    if (changed.length > 0) db.users.bulkPut(changed.map(item => ({ ...item, tenantId: currentTenantId })));
    if (removed.length > 0) db.users.bulkDelete(removed);
    prevUsersRef.current = users;
    setAllUsers(previous => {
      const withoutTenant = previous.filter(item => (item.tenantId || DEFAULT_TENANT_ID) !== currentTenantId);
      return [...withoutTenant, ...users.map(item => ({ ...item, tenantId: currentTenantId }))];
    });
  }, [users, dbReady, currentTenantId]);

  const navigate = (page: AppState, customerId: string | null = null) => {
    const path = PAGE_TO_PATH[page] || PAGE_TO_PATH.home;
    const params = new URLSearchParams();
    const resolvedCustomerId = customerId || null;
    if (resolvedCustomerId) {
      setSelectedCustomerId(resolvedCustomerId);
      params.set('customerId', resolvedCustomerId);
    }
    if (page === 'lock') {
      void logout();
      setCurrentUser(null);
      setCurrentTenantId(null);
    }
    if (page === 'users' && currentUser?.role !== 'admin') {
      return;
    }
    if (page === 'reports' && currentUser?.role !== 'admin') {
      return;
    }
    routerNavigate(`${path}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleAuthSuccess = (user: User) => {
    const normalizedUser = { ...user, tenantId: user.tenantId || DEFAULT_TENANT_ID };
    upsertSessionUser(normalizedUser);
    setCurrentUser(normalizedUser);
    setCurrentTenantId(normalizedUser.tenantId);
    loadTenantScopedData(normalizedUser.tenantId);
    routerNavigate(PAGE_TO_PATH.home, { replace: true });
  };

  const handleForceSeedSync = async () => {
    if (!currentTenantId) return;
    await forceSyncSeedData(currentTenantId);
    await loadTenantScopedData(currentTenantId);
  };

  useEffect(() => {
    if (!dbReady) return;
    if (!currentUser && currentPage !== 'lock') {
      routerNavigate(PAGE_TO_PATH.lock, { replace: true });
    }
  }, [currentUser, currentPage, dbReady, routerNavigate]);

  const routeCustomerId = new URLSearchParams(location.search).get('customerId');
  const effectiveCustomerId = routeCustomerId || selectedCustomerId;

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
        const account = monthlyAccounts.find(a => a.customerId === effectiveCustomerId);
        const customer = customers.find(c => c.id === effectiveCustomerId);
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
                if (a.customerId !== effectiveCustomerId) return a;
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
                if (a.customerId !== effectiveCustomerId) return a;
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
            customers={customers}
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
              if (!currentTenantId) return;
              db.inventoryAdjustments.put({
                id: `ia_${Date.now()}`,
                tenantId: currentTenantId,
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
        const order = activeOrders.find(o => o.customerId === effectiveCustomerId);
        const customer = customers.find(c => c.id === effectiveCustomerId);
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
      <button
        type="button"
        onClick={() => {
          const nextMode: ThemeMode = themeMode === 'daylight' ? 'default' : 'daylight';
          applyThemeMode(nextMode);
          setThemeMode(nextMode);
        }}
        className="fixed top-5 right-20 sm:right-5 z-[300] w-11 h-11 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center backdrop-blur-xl"
        title={themeMode === 'daylight' ? 'Modo padrão' : 'Modo praia'}
        aria-label={themeMode === 'daylight' ? 'Ativar modo padrão' : 'Ativar modo praia'}
      >
        <span className="material-icons-round text-[20px]">
          {themeMode === 'daylight' ? 'dark_mode' : 'light_mode'}
        </span>
      </button>
      {renderPage()}
      {currentPage !== 'lock' && (
        <HomeIndicatorBar />
      )}
    </div>
  );
};

export default App;
