import React, { useMemo, useState } from 'react';
import { AppState, Customer, MonthlyAccount, Product } from '../types';
import { getDaysSinceCycleStart } from '../utils/monthly';

interface MonthlyDetailProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  account?: MonthlyAccount;
  customer?: Customer;
  products: Product[];
  privacyMode: boolean;
  onAddItem: (productId: string, quantity: number) => void;
  onPayment: (amount: number, method: 'PIX' | 'Dinheiro' | 'Cartão') => void;
  getBalance: (account: MonthlyAccount) => number;
  getAvailableLimit: (account: MonthlyAccount) => number;
  isBlocked: (account: MonthlyAccount) => boolean;
}

const MonthlyDetail: React.FC<MonthlyDetailProps> = ({
  navigate,
  account,
  customer,
  products,
  privacyMode,
  onAddItem,
  onPayment,
  getBalance,
  getAvailableLimit,
  isBlocked
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão'>('PIX');

  if (!account || !customer) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p>Conta mensalista não encontrada</p>
        <button onClick={() => navigate('monthly_accounts')} className="bg-primary text-black px-4 py-2 rounded">Voltar</button>
      </div>
    );
  }

  const balance = getBalance(account);
  const available = getAvailableLimit(account);
  const blocked = isBlocked(account);
  const days = getDaysSinceCycleStart(account);
  const requiredUnlock = Number((balance * 0.5).toFixed(2));

  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (blocked) {
      alert('Conta bloqueada. Faça um pagamento para desbloquear.');
      return;
    }
    const total = selectedProduct.price * quantity;
    if (total > available) {
      alert('Limite mensal excedido.');
      return;
    }
    onAddItem(selectedProductId, quantity);
  };

  const handlePayment = (amount: number) => {
    if (amount <= 0) return;
    onPayment(amount, paymentMethod);
    setPaymentAmount('');
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('monthly_accounts')} className="text-primary active:scale-90 transition-transform">
              <span className="material-icons-round text-3xl">chevron_left</span>
            </button>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">{customer.name}</h1>
              <p className="text-[10px] text-primary/60 font-medium uppercase tracking-widest">Mensalista</p>
            </div>
          </div>
          <button
            onClick={() => navigate('monthly_accounts')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Saldo</p>
            <p className={`text-xl font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {balance.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Disponível</p>
            <p className={`text-xl font-black text-primary ${privacyMode ? 'privacy-blur' : ''}`}>R$ {available.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Limite</p>
            <p className={`text-xl font-black text-white ${privacyMode ? 'privacy-blur' : ''}`}>R$ {account.limit.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Ciclo</p>
            <p className={`text-xl font-black ${blocked ? 'text-red-400' : 'text-white'}`}>{days} dias</p>
          </div>
        </section>

        {blocked && (
          <div className="bg-red-500/10 border border-red-400/30 p-4 rounded-2xl text-red-200 text-xs">
            Conta bloqueada. Pague ao menos 50% do saldo (R$ {requiredUnlock.toFixed(2)}) para desbloquear.
          </div>
        )}

        <section className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Adicionar Itens</h3>
          <div className="space-y-3">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <button
                onClick={handleAddItem}
                className="flex-1 h-12 rounded-xl font-black text-sm uppercase tracking-widest bg-primary text-background-dark"
              >
                Adicionar
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            Limite proporcional com redução fixa de 10% enquanto houver saldo aberto.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Pagamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePayment(requiredUnlock)}
              className="h-12 rounded-xl bg-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
            >
              Pagar 50%
            </button>
            <button
              onClick={() => handlePayment(balance)}
              className="h-12 rounded-xl bg-primary text-background-dark font-bold text-xs uppercase tracking-widest"
            >
              Pagar Total
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              placeholder="Pagamento parcial"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'PIX' | 'Dinheiro' | 'Cartão')}
              className="bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-sm"
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
            </select>
          </div>
          <button
            onClick={() => handlePayment(Number(paymentAmount))}
            className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest bg-white/10 text-white"
          >
            Registrar Pagamento
          </button>
        </section>

        <section className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Itens</h3>
          <div className="space-y-2">
            {account.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-bold">{product?.name || 'Item'}</p>
                    <p className="text-[10px] text-white/40 uppercase font-medium">{item.quantity} un • R$ {item.priceAtSale.toFixed(2)}</p>
                  </div>
                  <div className={`text-sm font-extrabold ${privacyMode ? 'privacy-blur' : ''}`}>
                    R$ {(item.quantity * item.priceAtSale).toFixed(2)}
                  </div>
                </div>
              );
            })}
            {account.items.length === 0 && (
              <div className="text-center text-white/40 text-sm">Nenhum item lançado.</div>
            )}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Pagamentos</h3>
          <div className="space-y-2">
            {account.payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-sm font-bold">{payment.method}</p>
                  <p className="text-[10px] text-white/40 uppercase font-medium">
                    {payment.createdAt.toLocaleDateString('pt-BR')}
                    {payment.unlockApplied ? ' • Desbloqueio' : ''}
                  </p>
                </div>
                <div className={`text-sm font-extrabold text-primary ${privacyMode ? 'privacy-blur' : ''}`}>
                  R$ {payment.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {account.payments.length === 0 && (
              <div className="text-center text-white/40 text-sm">Nenhum pagamento registrado.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MonthlyDetail;
