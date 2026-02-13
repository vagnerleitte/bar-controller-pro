
import React, { useState } from 'react';
import { AppState, Product, UserRole } from '../types';
import BottomNav from '../components/BottomNav';

interface InventoryProps {
  // Fix: navigate function signature should accept optional customerId for consistency
  navigate: (page: AppState, customerId?: string | null) => void;
  products: Product[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
}

const Inventory: React.FC<InventoryProps> = ({ navigate, products, privacyMode, setPrivacyMode, currentUserRole }) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80">Local Storage Active</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <span className="material-icons-round">{privacyMode ? 'visibility' : 'visibility_off'}</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20">
                <span className="material-icons-round">add</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Estoque</h1>
          
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary">search</span>
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-background-dark rounded-full text-[10px] font-bold whitespace-nowrap">
              GRUPO: TODOS <span className="material-icons-round text-sm">expand_more</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-full text-[10px] font-bold whitespace-nowrap">
              STATUS <span className="material-icons-round text-sm">tune</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center active:bg-white/10 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base leading-tight">{product.name}</h3>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">SKU: {product.sku}</span>
                <div className="flex gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold text-white/60 uppercase">{product.category}</span>
                  {product.status === 'fractioned' && (
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-[8px] font-bold text-primary uppercase">Fracionado</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Unitário</p>
              <p className={`text-lg font-extrabold text-primary ${privacyMode ? 'privacy-blur' : ''}`}>
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-28 right-6">
        <button className="w-16 h-16 rounded-full bg-primary text-background-dark shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-icons-round text-3xl font-bold">post_add</span>
        </button>
      </div>

      <BottomNav activePage="inventory" navigate={navigate} currentUserRole={currentUserRole} />
    </div>
  );
};

export default Inventory;
