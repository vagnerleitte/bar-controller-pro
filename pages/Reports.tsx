
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, MonthlyAccount, Order, UserRole } from '../types';
import { getMonthlyBalance } from '../utils/monthly';
import BottomNav from '../components/BottomNav';
import { getBarInsights } from '../services/geminiService';
import AppLogo from '../components/AppLogo';
import { applyThemeMode, getStoredThemeMode, ThemeMode } from '../services/theme';

interface ReportsProps {
  // Fix: navigate function signature should accept optional customerId for consistency
  navigate: (page: AppState, customerId?: string | null) => void;
  orders: Order[];
  monthlyAccounts: MonthlyAccount[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
}

const Reports: React.FC<ReportsProps> = ({ navigate, orders, monthlyAccounts, privacyMode, setPrivacyMode, currentUserRole }) => {
  const [insight, setInsight] = useState('Carregando insight gerencial...');
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode());

  const metrics = useMemo(() => {
    const closedOrders = orders.filter(o => o.status === 'closed');
    const openOrders = orders.filter(o => o.status !== 'closed');

    const totalConsumo = closedOrders.reduce((acc, o) =>
      acc + o.items.reduce((sum, i) => sum + (i.priceAtSale * i.quantity), 0), 0
    );
    const totalPago = closedOrders.reduce((acc, o) =>
      acc + o.payments.reduce((sum, p) => sum + p.amount, 0), 0
    );
    const emAbertoComandas = openOrders.reduce((acc, o) => {
      const consumo = o.items.reduce((sum, i) => sum + (i.priceAtSale * i.quantity), 0);
      const pago = o.payments.reduce((sum, p) => sum + p.amount, 0);
      return acc + Math.max(0, consumo - pago);
    }, 0);
    const emAbertoMensalistas = monthlyAccounts.reduce((acc, account) => {
      const balance = getMonthlyBalance(account);
      return acc + (balance > 0 ? balance : 0);
    }, 0);
    const paymentsByMethod = totalOrdersPaymentsByMethod(closedOrders);

    return {
      consumo: totalConsumo,
      pagamentos: totalPago,
      emAbertoComandas,
      emAbertoMensalistas,
      emAbertoTotal: emAbertoComandas + emAbertoMensalistas,
      margem: totalConsumo * 0.42,
      byMethod: paymentsByMethod
    };
  }, [orders, monthlyAccounts]);

  useEffect(() => {
    getBarInsights(metrics).then(setInsight);
  }, [metrics]);

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl safe-area-top">
        <div className="px-6 py-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-primary text-sm">cloud_done</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Sincronizado</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextMode: ThemeMode = themeMode === 'daylight' ? 'default' : 'daylight';
                  applyThemeMode(nextMode);
                  setThemeMode(nextMode);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/10"
                title={themeMode === 'daylight' ? 'Modo padrão' : 'Modo praia'}
              >
                <span className="material-icons-round">{themeMode === 'daylight' ? 'dark_mode' : 'light_mode'}</span>
              </button>
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/10"
              >
                <span className="material-icons-round">{privacyMode ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AppLogo className="w-10 h-10" />
            <h1 className="text-[18px] font-extrabold tracking-tight">Relatórios</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        <section className="flex overflow-x-auto gap-2 no-scrollbar pb-2 -mx-6 px-6">
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-primary text-background-dark font-bold text-sm shadow-lg shadow-primary/20">Hoje</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-bold text-sm">7 dias</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-bold text-sm">Este mês</button>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <span className="material-icons-round absolute -right-4 -top-4 text-7xl opacity-5">local_bar</span>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Consumo</span>
            <div className={`mt-2 text-2xl font-extrabold text-white ${privacyMode ? 'privacy-blur' : ''}`}>
              R$ {metrics.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <span className="material-icons-round absolute -right-4 -top-4 text-7xl opacity-5">payments</span>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Pagamentos</span>
            <div className={`mt-2 text-2xl font-extrabold text-white ${privacyMode ? 'privacy-blur' : ''}`}>
              R$ {metrics.pagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white/5 border-l-4 border-orange-500 border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Em Aberto</span>
            <div className={`mt-2 text-2xl font-extrabold text-orange-500 ${privacyMode ? 'privacy-blur' : ''}`}>
              R$ {metrics.emAbertoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl relative overflow-hidden group">
            <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">Margem Est.</span>
            <div className={`mt-2 text-2xl font-extrabold text-primary ${privacyMode ? 'privacy-blur' : ''}`}>
              R$ {metrics.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/15 to-transparent p-6 rounded-3xl border border-primary/10 shadow-2xl">
          <div className="flex gap-4 items-center">
            <div className="bg-primary/20 p-3 rounded-2xl text-primary shadow-lg shadow-primary/10">
              <span className="material-icons-round text-3xl">insights</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-tight mb-1 uppercase text-primary/60">Insight AI</h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium">{insight}</p>
            </div>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
          <div className="text-xs text-white/70 space-y-1">
            <p>Em aberto (comandas): R$ {metrics.emAbertoComandas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p>Em aberto (mensalistas): R$ {metrics.emAbertoMensalistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <h3 className="font-bold text-lg">Distribuição</h3>
          <div className="space-y-5">
            {[
              { label: 'Pix', color: 'bg-primary', value: metrics.byMethod.PIX },
              { label: 'Cartão', color: 'bg-blue-500', value: metrics.byMethod['Cartão'] },
              { label: 'Dinheiro', color: 'bg-yellow-500', value: metrics.byMethod.Dinheiro }
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{item.label}</span>
                  <span>
                    {metrics.pagamentos > 0
                      ? `${Math.round((item.value / metrics.pagamentos) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${metrics.pagamentos > 0 ? (item.value / metrics.pagamentos) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav activePage="reports" navigate={navigate} currentUserRole={currentUserRole} />
    </div>
  );
};

export default Reports;

function totalOrdersPaymentsByMethod(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      order.payments.forEach(payment => {
        acc[payment.method] += payment.amount;
      });
      return acc;
    },
    {
      PIX: 0,
      Dinheiro: 0,
      Cartão: 0
    } as Record<'PIX' | 'Dinheiro' | 'Cartão', number>
  );
}
