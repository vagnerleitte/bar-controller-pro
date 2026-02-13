
import React from 'react';
import { AppState, Order, Customer, Product } from '../types';

interface CustomerDetailProps {
  navigate: (page: AppState) => void;
  customer?: Customer;
  order?: Order;
  products: Product[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ navigate, customer, order, products, privacyMode, setPrivacyMode }) => {
  if (!customer || !order) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p>Comanda não encontrada</p>
        <button onClick={() => navigate('home')} className="bg-primary text-black px-4 py-2 rounded">Voltar</button>
      </div>
    );
  }

  const consumption = order.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
  const paid = order.payments.reduce((acc, p) => acc + p.amount, 0);
  const balance = consumption - paid;

  return (
    <div className="pb-60">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('home')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 active:scale-90 transition-transform">
              <span className="material-icons-round text-xl">arrow_back_ios_new</span>
            </button>
            <div>
              <h1 className="text-lg font-extrabold">{customer.name}</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Comanda Aberta</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/10"
          >
            <span className="material-icons-round">{privacyMode ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </header>

      <main className="p-5 space-y-8">
        {/* Dash Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Consumo</p>
            <p className={`text-sm font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {consumption.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Pago</p>
            <p className={`text-sm font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {paid.toFixed(2)}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl shadow-lg shadow-primary/5">
            <p className="text-[8px] font-extrabold text-primary uppercase tracking-[0.2em] mb-1">Saldo</p>
            <p className={`text-sm font-black text-primary ${privacyMode ? 'privacy-blur' : ''}`}>R$ {balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Consumption List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Consumo (Vendas)</h2>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-bold text-white/40">{order.items.length} Pedidos</span>
          </div>
          
          <div className="space-y-3">
            {order.items.map((item, idx) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <span className="material-icons-round text-primary/60">{product?.category === 'Drinks' ? 'sports_bar' : 'restaurant'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product?.name || 'Item desconhecido'}</p>
                      <p className="text-[10px] text-white/30 uppercase font-medium">{item.quantity} un • R$ {item.priceAtSale.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`font-extrabold text-sm ${privacyMode ? 'privacy-blur' : ''}`}>
                    R$ {(item.quantity * item.priceAtSale).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payments Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Pagamentos</h2>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest italic">Parcial</span>
          </div>

          <div className="space-y-3">
            {order.payments.map((payment, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-primary shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-icons-round">qr_code_2</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{payment.method}</p>
                    <p className="text-[10px] text-white/30 uppercase font-medium">Hoje, {payment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={`font-black text-sm text-primary ${privacyMode ? 'privacy-blur' : ''}`}>
                  R$ {payment.amount.toFixed(2)}
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => navigate('sale')}
              className="w-full bg-white/5 border border-dashed border-white/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-white/40 font-bold text-xs uppercase tracking-widest active:bg-white/10"
            >
              <span className="material-icons-round text-sm">add_circle_outline</span>
              Adicionar Pagamento
            </button>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background-dark/80 backdrop-blur-2xl border-t border-white/5 safe-area-bottom z-[100]">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Saldo Restante</span>
          <div className={`text-xl font-black text-orange-500 ${privacyMode ? 'privacy-blur' : ''}`}>
            R$ {balance.toFixed(2)}
          </div>
        </div>
        
        <button 
          disabled={balance > 0}
          className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
            balance <= 0 
            ? 'bg-primary text-background-dark shadow-xl shadow-primary/20' 
            : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
          }`}
        >
          <span className="material-icons-round">{balance <= 0 ? 'lock_open' : 'lock_clock'}</span>
          FECHAR COMANDA
        </button>
        <p className="text-center text-[8px] text-white/20 mt-4 uppercase tracking-[0.3em] font-bold">Liquidite o saldo total para encerrar</p>
      </footer>
    </div>
  );
};

export default CustomerDetail;
