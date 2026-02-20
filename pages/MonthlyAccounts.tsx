import React from 'react';
import { AppState, Customer, MonthlyAccount, User, UserRole } from '../types';
import BottomNav from '../components/BottomNav';
import { getDaysSinceCycleStart, getMonthlyAvailableLimit, getMonthlyBalance, isMonthlyBlocked, isMonthlyOverdue } from '../utils/monthly';
import MainTopBar from '../components/MainTopBar';

interface MonthlyAccountsProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  customers: Customer[];
  accounts: MonthlyAccount[];
  currentUserRole?: UserRole | null;
  currentUser: User | null;
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
  onForceSeedSync: () => Promise<void>;
}

const MonthlyAccounts: React.FC<MonthlyAccountsProps> = ({ navigate, customers, accounts, currentUserRole, currentUser, privacyMode, setPrivacyMode, onForceSeedSync }) => {
  return (
    <div className="pb-32">
      <MainTopBar
        navigate={navigate}
        privacyMode={privacyMode}
        setPrivacyMode={setPrivacyMode}
        currentUser={currentUser}
        onForceSeedSync={onForceSeedSync}
      />

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
                  <p className="text-[10px] text-white/40 uppercase font-medium">
                    Limite: R$ {account.limit.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase font-medium">
                    Disponível: R$ {available.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold">R$ {balance.toFixed(2)}</p>
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
