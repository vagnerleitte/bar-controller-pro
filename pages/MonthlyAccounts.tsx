import React from 'react';
import { AppState, Customer, MonthlyAccount, UserRole } from '../types';
import BottomNav from '../components/BottomNav';
import { getDaysSinceCycleStart, getMonthlyAvailableLimit, getMonthlyBalance, isMonthlyBlocked, isMonthlyOverdue } from '../utils/monthly';

interface MonthlyAccountsProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  customers: Customer[];
  accounts: MonthlyAccount[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
}

const MonthlyAccounts: React.FC<MonthlyAccountsProps> = ({ navigate, customers, accounts, privacyMode, setPrivacyMode, currentUserRole }) => {
  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Mensalistas</h1>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Contas mensais</p>
          </div>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <span className="material-icons-round text-xl">{privacyMode ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6 space-y-4">
        {accounts.map(account => {
          const customer = customers.find(c => c.id === account.customerId);
          const balance = getMonthlyBalance(account);
          const available = getMonthlyAvailableLimit(account);
          const days = getDaysSinceCycleStart(account);
          const blocked = isMonthlyBlocked(account);
          const overdue = isMonthlyOverdue(account);

          return (
            <button
              key={account.id}
              onClick={() => navigate('monthly_detail', account.customerId)}
              className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={customer?.avatar}
                  alt={customer?.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div>
                  <p className="font-bold text-sm">{customer?.name || 'Cliente'}</p>
                  <p className={`text-[10px] text-white/40 uppercase font-medium ${privacyMode ? 'privacy-blur' : ''}`}>
                    Limite: R$ {account.limit.toFixed(2)}
                  </p>
                  <p className={`text-[10px] text-white/40 uppercase font-medium ${privacyMode ? 'privacy-blur' : ''}`}>
                    Disponível: R$ {available.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-extrabold ${privacyMode ? 'privacy-blur' : ''}`}>R$ {balance.toFixed(2)}</p>
                <p className={`text-[10px] uppercase font-bold ${blocked ? 'text-red-400' : overdue ? 'text-orange-400' : 'text-primary/70'}`}>
                  {blocked ? 'Bloqueado' : overdue ? 'Atrasado' : `Ciclo ${days}d`}
                </p>
              </div>
            </button>
          );
        })}

        {accounts.length === 0 && (
          <div className="text-center text-white/40 text-sm">Nenhuma conta mensalista cadastrada.</div>
        )}
      </main>

      <BottomNav activePage="monthly_accounts" navigate={navigate} currentUserRole={currentUserRole} />
    </div>
  );
};

export default MonthlyAccounts;
