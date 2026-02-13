
import React, { useState, useEffect } from 'react';
import { AppState, Order, Customer, MonthlyAccount, MonthlyItem, MonthlyPayment, Product, User } from './types';
import { MOCK_PRODUCTS } from './constants';
import LockScreen from './pages/LockScreen';
import Home from './pages/Home';
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
import { db, loadAll, seedIfEmpty } from './services/db';
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

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await seedIfEmpty();
      await ensureDefaultAdmin();
      const { customers, products, orders, monthlyAccounts, users } = await loadAll();
      if (cancelled) return;
      setCustomers(customers);
      setProducts(products.length > 0 ? products : MOCK_PRODUCTS);
      setActiveOrders(orders);
      setUsers(users);
      setMonthlyAccounts(
        monthlyAccounts.map(a => ({
          ...a,
          cycleStart: new Date(a.cycleStart),
          items: (a.items || []).map(i => ({ ...i, createdAt: new Date(i.createdAt) })),
          payments: (a.payments || []).map(p => ({ ...p, createdAt: new Date(p.createdAt) }))
        }))
      );
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
    if (!userId) return;
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('home');
    }
  }, [dbReady, users]);

  useEffect(() => {
    if (!dbReady) return;
    db.customers.bulkPut(customers);
  }, [customers, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    db.products.bulkPut(products);
  }, [products, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    db.orders.bulkPut(activeOrders);
  }, [activeOrders, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    db.monthlyAccounts.bulkPut(monthlyAccounts);
  }, [monthlyAccounts, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    db.users.bulkPut(users);
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
    setCurrentPage(page);
  };

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('auth_user_id', user.id);
    setCurrentUser(user);
    setCurrentPage('home');
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
            onSelectTopProduct={(productId) => {
              setSelectedProductId(productId);
              navigate('sale');
            }}
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
            currentUser={currentUser}
          />
        );
      case 'monthly_accounts':
        return (
          <MonthlyAccounts
            navigate={navigate}
            customers={customers}
            accounts={monthlyAccounts}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
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
          />
        );
      default:
        return (
          <Home
            navigate={navigate}
            orders={activeOrders}
            customers={customers}
            products={products}
            onSelectTopProduct={(productId) => {
              setSelectedProductId(productId);
              navigate('sale');
            }}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
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
