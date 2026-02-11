
import React from 'react';
import { AppState, Order } from '../types';
import { MOCK_CUSTOMERS } from '../constants';
import BottomNav from '../components/BottomNav';

interface HomeProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  orders: Order[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}

const Home: React.FC<HomeProps> = ({ navigate, orders, privacyMode, setPrivacyMode }) => {
  const totalBalance = orders.reduce((acc, order) => {
    const consumption = order.items.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    return acc + (consumption - paid);
  }, 0);

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
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
              <span className="material-icons-round text-xl">notifications</span>
            </button>
          </div>
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

        {/* Favorites Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Favoritos</h3>
            <button className="text-primary text-sm font-semibold hover:opacity-70 transition-opacity">Ver todos</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5">
            {MOCK_CUSTOMERS.filter(c => c.isFavorite).map(customer => (
              <button 
                key={customer.id} 
                onClick={() => navigate('sale')}
                className="flex flex-col items-center gap-2 min-w-[70px] active:scale-95 transition-transform"
              >
                <div className="relative">
                  <img src={customer.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-primary p-0.5" alt={customer.name} />
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-background-dark flex items-center justify-center">
                    <span className="material-icons-round text-[10px] text-background-dark">push_pin</span>
                  </div>
                </div>
                <span className="text-xs font-semibold truncate w-full text-center">{customer.name.split(' ')[0]}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-primary/50">
                <span className="material-icons-round">add</span>
              </div>
              <span className="text-xs font-semibold text-primary/50">Novo</span>
            </button>
          </div>
        </section>

        {/* Active Accounts Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Contas Ativas</h3>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round text-sm">search</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round text-sm">filter_list</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {orders.map(order => {
              const customer = MOCK_CUSTOMERS.find(c => c.id === order.customerId);
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
          </div>
        </section>
      </main>

      <button 
        onClick={() => navigate('sale')}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full bg-primary text-background-dark shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-icons-round text-3xl font-bold">add</span>
      </button>

      <BottomNav activePage="home" navigate={navigate} />
    </div>
  );
};

export default Home;
