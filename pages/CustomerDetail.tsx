
import React, { useMemo, useState } from 'react';
import { AppState, Order, Customer, Product, UserRole } from '../types';
import AppLogo from '../components/AppLogo';
import { FormButton, FormInput, FormLabel, FormSelect } from '../components/form';

interface CustomerDetailProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  customer?: Customer;
  order?: Order;
  products: Product[];
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
  onAddItem: (productId: string) => boolean;
  onRemoveItem: (itemIndex: number) => boolean;
  onAddPayment: (amount: number, method: 'PIX' | 'Dinheiro' | 'Cartão') => void;
  onRemoveLastPayment: () => boolean;
  onCloseOrder: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  navigate,
  customer,
  order,
  products,
  privacyMode,
  setPrivacyMode,
  currentUserRole,
  onAddItem,
  onRemoveItem,
  onAddPayment,
  onRemoveLastPayment,
  onCloseOrder
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [installments, setInstallments] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão'>('PIX');
  const [cashReceived, setCashReceived] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!customer || !order) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p>Comanda não encontrada</p>
        <button onClick={() => navigate('home')} className="bg-primary text-black px-4 py-2 rounded">Voltar</button>
      </div>
    );
  }

  const consumption = order.items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
  const paid = order.payments.reduce((acc, p) => acc + p.amount, 0);
  const balance = consumption - paid;
  const isSettled = balance <= 0;

  const suggestedProducts = useMemo(() => {
    const quantityByProductId = new Map<string, number>();
    order.items.forEach(item => {
      quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) || 0) + item.quantity);
    });

    const ranked = Array.from(quantityByProductId.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([productId]) => products.find(product => product.id === productId))
      .filter(Boolean) as Product[];

    if (ranked.length > 0) return ranked;

    return products
      .filter(product => product.status !== 'inactive')
      .filter(product => product.category.toLowerCase().includes('drink') || product.category.toLowerCase().includes('bebida'))
      .slice(0, 3);
  }, [order.items, products]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return [];
    return products
      .filter(product => product.status !== 'inactive')
      .filter(product => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term))
      .slice(0, 8);
  }, [productSearch, products]);

  const handleAddProduct = (productId: string) => {
    const ok = onAddItem(productId);
    if (!ok) {
      setToast('Sem estoque ou produto inativo.');
      return;
    }
    setProductSearch('');
  };

  const handleConfirmPayment = () => {
    const amount = Number(paymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) return;
    if (amount > balance) {
      setToast(`Valor acima do saldo (R$ ${balance.toFixed(2)}).`);
      return;
    }
    const remainingAfter = Math.max(0, Number((balance - amount).toFixed(2)));
    onAddPayment(amount, paymentMethod);
    setPaymentAmount(remainingAfter > 0 ? remainingAfter.toFixed(2) : '');
    setCashReceived('');
    if (remainingAfter <= 0) {
      setShowPaymentModal(false);
      onCloseOrder();
      return;
    }
    setToast(`Faltam R$ ${remainingAfter.toFixed(2)} para quitar.`);
  };

  const handleOpenPaymentModal = () => {
    setInstallments(1);
    setPaymentAmount(balance > 0 ? balance.toFixed(2) : '');
    setCashReceived('');
    setShowPaymentModal(true);
  };

  const handleInstallmentsChange = (value: number) => {
    setInstallments(value);
    if (balance > 0) {
      setPaymentAmount((balance / value).toFixed(2));
    }
  };

  const paymentValue = Number(paymentAmount.replace(',', '.')) || 0;
  const cashReceivedValue = Number(cashReceived.replace(',', '.')) || 0;
  const cashDelta = cashReceivedValue - paymentValue;
  
  const handleRemoveItem = (index: number) => {
    const confirmed = confirm('Remover este item da comanda?');
    if (!confirmed) return;
    const ok = onRemoveItem(index);
    if (ok) setToast('Item removido.');
  };

  const handleRemoveLastPayment = () => {
    const ok = onRemoveLastPayment();
    if (ok) setToast('Pagamento removido.');
  };

  return (
    <div className="pb-72">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('home')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 active:scale-90 transition-transform">
              <span className="material-icons-round text-xl">arrow_back_ios_new</span>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <AppLogo className="w-8 h-8" />
                <h1 className="text-lg font-extrabold">{customer.name}</h1>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Comanda Aberta</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/10"
          >
            <span className="material-icons-round">{privacyMode ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </header>

      <main className="p-5 space-y-8">
        {/* Dash Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Consumo</p>
            <p className={`text-sm font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {consumption.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Pago</p>
            <p className={`text-sm font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {paid.toFixed(2)}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl shadow-lg shadow-primary/5">
            <p className="text-[8px] font-extrabold text-primary uppercase tracking-[0.2em] mb-1">Saldo</p>
            <p className={`text-sm font-black text-primary ${privacyMode ? 'privacy-blur' : ''}`}>R$ {balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Consumption List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Consumo (Vendas)</h2>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-bold text-white/40">{order.items.length} Pedidos</span>
          </div>
          
          <div className="space-y-3">
            {order.items.map((item, idx) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <span className="material-icons-round text-primary/60">{product?.category === 'Drinks' ? 'sports_bar' : 'restaurant'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product?.name || 'Item desconhecido'}</p>
                      <p className="text-[10px] text-white/30 uppercase font-medium">{item.quantity} un • R$ {item.priceAtSale.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="font-extrabold text-sm">
                    R$ {(item.quantity * item.priceAtSale).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="ml-3 text-[10px] uppercase tracking-widest text-red-300"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Atalhos sugeridos</h2>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Recorrentes</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {suggestedProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product.id)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-left active:scale-95 transition-transform"
              >
                <p className="text-xs font-bold truncate">{product.name}</p>
                <p className="text-[10px] text-white/40 uppercase mt-1">{product.category}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 px-1">Buscar produto para adicionar</h2>
          <div className="relative">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
            <FormInput
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="pl-12 pr-4"
            />
          </div>
          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product.id)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-bold">{product.name}</p>
                    <p className="text-[10px] text-white/40 uppercase">{product.category}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">Adicionar</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Payments Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Pagamentos</h2>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest italic">Parcial</span>
          </div>

          <div className="space-y-3">
            {order.payments.map((payment, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-primary shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-icons-round">qr_code_2</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{payment.method}</p>
                    <p className="text-[10px] text-white/30 uppercase font-medium">Hoje, {payment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={`font-black text-sm text-primary ${privacyMode ? 'privacy-blur' : ''}`}>
                  R$ {payment.amount.toFixed(2)}
                </div>
              </div>
            ))}
            
            {order.payments.length === 0 && (
              <div className="text-center text-[11px] text-white/40">Nenhum pagamento registrado ainda.</div>
            )}
            {currentUserRole === 'admin' && order.payments.length > 0 && (
              <button
                onClick={handleRemoveLastPayment}
                className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-red-300 text-xs font-bold uppercase tracking-widest"
              >
                Remover último pagamento
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background-dark/80 backdrop-blur-2xl border-t border-white/5 safe-area-bottom z-[100]">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Saldo Restante</span>
          <div className={`text-xl font-black text-orange-500 ${privacyMode ? 'privacy-blur' : ''}`}>
            R$ {balance.toFixed(2)}
          </div>
        </div>
        
        {!isSettled ? (
          <button
            onClick={handleOpenPaymentModal}
            className="w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all bg-primary text-background-dark shadow-xl shadow-primary/20"
          >
            <span className="material-icons-round">payments</span>
            PAGAMENTOS
          </button>
        ) : (
          <button
            onClick={onCloseOrder}
            className="w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all bg-primary text-background-dark shadow-xl shadow-primary/20"
          >
            <span className="material-icons-round">lock_open</span>
            FECHAR COMANDA
          </button>
        )}
        <p className="text-center text-[8px] text-white/20 mt-4 uppercase tracking-[0.3em] font-bold">
          {!isSettled ? 'Registre pagamentos para liberar fechamento' : 'Saldo quitado, comanda pronta para encerrar'}
        </p>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">Adicionar Pagamento</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <FormInput
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="Valor pago"
              className="mb-4"
            />
            <div className="mb-4">
              <FormLabel className="text-[11px] text-white/50 mb-2">
                Dividir em X vezes
              </FormLabel>
              <FormSelect
                value={installments}
                onChange={(event) => handleInstallmentsChange(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(option => (
                  <option key={option} value={option}>
                    {option}x
                  </option>
                ))}
              </FormSelect>
            </div>
            <FormSelect
              value={paymentMethod}
              onChange={(event) => {
                setPaymentMethod(event.target.value as 'PIX' | 'Dinheiro' | 'Cartão');
                setCashReceived('');
              }}
              className="mb-4"
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
            </FormSelect>
            {paymentMethod === 'Dinheiro' && (
              <div className="mb-4 space-y-2">
                <FormInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder="Valor recebido"
                />
                {cashReceived.trim().length > 0 && paymentValue > 0 && (
                  <p className={`text-xs font-bold ${cashDelta < 0 ? 'text-orange-300' : 'text-primary'}`}>
                    {cashDelta < 0
                      ? `Falta R$ ${Math.abs(cashDelta).toFixed(2)}`
                      : `Troco R$ ${cashDelta.toFixed(2)}`}
                  </p>
                )}
              </div>
            )}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Saldo Devedor</span>
              <span className="text-base font-black text-orange-400">
                R$ {balance.toFixed(2)}
              </span>
            </div>
            {installments > 1 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
                <span className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Valor Da Parcela</span>
                <span className="text-base font-black text-primary">
                  R$ {(balance / installments).toFixed(2)}
                </span>
              </div>
            )}
            <FormButton
              onClick={handleConfirmPayment}
              disabled={paymentValue <= 0}
              className={`w-full h-12 font-black text-sm uppercase tracking-widest ${
                paymentValue > 0
                  ? ''
                  : 'bg-white/5 text-white/30 border border-white/10'
              }`}
            >
              Adicionar pagamento
            </FormButton>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[240] bg-black/80 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold">
          {toast}
          <button className="ml-3 text-primary" onClick={() => setToast(null)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
