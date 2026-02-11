
import React, { useState } from 'react';
import { AppState, Product, Order } from '../types';

interface SaleProps {
  // Fix: navigate function signature should accept optional customerId to match App.tsx definition
  navigate: (page: AppState, customerId?: string | null) => void;
  products: Product[];
  privacyMode: boolean;
  activeOrders: Order[];
  setActiveOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  selectedCustomerId: string | null;
}

const Sale: React.FC<SaleProps> = ({ navigate, products, privacyMode, activeOrders, setActiveOrders, selectedCustomerId }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showScanner, setShowScanner] = useState(false);

  const handleAdd = () => {
    if (!selectedProduct) return;
    
    // Tenta encontrar a ordem do cliente selecionado, ou usa a primeira aberta
    const targetCustomerId = selectedCustomerId || activeOrders[0]?.customerId;
    const orderIndex = activeOrders.findIndex(o => o.customerId === targetCustomerId);
    
    if (orderIndex > -1) {
      const newOrders = [...activeOrders];
      newOrders[orderIndex].items.push({
        productId: selectedProduct.id,
        quantity,
        priceAtSale: selectedProduct.price
      });
      setActiveOrders(newOrders);
      navigate('customer_detail', targetCustomerId);
    } else {
      // Opcional: Criar nova ordem se não houver nenhuma ativa
      alert("Por favor, selecione um cliente ou abra uma mesa primeiro.");
    }
    
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      <header className="safe-area-top sticky top-0 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate('home')} className="text-primary active:scale-90 transition-transform">
            <span className="material-icons-round text-3xl">chevron_left</span>
          </button>
          <h1 className="text-lg font-extrabold tracking-tight">Nova Venda</h1>
          <button 
            onClick={() => setShowScanner(true)}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
          >
            <span className="material-icons-round text-xl">qr_code_scanner</span>
          </button>
        </div>
        
        <div className="px-5 pb-4 space-y-4">
          <div className="relative">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nome ou SKU..." 
              className="w-full bg-white/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 pb-48">
        {products.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProduct(p)}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden active:scale-95 transition-transform"
          >
            <div className="aspect-square bg-white/10 relative">
              <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
              <div className="absolute top-2 right-2 bg-background-dark/60 ios-blur rounded-full px-2 py-1 flex items-center gap-1 border border-white/10">
                <span className={`text-[10px] font-bold text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {p.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm truncate">{p.name}</h3>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">{p.category}</p>
            </div>
          </div>
        ))}
      </main>

      {/* QR Scanner Mock */}
      {showScanner && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8">
          <div className="relative w-full aspect-square border-2 border-primary/50 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
              <span className="material-icons-round text-primary/20 text-9xl animate-pulse">qr_code_scanner</span>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/40 animate-[bounce_2s_infinite]"></div>
          </div>
          <p className="mt-8 text-white/60 font-bold uppercase tracking-widest text-center">Aponte para o código do produto ou comanda</p>
          <button 
            onClick={() => setShowScanner(false)}
            className="mt-12 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <span className="material-icons-round text-3xl">close</span>
          </button>
        </div>
      )}

      {/* Bottom Sheet Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-sm bg-surface-dark rounded-3xl border border-primary/20 shadow-2xl overflow-hidden transform transition-all">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-6"></div>
            <div className="px-6 pb-10">
              <div className="flex gap-4 items-center mb-8">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">{selectedProduct.name}</h2>
                  <p className="text-primary font-bold">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="font-bold text-sm text-white/60">Quantidade</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center text-primary"><span className="material-icons-round">remove</span></button>
                  <span className="text-3xl font-black text-primary">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark"><span className="material-icons-round">add</span></button>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full mt-10 bg-primary text-background-dark font-black py-5 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-wider active:scale-95 transition-transform"
              >
                Confirmar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sale;
