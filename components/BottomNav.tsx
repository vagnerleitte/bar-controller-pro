
import React from 'react';
import { AppState } from '../types';

interface BottomNavProps {
  activePage: AppState;
  // Fix: navigate function signature should accept optional customerId for consistency
  navigate: (page: AppState, customerId?: string | null) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, navigate }) => {
  const tabs: { id: AppState; label: string; icon: string }[] = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'inventory', label: 'Estoque', icon: 'inventory_2' },
    { id: 'reports', label: 'Relatórios', icon: 'analytics' },
    { id: 'lock', label: 'Sair', icon: 'logout' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-2xl border-t border-primary/10 z-50">
      <div className="flex items-center justify-around px-2 pt-3 pb-8">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activePage === tab.id ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}
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
