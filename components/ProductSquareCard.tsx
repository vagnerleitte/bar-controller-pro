import React from 'react';
import { Product } from '../types';

interface ProductSquareCardProps {
  product: Product;
  onClick?: () => void;
  showStockBadges?: boolean;
}

const ProductSquareCard: React.FC<ProductSquareCardProps> = ({
  product,
  onClick,
  showStockBadges = true
}) => {
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isLowStock = (product.stock ?? 0) > 0 && (product.stock ?? 0) <= (product.minStock ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block w-full h-full rounded-2xl overflow-hidden border border-primary/30 bg-surface-dark/60 active:scale-95 transition-transform text-left"
    >
      <div className="relative w-full h-full bg-white/10">
        <img src={product.image} className="absolute inset-0 w-full h-full object-cover" alt={product.name} />
        {showStockBadges && isOutOfStock && (
          <div className="absolute left-2 top-2 bg-red-500/80 rounded px-2 py-1 z-20">
            <p className="text-[9px] font-bold uppercase">Sem estoque</p>
          </div>
        )}
        {showStockBadges && isLowStock && (
          <div className="absolute left-2 top-2 bg-orange-500/80 rounded px-2 py-1 z-20">
            <p className="text-[9px] font-bold uppercase">Baixo estoque</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="h-16 bg-gradient-to-t from-black/85 via-black/55 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 px-3 py-2 border-t border-white/20 backdrop-blur-sm bg-black/35">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-white truncate drop-shadow">{product.name}</p>
              <p className="text-sm font-extrabold text-primary whitespace-nowrap drop-shadow">R$ {product.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProductSquareCard;
