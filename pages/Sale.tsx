
import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Product, Order, Customer, MonthlyAccount } from '../types';
import { getMonthlyAvailableLimit, getMonthlyBalance } from '../utils/monthly';
import AppLogo from '../components/AppLogo';

interface SaleProps {
  // Fix: navigate function signature should accept optional customerId to match App.tsx definition
  navigate: (page: AppState, customerId?: string | null) => void;
  products: Product[];
  customers: Customer[];
  monthlyAccounts: MonthlyAccount[];
  privacyMode: boolean;
  activeOrders: Order[];
  setActiveOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  selectedProductId: string | null;
  clearSelectedProduct: () => void;
}

const Sale: React.FC<SaleProps> = ({
  navigate,
  products,
  customers,
  monthlyAccounts,
  privacyMode,
  activeOrders,
  setActiveOrders,
  setProducts,
  selectedProductId,
  clearSelectedProduct
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number; priceAtSale: number }[]>([]);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showImmediatePayment, setShowImmediatePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão'>('PIX');
  const [immediatePaymentAmount, setImmediatePaymentAmount] = useState('');
  const [immediatePayments, setImmediatePayments] = useState<{ method: 'PIX' | 'Dinheiro' | 'Cartão'; amount: number }[]>([]);
  const [cashReceived, setCashReceived] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) setSelectedProduct(product);
      clearSelectedProduct();
    }
  }, [selectedProductId, products, clearSelectedProduct]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    const activeProducts = products.filter(p => p.status !== 'inactive');
    if (!term) return activeProducts;
    return activeProducts.filter(p =>
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.priceAtSale * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAdd = () => {
    if (!selectedProduct) return;
    if (selectedProduct.status === 'inactive') {
      setToast('Produto inativo.');
      return;
    }
    if ((selectedProduct.stock ?? 0) <= 0) {
      setToast('Sem estoque.');
      return;
    }
    if (quantity > (selectedProduct.stock ?? 0)) {
      setToast('Quantidade acima do estoque disponível.');
      return;
    }
    setCartItems(prev => [...prev, { productId: selectedProduct.id, quantity, priceAtSale: selectedProduct.price }]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const hasStockForCart = (items: { productId: string; quantity: number }[]) => {
    const byProduct = new Map<string, number>();
    items.forEach(item => {
      byProduct.set(item.productId, (byProduct.get(item.productId) || 0) + item.quantity);
    });
    for (const [productId, qty] of byProduct.entries()) {
      const product = products.find(p => p.id === productId);
      if (!product || product.status === 'inactive') {
        setToast('Produto inativo ou inválido no carrinho.');
        return false;
      }
      if ((product.stock ?? 0) < qty) {
        setToast(`Sem estoque para ${product.name}.`);
        return false;
      }
    }
    return true;
  };

  const decrementStockForCart = () => {
    setProducts(prev => prev.map(product => {
      const totalQty = cartItems
        .filter(item => item.productId === product.id)
        .reduce((acc, item) => acc + item.quantity, 0);
      if (totalQty <= 0 || typeof product.stock !== 'number') return product;
      return {
        ...product,
        stock: Math.max(0, product.stock - totalQty),
        updatedAt: Date.now()
      };
    }));
  };

  const handleSelectCustomer = (customerId: string) => {
    if (!hasStockForCart(cartItems)) return;
    const account = monthlyAccounts.find(a => a.customerId === customerId);
    const balance = account ? getMonthlyBalance(account) : 0;
    const available = account ? getMonthlyAvailableLimit(account) : Number.POSITIVE_INFINITY;
    const exceedsLimit = account ? cartTotal > available : false;

    setShowCustomerPicker(false);
    setCustomerSearch('');

    if (balance > 0 || available <= 0 || exceedsLimit) {
      setImmediatePayments([]);
      setImmediatePaymentAmount(cartTotal.toFixed(2));
      setPaymentMethod('PIX');
      setCashReceived('');
      setPendingCustomerId(customerId);
      setShowImmediatePayment(true);
      return;
    }

    setActiveOrders(prev => {
      const existingIndex = prev.findIndex(o => o.customerId === customerId && o.status === 'open');
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          items: [...updated[existingIndex].items, ...cartItems],
          updatedAt: Date.now()
        };
        return updated;
      }
      const newOrder: Order = {
        id: `o_${Date.now()}`,
        customerId,
        location: 'Mesa',
        table: String(Math.floor(Math.random() * 30) + 1).padStart(2, '0'),
        status: 'open',
        items: [...cartItems],
        payments: [],
        createdAt: new Date(),
        updatedAt: Date.now()
      };
      return [...prev, newOrder];
    });

    decrementStockForCart();
    setCartItems([]);
    navigate('customer_detail', customerId);
  };

  const handleImmediatePayment = () => {
    if (!pendingCustomerId) return;
    if (!hasStockForCart(cartItems)) return;
    const total = Number(cartTotal.toFixed(2));
    const totalPaid = immediatePayments.reduce((acc, payment) => acc + payment.amount, 0);
    if (totalPaid < total) {
      setToast(`Falta R$ ${(total - totalPaid).toFixed(2)} para concluir.`);
      return;
    }
    const now = Date.now();
    const quickOrder: Order = {
      id: `o_${now}`,
      customerId: pendingCustomerId,
      location: 'Balcão',
      table: String(Math.floor(Math.random() * 30) + 1).padStart(2, '0'),
      status: 'closed',
      isQuickSale: true,
      items: [...cartItems],
      payments: immediatePayments.map((payment, idx) => ({
        id: `p_${now}_${idx}`,
        method: payment.method,
        amount: payment.amount,
        createdAt: new Date()
      })),
      createdAt: new Date(),
      updatedAt: now
    };
    setActiveOrders(prev => [...prev, quickOrder]);
    decrementStockForCart();
    setShowImmediatePayment(false);
    setImmediatePaymentAmount('');
    setImmediatePayments([]);
    setCashReceived('');
    setCartItems([]);
    setPendingCustomerId(null);
    setToast('Venda avulsa registrada.');
    navigate('home');
  };

  const handleContinueWalkIn = () => {
    if (!hasStockForCart(cartItems)) return;
    setImmediatePayments([]);
    setImmediatePaymentAmount(cartTotal.toFixed(2));
    setPaymentMethod('PIX');
    setCashReceived('');
    setPendingCustomerId('walkin');
    setShowImmediatePayment(true);
  };

  const immediatePaymentTotal = Number(cartTotal.toFixed(2));
  const immediatePaidTotal = immediatePayments.reduce((acc, payment) => acc + payment.amount, 0);
  const immediateRemaining = Math.max(0, Number((immediatePaymentTotal - immediatePaidTotal).toFixed(2)));
  const amountBeingPaidNow = Number(immediatePaymentAmount.replace(',', '.')) || 0;
  const cashReceivedValue = Number(cashReceived.replace(',', '.')) || 0;
  const cashDelta = cashReceivedValue - amountBeingPaidNow;

  const handleAddImmediatePayment = () => {
    const amount = Number(immediatePaymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setToast('Informe um valor de pagamento.');
      return;
    }
    if (amount > immediateRemaining) {
      setToast(`Valor acima do faltante (R$ ${immediateRemaining.toFixed(2)}).`);
      return;
    }
    setImmediatePayments(prev => [...prev, { method: paymentMethod, amount }]);
    const nextRemaining = Math.max(0, Number((immediateRemaining - amount).toFixed(2)));
    setImmediatePaymentAmount(nextRemaining > 0 ? nextRemaining.toFixed(2) : '');
    setCashReceived('');
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      <header className="safe-area-top sticky top-0 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate('home')} className="text-primary active:scale-90 transition-transform">
            <span className="material-icons-round text-3xl">chevron_left</span>
          </button>
          <div className="flex items-center gap-3">
            <AppLogo className="w-8 h-8" />
            <h1 className="text-lg font-extrabold tracking-tight">Nova Venda</h1>
          </div>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 pb-48">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProduct(p)}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden active:scale-95 transition-transform flex flex-col"
          >
            <div className="aspect-square bg-white/10 relative shrink-0">
              <img src={p.image} className="w-full h-full object-cover relative z-0" alt={p.name} />
              <div className="absolute top-2 right-2 bg-background-dark/60 ios-blur rounded-full px-2 py-1 flex items-center gap-1 border border-white/10 z-20">
                <span className="text-[10px] font-bold text-white">R$ {p.price.toFixed(2)}</span>
              </div>
              {(p.stock ?? 0) <= 0 && (
                <div className="absolute left-2 top-2 bg-red-500/80 rounded px-2 py-1 z-20">
                  <p className="text-[9px] font-bold uppercase">Sem estoque</p>
                </div>
              )}
              {(p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.minStock ?? 0) && (
                <div className="absolute left-2 top-2 bg-orange-500/80 rounded px-2 py-1 z-20">
                  <p className="text-[9px] font-bold uppercase">Baixo estoque</p>
                </div>
              )}
              <div className="absolute left-2 right-2 bottom-2 bg-black/70 rounded-lg px-2 py-1 z-20">
                <p className="text-xs font-bold text-white truncate">{p.name}</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="bg-background-dark/70 border border-white/10 rounded-lg px-2 py-1">
                <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
              </div>
              <p className="text-[10px] text-primary font-bold">R$ {p.price.toFixed(2)}</p>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{p.category}</p>
              <p className="text-[10px] text-white/40 uppercase font-medium">Estoque: {p.stock ?? 0}</p>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-2 text-center text-white/40 text-sm py-6">
            Nenhum produto encontrado.
          </div>
        )}
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
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-background-dark/90 backdrop-blur-2xl border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Itens no carrinho</p>
              <p className="text-sm font-bold">{cartCount} itens</p>
            </div>
            <div className="text-lg font-extrabold">R$ {cartTotal.toFixed(2)}</div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {cartItems.map((item, idx) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={`${item.productId}-${idx}`} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-bold">{product?.name || 'Item'}</p>
                    <p className="text-[10px] text-white/40 uppercase font-medium">{item.quantity} un • R$ {item.priceAtSale.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setCartItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-white/40 text-xs uppercase tracking-widest"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowCustomerPicker(true)}
              className="h-14 rounded-2xl bg-primary text-background-dark font-black text-sm uppercase tracking-widest"
            >
              Selecionar cliente
            </button>
            <button
              onClick={handleContinueWalkIn}
              className="h-14 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-sm uppercase tracking-widest"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {showCustomerPicker && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">Selecionar Cliente</h3>
              <button
                onClick={() => setShowCustomerPicker(false)}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {customers
                .filter(c =>
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.phone.toLowerCase().includes(customerSearch.toLowerCase())
                )
                .map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer.id)}
                  className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 text-left"
                >
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{customer.name}</p>
                    <p className={`text-[10px] text-white/40 uppercase font-medium ${privacyMode ? 'privacy-blur' : ''}`}>
                      {customer.phone}
                    </p>
                  </div>
                  <span className="material-icons-round text-primary">chevron_right</span>
                </button>
              ))}
              {customers.filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.toLowerCase().includes(customerSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center text-white/40 text-sm">Nenhum cliente cadastrado.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showImmediatePayment && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">Pagamento Avulso</h3>
              <button
                onClick={() => {
                  setShowImmediatePayment(false);
                  setImmediatePaymentAmount('');
                  setImmediatePayments([]);
                  setPendingCustomerId(null);
                  setCashReceived('');
                }}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <p className="text-xs text-white/60 mb-4">
              {pendingCustomerId === 'walkin'
                ? 'Venda avulsa sem identificação. Pagamento no ato.'
                : 'Cliente com limite estourado ou débito mensalista. Esta venda deve ser paga no ato.'}
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest text-white/40">Total</span>
              <span className="text-xl font-extrabold">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest text-white/40">Faltante</span>
              <span className="text-lg font-extrabold text-orange-300">R$ {immediateRemaining.toFixed(2)}</span>
            </div>
            {immediatePayments.length > 0 && (
              <div className="mb-4 max-h-28 overflow-y-auto space-y-2">
                {immediatePayments.map((payment, idx) => (
                  <div key={`${payment.method}-${idx}`} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold">{payment.method}</span>
                    <span className="text-xs font-bold text-primary">R$ {payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value as 'PIX' | 'Dinheiro' | 'Cartão');
                setCashReceived('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm mb-4"
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={immediatePaymentAmount}
              onChange={(e) => setImmediatePaymentAmount(e.target.value)}
              placeholder="Valor desta parcela"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm mb-4"
            />
            {paymentMethod === 'Dinheiro' && (
              <div className="mb-4 space-y-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Valor recebido"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                />
                {cashReceived.trim().length > 0 && amountBeingPaidNow > 0 && (
                  <p className={`text-xs font-bold ${cashDelta < 0 ? 'text-orange-300' : 'text-primary'}`}>
                    {cashDelta < 0
                      ? `Falta R$ ${Math.abs(cashDelta).toFixed(2)}`
                      : `Troco R$ ${cashDelta.toFixed(2)}`}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddImmediatePayment}
                disabled={immediateRemaining <= 0}
                className={`h-12 rounded-xl font-black text-xs uppercase tracking-widest ${
                  immediateRemaining > 0
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
              >
                Adicionar pagamento
              </button>
              <button
                onClick={handleImmediatePayment}
                disabled={immediateRemaining > 0}
                className={`h-12 rounded-xl font-black text-xs uppercase tracking-widest ${
                  immediateRemaining === 0
                    ? 'bg-primary text-background-dark'
                    : 'bg-primary/40 text-background-dark/60'
                }`}
              >
                Concluir venda
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[240] bg-black/80 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold">
          {toast}
          <button className="ml-3 text-primary" onClick={() => setToast(null)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default Sale;
