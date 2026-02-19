
import React from 'react';
import { AppState, UserRole } from '../types';

interface BottomNavProps {
  activePage: AppState;
  // Fix: navigate function signature should accept optional customerId for consistency
  navigate: (page: AppState, customerId?: string | null) => void;
  currentUserRole?: UserRole | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, navigate, currentUserRole }) => {
  const tabs: { id: AppState; label: string; icon: string }[] = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'sales', label: 'Vendas', icon: 'point_of_sale' },
    { id: 'monthly_accounts', label: 'Mensal', icon: 'event_repeat' },
    { id: 'inventory', label: 'Estoque', icon: 'inventory_2' },
    ...(currentUserRole === 'admin' ? [{ id: 'reports' as AppState, label: 'Relatórios', icon: 'analytics' }] : []),
    ...(currentUserRole === 'admin' ? [{ id: 'users' as AppState, label: 'Usuários', icon: 'admin_panel_settings' }] : [])
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-2xl border-t border-primary/10 z-50">
      <div className="flex items-center justify-around px-2 pt-3 pb-8">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={`bottom-nav-item flex flex-col items-center gap-1 transition-all ${
              activePage === tab.id
                ? 'bottom-nav-item-active text-primary'
                : 'bottom-nav-item-inactive text-white/40 hover:text-white/60'
            }`}
          >
            <span className="material-icons-round">{tab.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
