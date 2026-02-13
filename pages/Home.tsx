
import React, { useMemo, useState } from 'react';
import { AppState, Order, Customer, Product, User } from '../types';
import BottomNav from '../components/BottomNav';
import TopMenu from '../components/TopMenu';

interface HomeProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  orders: Order[];
  customers: Customer[];
  products: Product[];
  onSelectTopProduct: (productId: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUser: User | null;
}

const Home: React.FC<HomeProps> = ({ navigate, orders, customers, products, onSelectTopProduct, privacyMode, setPrivacyMode, currentUser }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tableFilter, setTableFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  const totalBalance = orders.reduce((acc, order) => {
    const consumption = order.items.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    return acc + (consumption - paid);
  }, 0);

  const openOrders = orders.filter(order => order.status === 'open');
  const filteredOrders = openOrders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const name = customer?.name?.toLowerCase() || '';
    const table = (order.table || '').toLowerCase();
    const search = orderSearch.toLowerCase().trim();
    const tableF = tableFilter.toLowerCase().trim();
    const customerF = customerFilter.toLowerCase().trim();

    const matchesSearch = search.length === 0 || name.includes(search);
    const matchesTable = tableF.length === 0 || table.includes(tableF);
    const matchesCustomer = customerF.length === 0 || name.includes(customerF);
    return matchesSearch && matchesTable && matchesCustomer;
  });

  const topProducts = useMemo(() => {
    const counter = new Map<string, number>();
    orders.forEach(order => {
      order.items.forEach(item => {
        counter.set(item.productId, (counter.get(item.productId) || 0) + item.quantity);
      });
    });
    const ranked = Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([productId, quantity]) => ({ productId, quantity }));
    const list = ranked
      .map(r => {
        const product = products.find(p => p.id === r.productId);
        return product ? { product, quantity: r.quantity } : null;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];

    if (list.length === 0) {
      return products.slice(0, 12).map(product => ({ product, quantity: 0 }));
    }
    return list.slice(0, 12);
  }, [orders, products]);

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Início</h1>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">OFFLINE</span>
            </div>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Gestão de Bar</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPrivacyMode(!privacyMode)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 transition-transform active:scale-90"
            >
              <span className="material-icons-round text-xl">{privacyMode ? 'visibility' : 'visibility_off'}</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('users')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary"
              >
                <span className="material-icons-round text-xl">admin_panel_settings</span>
              </button>
            )}
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
              <span className="material-icons-round text-xl">notifications</span>
            </button>
          </div>
        </div>
        <div className="px-5 pb-4">
          <TopMenu active="list" navigate={navigate} />
        </div>
      </header>

      <main className="px-5">
        {/* Financial Summary */}
        <section className="mt-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-primary font-semibold text-sm">Saldo Total a Receber</p>
              <span className="material-icons-round text-primary/40">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary/60">R$</span>
              <h2 className={`text-4xl font-extrabold text-white tracking-tight ${privacyMode ? 'privacy-blur' : ''}`}>
                {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-primary/80 bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
              <span className="material-icons-round text-sm">trending_up</span>
              <span>+12% que a última semana</span>
            </div>
          </div>
        </section>

        {/* Top Products Mini Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Mais Vendidos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topProducts.map(({ product, quantity }) => (
              <button
                key={product.id}
                onClick={() => onSelectTopProduct(product.id)}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden text-left active:scale-95 transition-transform h-32"
              >
                <div className="h-20 bg-white/10 relative">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute top-2 right-2 bg-background-dark/70 rounded-full px-2 py-1 text-[10px] font-bold text-white">
                    R$ {product.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold truncate">{product.name}</p>
                  <p className="text-[9px] text-white/40 uppercase font-medium">
                    {quantity > 0 ? `${quantity} vendidos` : 'Sem histórico'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Active Accounts Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Comandas Ativas</h3>
            <div className="flex items-center gap-2">
              <div className={`relative overflow-hidden transition-all duration-200 ${showSearch ? 'w-44' : 'w-0'}`}>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onBlur={() => {
                    if (orderSearch.trim().length === 0) setShowSearch(false);
                  }}
                  placeholder="Buscar..."
                  className="w-full bg-white/5 border border-primary/10 rounded-lg py-1.5 pl-8 pr-2 text-xs"
                />
                <span className="material-icons-round absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-sm">search</span>
              </div>
              <button
                onClick={() => {
                  if (showSearch && orderSearch.trim().length === 0) {
                    setShowSearch(false);
                    return;
                  }
                  setShowSearch(true);
                }}
                className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary"
              >
                <span className="material-icons-round text-sm">search</span>
              </button>
              <button
                onClick={() => setShowFilters(v => !v)}
                className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary"
              >
                <span className="material-icons-round text-sm">filter_list</span>
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="Filtrar por mesa"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm"
              />
              <input
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Filtrar por cliente"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {filteredOrders.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              const consumption = order.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
              const paid = order.payments.reduce((acc, p) => acc + p.amount, 0);
              const balance = consumption - paid;

              return (
                <div 
                  key={order.id} 
                  onClick={() => navigate('customer_detail', order.customerId)}
                  className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col justify-between h-40 active:bg-primary/10 transition-colors shadow-lg"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">#{order.table || '00'}</span>
                      <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${order.status === 'open' ? 'bg-primary shadow-primary/50' : 'bg-orange-500 shadow-orange-500/50'}`}></span>
                    </div>
                    <h4 className="mt-2 font-bold text-sm truncate">{customer?.name || 'Cliente Anon.'}</h4>
                    <p className="text-[10px] text-white/40 uppercase font-medium">Há {Math.floor(Math.random() * 59) + 1} min</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Saldo</p>
                    <p className={`text-xl font-extrabold text-white leading-none ${privacyMode ? 'privacy-blur' : ''}`}>
                      R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="col-span-2 text-center text-white/40 text-sm py-6">
                Nenhuma comanda aberta encontrada.
              </div>
            )}
          </div>
        </section>
      </main>

      <button 
        onClick={() => navigate('sale')}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full bg-primary text-background-dark shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-icons-round text-3xl font-bold">add</span>
      </button>

      <BottomNav activePage="home" navigate={navigate} currentUserRole={currentUser?.role} />
    </div>
  );
};

export default Home;
