import React from 'react';
import { AppState, Customer, UserRole } from '../types';
import BottomNav from '../components/BottomNav';
import TopMenu from '../components/TopMenu';

interface CustomersProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  customers: Customer[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
}

const Customers: React.FC<CustomersProps> = ({ navigate, customers, privacyMode, setPrivacyMode, currentUserRole }) => {
  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Clientes</h1>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Cadastro e lista</p>
          </div>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <span className="material-icons-round text-xl">{privacyMode ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        <div className="px-5 pb-4">
          <TopMenu active="list" navigate={navigate} />
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {customers.map(customer => (
          <div
            key={customer.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-12 h-12 rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="font-bold text-sm">{customer.name}</p>
                <p className={`text-[10px] text-white/40 uppercase font-medium ${privacyMode ? 'privacy-blur' : ''}`}>
                  {customer.phone}
                </p>
                {(customer.birthday || customer.cpf) && (
                  <p className={`text-[10px] text-white/30 uppercase font-medium ${privacyMode ? 'privacy-blur' : ''}`}>
                    {customer.birthday ? `Nasc: ${customer.birthday}` : ''}
                    {customer.birthday && customer.cpf ? ' • ' : ''}
                    {customer.cpf ? `CPF: ${customer.cpf}` : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('customer_detail', customer.id)}
              className="text-primary text-xs font-bold uppercase tracking-widest"
            >
              Abrir
            </button>
          </div>
        ))}

        {customers.length === 0 && (
          <div className="text-center text-white/40 text-sm">Nenhum cliente cadastrado.</div>
        )}
      </main>

      <BottomNav activePage="home" navigate={navigate} currentUserRole={currentUserRole} />
    </div>
  );
};

export default Customers;
