import React, { useMemo, useState } from 'react';
import { AppState, Customer, Order, UserRole } from '../types';
import BottomNav from '../components/BottomNav';

interface SalesProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  orders: Order[];
  customers: Customer[];
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
  currentUserRole?: UserRole | null;
}

type Period = 'today' | '7d' | '30d' | 'month';

const Sales: React.FC<SalesProps> = ({ navigate, orders, customers, privacyMode, setPrivacyMode, currentUserRole }) => {
  const [period, setPeriod] = useState<Period>('today');

  const { list, totalValue, totalPaid } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const getStartDate = () => {
      if (period === 'today') return startOfToday;
      if (period === '7d') return new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
      if (period === '30d') return new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
      return startOfMonth;
    };

    const startDate = getStartDate();
    const closedOrders = orders
      .filter(order => order.status === 'closed')
      .filter(order => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= startDate && createdAt <= now;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const summary = closedOrders.reduce(
      (acc, order) => {
        const saleTotal = order.items.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0);
        const paid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
        acc.totalValue += saleTotal;
        acc.totalPaid += paid;
        return acc;
      },
      { totalValue: 0, totalPaid: 0 }
    );

    return { list: closedOrders, totalValue: summary.totalValue, totalPaid: summary.totalPaid };
  }, [orders, period]);

  const getPaymentMethods = (order: Order) => {
    const byMethod = new Map<string, number>();
    order.payments.forEach(payment => {
      byMethod.set(payment.method, (byMethod.get(payment.method) || 0) + payment.amount);
    });
    return Array.from(byMethod.entries());
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Vendas</h1>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Visão diária por padrão</p>
          </div>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20"
          >
            <span className="material-icons-round text-xl">{privacyMode ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        <div className="px-5 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setPeriod('today')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${period === 'today' ? 'bg-primary text-background-dark' : 'bg-white/5 border border-white/10 text-white/70'}`}>Hoje</button>
          <button onClick={() => setPeriod('7d')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${period === '7d' ? 'bg-primary text-background-dark' : 'bg-white/5 border border-white/10 text-white/70'}`}>7 dias</button>
          <button onClick={() => setPeriod('30d')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${period === '30d' ? 'bg-primary text-background-dark' : 'bg-white/5 border border-white/10 text-white/70'}`}>30 dias</button>
          <button onClick={() => setPeriod('month')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${period === 'month' ? 'bg-primary text-background-dark' : 'bg-white/5 border border-white/10 text-white/70'}`}>Este mês</button>
        </div>
      </header>

      <main className="px-5 py-5 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total vendido</p>
            <p className={`text-lg font-black ${privacyMode ? 'privacy-blur' : ''}`}>R$ {totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total recebido</p>
            <p className={`text-lg font-black text-primary ${privacyMode ? 'privacy-blur' : ''}`}>R$ {totalPaid.toFixed(2)}</p>
          </div>
        </section>

        <section className="space-y-3">
          {list.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const total = order.items.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0);
            const methods = getPaymentMethods(order);
            return (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold">{customer?.name || (order.customerId === 'walkin' ? 'Cliente avulso' : 'Cliente')}</p>
                    <p className="text-[10px] text-white/40 uppercase font-medium">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} • Mesa {order.table || '--'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-primary/15 text-primary">
                    {order.isQuickSale ? 'Avulsa' : 'Comanda'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-base font-black ${privacyMode ? 'privacy-blur' : ''}`}>R$ {total.toFixed(2)}</p>
                  <div className="flex flex-wrap justify-end gap-1">
                    {methods.map(([method, amount]) => (
                      <span key={`${order.id}-${method}`} className="text-[10px] px-2 py-1 rounded bg-white/10 border border-white/10">
                        {method}: R$ {amount.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center text-white/40 text-sm py-10">Nenhuma venda no período.</div>
          )}
        </section>
      </main>

      <BottomNav activePage="sales" navigate={navigate} currentUserRole={currentUserRole} />
    </div>
  );
};

export default Sales;
