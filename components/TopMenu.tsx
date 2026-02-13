import React from 'react';
import { AppState } from '../types';

interface TopMenuProps {
  active: 'list' | 'create';
  navigate: (page: AppState, customerId?: string | null) => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ active, navigate }) => {
  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        onClick={() => navigate('customers')}
        className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
          active === 'list'
            ? 'bg-primary text-background-dark border-primary'
            : 'bg-white/5 text-white/60 border-white/10'
        }`}
      >
        Clientes
      </button>
      <button
        onClick={() => navigate('customer_create')}
        className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
          active === 'create'
            ? 'bg-primary text-background-dark border-primary'
            : 'bg-white/5 text-white/60 border-white/10'
        }`}
      >
        Novo Cliente
      </button>
    </div>
  );
};

export default TopMenu;
