import React from 'react';
import { Product } from '../types';

interface ProductDetailSheetProps {
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onQuickAdd: (delta: number) => void;
  onConfirm: () => void;
}

const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
  product,
  quantity,
  onClose,
  onDecrease,
  onIncrease,
  onQuickAdd,
  onConfirm
}) => {
  if (!product) return null;
  const total = product.price * quantity;
  const quickAdds = [1, 2, 6, 12];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-background-dark/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm rounded-3xl bg-[#152a1e]/95 border border-primary/25 shadow-2xl overflow-hidden">
        <div className="w-12 h-1.5 rounded-full bg-slate-600/70 mx-auto mt-3 mb-5"></div>

        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-600/70 bg-black/15 p-3">
            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-500/60 shrink-0">
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-white truncate">{product.name}</h2>
              <p className="text-primary text-base font-black">R$ {product.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-600/70 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-3 font-bold">Quantidade</p>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onDecrease}
                className="w-11 h-11 rounded-full border border-primary/40 text-primary flex items-center justify-center"
              >
                <span className="material-icons-round">remove</span>
              </button>
              <span className="text-4xl font-black text-white leading-none">{quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                className="w-11 h-11 rounded-full bg-primary text-[#082115] flex items-center justify-center"
              >
                <span className="material-icons-round">add</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {quickAdds.map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onQuickAdd(value)}
                  className="h-10 rounded-xl border border-primary/35 bg-primary/10 text-primary font-black text-sm"
                >
                  +{value}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-500/60 bg-black/25 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest text-white/50 font-bold">Total selecionado</p>
              <p className="text-2xl font-black text-white leading-none mt-1">{quantity} itens</p>
            </div>

            <div className="mt-3 rounded-xl border border-slate-500/60 bg-black/25 px-4 py-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60 font-semibold">Unitário</span>
                <span className="text-white font-bold">R$ {product.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-white/70 font-bold">Total</span>
                <span className="text-primary font-black">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-slate-500/70 text-white font-black"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 rounded-2xl bg-primary text-[#102218] text-base font-black tracking-tight shadow-[0_10px_30px_rgba(19,236,109,0.25)] flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-[18px]">add_shopping_cart</span>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSheet;
