
import React, { useState, useEffect } from 'react';
import { AppState, Order, Product, Customer } from './types';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from './constants';
import LockScreen from './pages/LockScreen';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Sale from './pages/Sale';
import CustomerDetail from './pages/CustomerDetail';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('lock');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: 'o1',
      customerId: 'c3',
      location: 'Mesa',
      table: '04',
      status: 'open',
      items: [{ productId: 'p1', quantity: 3, priceAtSale: 12 }],
      payments: [],
      createdAt: new Date()
    },
    {
      id: 'o2',
      customerId: 'c4',
      location: 'Mesa',
      table: '18',
      status: 'payment',
      items: [{ productId: 'p2', quantity: 2, priceAtSale: 28 }],
      payments: [{ id: 'py1', method: 'PIX', amount: 20, createdAt: new Date() }],
      createdAt: new Date()
    }
  ]);

  const navigate = (page: AppState, customerId: string | null = null) => {
    if (customerId) setSelectedCustomerId(customerId);
    setCurrentPage(page);
  };

  const handleAuthSuccess = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'lock':
        return <LockScreen onAuthSuccess={handleAuthSuccess} />;
      case 'home':
        return (
          <Home 
            navigate={navigate} 
            orders={activeOrders} 
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
          />
        );
      case 'inventory':
        return (
          <Inventory 
            navigate={navigate} 
            products={MOCK_PRODUCTS} 
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
          />
        );
      case 'reports':
        return (
          <Reports 
            navigate={navigate} 
            orders={activeOrders} 
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode} 
          />
        );
      case 'sale':
        return (
          <Sale 
            navigate={navigate} 
            products={MOCK_PRODUCTS} 
            privacyMode={privacyMode} 
            activeOrders={activeOrders}
            setActiveOrders={setActiveOrders}
            selectedCustomerId={selectedCustomerId}
          />
        );
      case 'customer_detail':
        const order = activeOrders.find(o => o.customerId === selectedCustomerId);
        const customer = MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId);
        return (
          <CustomerDetail 
            navigate={navigate} 
            customer={customer} 
            order={order} 
            privacyMode={privacyMode} 
            setPrivacyMode={setPrivacyMode}
          />
        );
      default:
        return <Home navigate={navigate} orders={activeOrders} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} />;
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
