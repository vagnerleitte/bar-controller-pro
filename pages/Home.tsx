
import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Order, Customer, Product, User, MonthlyAccount } from '../types';
import BottomNav from '../components/BottomNav';
import AppLogo from '../components/AppLogo';
import { FormInput } from '../components/form';
import { applyThemeMode, getStoredThemeMode, ThemeMode } from '../services/theme';

interface HomeProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  orders: Order[];
  customers: Customer[];
  products: Product[];
  monthlyAccounts: MonthlyAccount[];
  onForceSeedSync: () => Promise<void>;
  onSelectTopProduct: (productId: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUser: User | null;
}

const Home: React.FC<HomeProps> = ({ navigate, orders, customers, products, monthlyAccounts, onForceSeedSync, onSelectTopProduct, privacyMode, setPrivacyMode, currentUser }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tableFilter, setTableFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [syncingSeed, setSyncingSeed] = useState(false);
  const [seedToast, setSeedToast] = useState<string | null>(null);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');

  useEffect(() => {
    setThemeMode(getStoredThemeMode());
  }, []);

  const isDaylight = themeMode === 'daylight';

  const filteredOrders = orders.filter(order => {
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
  const filteredOpenOrders = filteredOrders.filter(order => order.status === 'open');
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

  const handleForceSeedSync = async () => {
    const confirmed = confirm('Isso vai substituir clientes, produtos, comandas e mensalistas pelos dados de seed. Continuar?');
    if (!confirmed) return;
    setSyncingSeed(true);
    try {
      await onForceSeedSync();
      setSeedToast('Seed sincronizado com sucesso.');
    } catch {
      setSeedToast('Falha ao sincronizar seed.');
    } finally {
      setSyncingSeed(false);
    }
  };

  return (
    <div className={`pb-32 min-h-screen ${isDaylight ? 'bg-gradient-to-b from-[#e9fff2] via-[#f6fff9] to-[#e6f9ef] text-[#062b17]' : 'bg-gradient-to-b from-[#022e22] via-[#012417] to-[#03150f]'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b border-primary/20 safe-area-top ${isDaylight ? 'bg-[#ecfff4]/92' : 'bg-[#022e22]/85'}`}>
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AppLogo className="w-11 h-11 border-2 border-primary rounded-full p-1 bg-[#063c2a]" />
              <span className="absolute -bottom-2 -right-1 bg-primary text-[#022114] text-[10px] font-black px-2 py-0.5 rounded-full leading-none">TOP</span>
            </div>
            <div>
              <h1 className="text-[17px] leading-none font-black tracking-tight">Painel Boteco</h1>
              <p className="text-primary text-xl font-semibold mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/70"></span>
                Operante
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextMode: ThemeMode = isDaylight ? 'default' : 'daylight';
                  applyThemeMode(nextMode);
                  setThemeMode(nextMode);
                }}
                className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
                title={isDaylight ? 'Modo padrão' : 'Modo sol'}
              >
                <span className="material-icons-round text-xl">{isDaylight ? 'dark_mode' : 'wb_sunny'}</span>
              </button>
              <button
                onClick={() => setTopMenuOpen(prev => !prev)}
                className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
                title="Mais ações"
              >
                <span className="material-icons-round text-2xl">more_vert</span>
              </button>
            </div>
            {topMenuOpen && (
              <div className={`absolute right-0 mt-2 w-56 border border-primary/25 rounded-2xl shadow-2xl z-50 overflow-hidden ${isDaylight ? 'bg-[#f5fff9]' : 'bg-[#083626]'}`}>
                <button
                  onClick={() => {
                    setPrivacyMode(!privacyMode);
                    setTopMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
                >
                  <span className="material-icons-round text-base text-primary">{privacyMode ? 'visibility' : 'visibility_off'}</span>
                  {privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
                </button>
                <button
                  onClick={async () => {
                    setTopMenuOpen(false);
                    await handleForceSeedSync();
                  }}
                  disabled={syncingSeed}
                  className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 disabled:opacity-50 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
                >
                  <span className="material-icons-round text-base text-primary">{syncingSeed ? 'sync' : 'sync_alt'}</span>
                  {syncingSeed ? 'Sincronizando seed...' : 'Forçar sync seed'}
                </button>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('users');
                      setTopMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
                  >
                    <span className="material-icons-round text-base text-primary">admin_panel_settings</span>
                    Gerenciar usuários
                  </button>
                )}
                <button
                  onClick={() => {
                    setTopMenuOpen(false);
                    navigate('lock');
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-red-300 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10"
                >
                  <span className="material-icons-round text-base text-red-300">logout</span>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-5">
        <section className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('sale')}
            className="w-full h-24 rounded-[30px] bg-primary text-[#042317] font-black text-[14px] tracking-tight flex items-center justify-center gap-2 shadow-[0_16px_40px_rgba(26,232,111,0.25)]"
          >
            <span className="material-icons-round text-[13px]">point_of_sale</span>
            Venda avulsa
          </button>
          <button
            onClick={() => navigate('customers')}
            className="w-full h-24 rounded-[30px] bg-[#083d2b] border border-primary/20 text-primary font-extrabold text-[14px] tracking-tight flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-[14px]">add_circle</span>
            Abrir Comanda
          </button>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase tracking-[0.14em] text-white/65">Produtos mais vendidos</h3>
            <span className="text-primary text-base font-bold flex items-center gap-1">Hoje <span className="material-icons-round text-base">expand_more</span></span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topProducts.map(({ product, quantity }) => (
              <button
                key={product.id}
                onClick={() => onSelectTopProduct(product.id)}
                className="bg-[#083626] border border-primary/20 rounded-3xl overflow-hidden text-left active:scale-95 transition-transform h-44 relative"
              >
                <div className="h-28 bg-black/10 relative">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute top-2 right-2 bg-[#001710]/75 rounded-full w-9 h-9 text-[14px] font-extrabold text-white flex items-center justify-center">
                    {quantity || 0}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-primary truncate">R$ {product.price.toFixed(2)}</p>
                  <p className="text-[11px] text-white/75 font-semibold truncate">{product.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase tracking-[0.12em] text-white/65">Comandas abertas ({filteredOpenOrders.length})</h3>
            <div className="flex items-center gap-2">
              <div className={`relative overflow-hidden transition-all duration-200 ${showSearch ? 'w-44' : 'w-0'}`}>
                <FormInput
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onBlur={() => {
                    if (orderSearch.trim().length === 0) setShowSearch(false);
                  }}
                  placeholder="Buscar..."
                  className="rounded-xl py-2 pl-8 pr-2 text-xs border-primary/20 bg-[#083626]"
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
                className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              >
                <span className="material-icons-round text-sm">search</span>
              </button>
              <button
                onClick={() => setShowFilters(v => !v)}
                className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              >
                <span className="material-icons-round text-sm">filter_list</span>
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <FormInput
                type="text"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="Filtrar por mesa"
                className="py-2.5 px-3 text-sm"
              />
              <FormInput
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Filtrar por cliente"
                className="py-2.5 px-3 text-sm"
              />
            </div>
          )}
          <div className="space-y-3">
            {filteredOpenOrders.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              const consumption = order.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
              const paid = order.payments.reduce((acc, p) => acc + p.amount, 0);
              const balance = consumption - paid;

              return (
                <div
                  key={order.id} 
                  onClick={() => navigate('customer_detail', order.customerId)}
                  className="bg-[#083626] border border-primary/25 rounded-[28px] px-4 py-3 flex items-center justify-between active:bg-[#0a4631] transition-colors shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                      {(customer?.name || 'CA').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-2xl leading-tight truncate max-w-[165px]">{customer?.name || 'Cliente Anon.'}</h4>
                      <p className="text-sm text-primary/80 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Mesa {order.table || '00'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className={`text-3xl font-black text-primary leading-none ${privacyMode ? 'privacy-blur' : ''}`}>
                      R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredOpenOrders.length === 0 && (
              <div className="text-center text-white/40 text-sm py-6">
                Nenhuma comanda aberta encontrada.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 mb-8" />
      </main>

      <button 
        onClick={() => navigate('sale')}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full bg-primary text-background-dark shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-icons-round text-3xl font-bold">add</span>
      </button>

      {seedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[240] bg-black/80 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold">
          {seedToast}
          <button className="ml-3 text-primary" onClick={() => setSeedToast(null)}>OK</button>
        </div>
      )}
      <BottomNav activePage="home" navigate={navigate} currentUserRole={currentUser?.role} />
    </div>
  );
};

export default Home;
