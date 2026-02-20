
import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Product, User, UserRole } from '../types';
import BottomNav from '../components/BottomNav';
import MainTopBar from '../components/MainTopBar';
import { FormInput, FormLabel, FormSelect } from '../components/form';

interface InventoryProps {
  // Fix: navigate function signature should accept optional customerId for consistency
  navigate: (page: AppState, customerId?: string | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onRegisterAdjustment: (input: { productId: string; delta: number; reason: 'IN' | 'LOSS'; note?: string }) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  currentUserRole?: UserRole | null;
  currentUser: User | null;
  onForceSeedSync: () => Promise<void>;
}

const Inventory: React.FC<InventoryProps> = ({ navigate, products, setProducts, onRegisterAdjustment, privacyMode, setPrivacyMode, currentUserRole, currentUser, onForceSeedSync }) => {
  const PAGE_SIZE = 12;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [stockFilter, setStockFilter] = useState<'all' | 'ok' | 'low' | 'zero'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustReason, setAdjustReason] = useState<'IN' | 'LOSS'>('IN');
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState('1');
  const [adjustNote, setAdjustNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryForSubcategory, setCategoryForSubcategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({});
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    unit: 'un',
    location: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    idealStock: '',
    status: 'active' as 'active' | 'inactive'
  });

  const categories = useMemo(() => {
    const fromProducts = products.map(product => product.category);
    const all = Array.from(new Set([...fromProducts, ...customCategories])).filter(Boolean);
    return ['Todos', ...all];
  }, [products, customCategories]);

  const subcategoriesByCategory = useMemo(() => {
    const map: Record<string, string[]> = { ...customSubcategories };
    products.forEach(product => {
      const subcategory = product.subcategory || product.subgroup;
      if (!subcategory) return;
      const category = product.category;
      if (!map[category]) map[category] = [];
      if (!map[category].includes(subcategory)) {
        map[category] = [...map[category], subcategory];
      }
    });
    return map;
  }, [products, customSubcategories]);

  const getStock = (product: Product) => product.stock ?? 0;
  const getMinStock = (product: Product) => product.minStock ?? 0;

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter(product => {
      const matchSearch = term.length === 0
        || product.name.toLowerCase().includes(term)
        || product.sku.toLowerCase().includes(term);
      const matchCategory = categoryFilter === 'Todos' || product.category === categoryFilter;

      const stock = getStock(product);
      const minStock = getMinStock(product);
      const matchStock =
        stockFilter === 'all'
        || (stockFilter === 'zero' && stock <= 0)
        || (stockFilter === 'low' && stock > 0 && stock <= minStock)
        || (stockFilter === 'ok' && stock > minStock);
      const matchStatus = statusFilter === 'all' || product.status === statusFilter;

      return matchSearch && matchCategory && matchStock && matchStatus;
    });
  }, [products, search, categoryFilter, stockFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const lowStockCount = useMemo(() => {
    return products.filter(product => {
      const stock = getStock(product);
      const minStock = getMinStock(product);
      return stock > 0 && stock <= minStock;
    }).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(product => getStock(product) <= 0).length;
  }, [products]);

  const updateStock = (productId: string, delta: number) => {
    setProducts(previous =>
      previous.map(product => {
        if (product.id !== productId) return product;
        const currentStock = getStock(product);
        return {
          ...product,
          stock: Math.max(0, currentStock + delta),
          updatedAt: Date.now()
        };
      })
    );
  };

  useEffect(() => {
    try {
      const rawCategories = localStorage.getItem('inventory_custom_categories');
      const rawSubcategories = localStorage.getItem('inventory_custom_subcategories');
      if (rawCategories) {
        const parsed = JSON.parse(rawCategories) as string[];
        if (Array.isArray(parsed)) setCustomCategories(parsed);
      }
      if (rawSubcategories) {
        const parsed = JSON.parse(rawSubcategories) as Record<string, string[]>;
        if (parsed && typeof parsed === 'object') setCustomSubcategories(parsed);
      }
    } catch {
      setCustomCategories([]);
      setCustomSubcategories({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem('inventory_custom_subcategories', JSON.stringify(customSubcategories));
  }, [customSubcategories]);

  const activeProduct = useMemo(() => {
    if (!editingProductId) return null;
    return products.find(product => product.id === editingProductId) || null;
  }, [editingProductId, products]);

  const availableSubcategories = useMemo(() => {
    return productForm.category ? (subcategoriesByCategory[productForm.category] || []) : [];
  }, [productForm.category, subcategoriesByCategory]);

  const openCreateProduct = () => {
    const firstCategory = categories.find(category => category !== 'Todos') || '';
    setEditingProductId(null);
    setProductForm({
      name: '',
      sku: '',
      category: firstCategory,
      subcategory: '',
      unit: 'un',
      location: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      idealStock: '',
      status: 'active'
    });
    setShowProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      subcategory: product.subcategory || product.subgroup || '',
      unit: product.unit || 'un',
      location: product.location || '',
      price: String(product.price),
      cost: String(product.cost || ''),
      stock: String(product.stock ?? 0),
      minStock: String(product.minStock ?? 0),
      idealStock: String(product.idealStock ?? 0),
      status: product.status === 'inactive' ? 'inactive' : 'active'
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim() || !productForm.sku.trim() || !productForm.category.trim() || !productForm.price.trim()) {
      setToast('Preencha nome, SKU, categoria e preço.');
      return;
    }

    const now = Date.now();
    const payload: Product = {
      id: editingProductId || `p_${now}`,
      name: productForm.name.trim(),
      sku: productForm.sku.trim().toUpperCase(),
      category: productForm.category,
      subcategory: productForm.subcategory.trim() || undefined,
      subgroup: productForm.subcategory.trim() || undefined,
      unit: productForm.unit as Product['unit'],
      location: productForm.location.trim() || undefined,
      price: Number(productForm.price) || 0,
      cost: Number(productForm.cost) || 0,
      stock: Number(productForm.stock) || 0,
      minStock: Number(productForm.minStock) || 0,
      idealStock: Number(productForm.idealStock) || 0,
      status: productForm.status,
      image: activeProduct?.image || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
      createdAt: activeProduct?.createdAt || now,
      updatedAt: now
    };

    setProducts(previous => {
      if (!editingProductId) return [...previous, payload];
      return previous.map(product => (product.id === editingProductId ? payload : product));
    });
    setShowProductModal(false);
  };

  const handleToggleProductStatus = () => {
    if (!activeProduct) return;
    setProducts(previous =>
      previous.map(product => {
        if (product.id !== activeProduct.id) return product;
        return {
          ...product,
          status: product.status === 'inactive' ? 'active' : 'inactive',
          updatedAt: Date.now()
        };
      })
    );
    setShowProductModal(false);
  };

  const handleCreateCategory = () => {
    const category = newCategoryName.trim();
    if (!category) return;
    if (!customCategories.includes(category) && !categories.includes(category)) {
      setCustomCategories(previous => [...previous, category]);
    }
    setCategoryForSubcategory(category);
    setNewCategoryName('');
  };

  const handleCreateSubcategory = () => {
    const category = categoryForSubcategory.trim();
    const subcategory = newSubcategoryName.trim();
    if (!category || !subcategory) return;
    setCustomSubcategories(previous => {
      const current = previous[category] || [];
      if (current.includes(subcategory)) return previous;
      return {
        ...previous,
        [category]: [...current, subcategory]
      };
    });
    setNewSubcategoryName('');
  };

  const openAdjustment = (reason: 'IN' | 'LOSS') => {
    setAdjustReason(reason);
    setAdjustProductId(products[0]?.id || '');
    setAdjustQty('1');
    setAdjustNote('');
    setShowAdjustModal(true);
  };

  const applyAdjustment = () => {
    const quantity = Number(adjustQty);
    if (!adjustProductId || !Number.isInteger(quantity) || quantity <= 0) {
      setToast('Informe produto e quantidade inteira.');
      return;
    }
    setProducts(previous =>
      previous.map(product => {
        if (product.id !== adjustProductId) return product;
        const currentStock = product.stock ?? 0;
        const nextStock = adjustReason === 'IN'
          ? currentStock + quantity
          : Math.max(0, currentStock - quantity);
        return {
          ...product,
          stock: nextStock,
          updatedAt: Date.now()
        };
      })
    );
    onRegisterAdjustment({
      productId: adjustProductId,
      delta: adjustReason === 'IN' ? quantity : -quantity,
      reason: adjustReason,
      note: adjustNote.trim() || undefined
    });
    setToast(adjustReason === 'IN' ? 'Entrada registrada.' : 'Perda/quebra registrada.');
    setShowAdjustModal(false);
    setAdjustNote('');
  };

  const toggleExpandedProduct = (productId: string) => {
    setExpandedProductIds(previous => ({
      ...previous,
      [productId]: !previous[productId]
    }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter, statusFilter, viewMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="pb-32">
      <MainTopBar
        navigate={navigate}
        privacyMode={privacyMode}
        setPrivacyMode={setPrivacyMode}
        currentUser={currentUser}
        onForceSeedSync={onForceSeedSync}
      />
      <div>
        <div className="px-5 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80">Local Storage Active</span>
            </div>
            <div className="flex items-center justify-end gap-2">
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={openCreateProduct}
              className="h-10 px-4 shrink-0 flex items-center justify-center rounded-full bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest gap-1 shadow-lg shadow-primary/20"
            >
              <span className="material-icons-round text-[16px]">add</span>
              Novo produto
            </button>
            <button
              onClick={() => openAdjustment('IN')}
              className="h-10 px-4 shrink-0 flex items-center justify-center rounded-full bg-white/5 text-white border border-white/10 text-[10px] font-bold uppercase tracking-wide"
            >
              Entrada
            </button>
            <button
              onClick={() => openAdjustment('LOSS')}
              className="h-10 px-4 shrink-0 flex items-center justify-center rounded-full bg-white/5 text-red-300 border border-white/10 text-[10px] font-bold uppercase tracking-wide"
            >
              Perda
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`h-10 px-4 shrink-0 flex items-center justify-center rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                viewMode === 'cards'
                  ? 'bg-primary text-background-dark border-primary'
                  : 'bg-white/5 text-white border-white/10'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-10 px-4 shrink-0 flex items-center justify-center rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                viewMode === 'list'
                  ? 'bg-primary text-background-dark border-primary'
                  : 'bg-white/5 text-white border-white/10'
              }`}
            >
              Lista corrida
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="h-10 px-4 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25 text-[10px] font-bold uppercase tracking-widest gap-1"
            >
              <span className="material-icons-round text-[16px]">category</span>
              Categorias
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStockFilter('low')}
              className={`text-left rounded-xl px-3 py-2 border transition-colors ${
                stockFilter === 'low' ? 'bg-orange-500/15 border-orange-400/40' : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Baixo estoque</p>
              <p className="text-lg font-black text-orange-400">{lowStockCount}</p>
            </button>
            <button
              onClick={() => setStockFilter('zero')}
              className={`text-left rounded-xl px-3 py-2 border transition-colors ${
                stockFilter === 'zero' ? 'bg-red-500/15 border-red-400/40' : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Sem estoque</p>
              <p className="text-lg font-black text-red-400">{outOfStockCount}</p>
            </button>
          </div>
          
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary">search</span>
            <FormInput 
              type="text" 
              placeholder="Buscar produtos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            <FormSelect
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[11px] font-bold text-white/80"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'Todos' ? 'Categoria: Todos' : category}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as 'all' | 'ok' | 'low' | 'zero')}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[11px] font-bold text-white/80"
            >
              <option value="all">Estoque: Todos</option>
              <option value="ok">Estoque OK</option>
              <option value="low">Estoque baixo</option>
              <option value="zero">Sem estoque</option>
            </FormSelect>

            <FormSelect
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[11px] font-bold text-white/80"
            >
              <option value="all">Status: Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </FormSelect>
          </div>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {viewMode === 'cards' ? paginatedProducts.map(product => (
          <div
            key={product.id}
            className={`bg-white/5 border border-white/10 rounded-2xl p-4 transition-all shadow-lg ${
              product.status === 'inactive' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 shrink-0 overflow-visible">
                <div className="absolute -top-3 left-[20px] z-10">
                  <span className="px-2 py-0.5 rounded-full bg-[#011b12] border border-primary text-[10px] font-black uppercase text-primary shadow-[0_6px_14px_rgba(1,27,18,0.65)]">
                    {product.unit || 'un'}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base leading-tight truncate">{product.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Qtd</span>
                  <span className={`text-xl font-black leading-none ${
                    getStock(product) <= 0
                      ? 'text-red-400'
                      : getStock(product) <= getMinStock(product)
                        ? 'text-orange-400'
                        : 'text-white'
                  }`}>
                    {getStock(product)}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Preço</p>
                <p className="text-base font-extrabold text-primary">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                onClick={() => toggleExpandedProduct(product.id)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center justify-center shrink-0"
                title={expandedProductIds[product.id] ? 'Recolher' : 'Expandir'}
              >
                <span className="material-icons-round text-[18px]">
                  {expandedProductIds[product.id] ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {expandedProductIds[product.id] && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold text-white/60 uppercase">SKU: {product.sku}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold text-white/60 uppercase">{product.category}</span>
                  {(product.subcategory || product.subgroup) && (
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-[8px] font-bold text-primary uppercase">
                      {product.subcategory || product.subgroup}
                    </span>
                  )}
                  {product.location && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold text-white/60 uppercase">{product.location}</span>
                  )}
                  {product.status === 'inactive' && (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-[8px] font-bold text-red-300 uppercase">Inativo</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Estoque atual</p>
                    <p className={`text-xl font-black ${
                      getStock(product) <= 0
                        ? 'text-red-400'
                        : getStock(product) <= getMinStock(product)
                          ? 'text-orange-400'
                          : 'text-white'
                    }`}>
                      {getStock(product)} {product.unit || 'un'}
                    </p>
                    <p className="text-[10px] text-white/40 uppercase">
                      Min: {getMinStock(product)} {product.unit || 'un'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStock(product.id, -1)}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white"
                      disabled={product.status === 'inactive'}
                    >
                      <span className="material-icons-round">remove</span>
                    </button>
                    <button
                      onClick={() => updateStock(product.id, 1)}
                      className="w-10 h-10 rounded-full bg-primary text-background-dark"
                      disabled={product.status === 'inactive'}
                    >
                      <span className="material-icons-round">add</span>
                    </button>
                    <button
                      onClick={() => openEditProduct(product)}
                      className="h-10 px-3 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="inventory-list bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="inventory-list-head grid grid-cols-[1fr_2fr_1fr_1fr_1.4fr_auto] gap-2 px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/50">
              <span>SKU</span>
              <span>Nome</span>
              <span>Custo</span>
              <span>Venda</span>
              <span>Categoria</span>
              <span>Ação</span>
            </div>
            {paginatedProducts.map(product => (
              <div
                key={product.id}
                className={`inventory-list-row grid grid-cols-[1fr_2fr_1fr_1fr_1.4fr_auto] gap-2 px-3 py-2 border-b border-white/5 items-center text-xs ${
                  product.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <span className="inventory-list-cell font-bold text-white/80 truncate">{product.sku}</span>
                <span className="inventory-list-cell font-semibold text-white truncate">{product.name}</span>
                <span className="inventory-list-cell text-white/80">R$ {(product.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="inventory-list-price font-bold text-primary">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="inventory-list-cell text-white/80 truncate">{product.category}</span>
                <button
                  onClick={() => openEditProduct(product)}
                  className="inventory-list-edit h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wide"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
        {filteredProducts.length === 0 && (
          <div className="text-center text-white/40 text-sm py-8">Nenhum item encontrado para esse filtro.</div>
        )}
        {filteredProducts.length > 0 && (
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
              disabled={currentPage === 1}
              className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40"
            >
              Anterior
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Página {currentPage} de {totalPages}
            </p>
            <button
              onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}
              disabled={currentPage === totalPages}
              className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </main>

      <BottomNav activePage="inventory" navigate={navigate} currentUserRole={currentUserRole} />

      {showCategoryModal && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">Categorias e Subcategorias</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Nova categoria</p>
              <FormInput
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Ex.: Conveniência"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <button
                onClick={handleCreateCategory}
                className="w-full h-11 rounded-xl bg-primary text-background-dark font-black text-xs uppercase tracking-widest"
              >
                Adicionar categoria
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Nova subcategoria</p>
              <FormSelect
                value={categoryForSubcategory}
                onChange={(event) => setCategoryForSubcategory(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                <option value="">Selecione a categoria</option>
                {categories.filter(category => category !== 'Todos').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FormSelect>
              <FormInput
                type="text"
                value={newSubcategoryName}
                onChange={(event) => setNewSubcategoryName(event.target.value)}
                placeholder="Ex.: Isqueiros"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <button
                onClick={handleCreateSubcategory}
                className="w-full h-11 rounded-xl bg-primary text-background-dark font-black text-xs uppercase tracking-widest"
              >
                Adicionar subcategoria
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[230] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <FormInput
                type="text"
                value={productForm.name}
                onChange={(event) => setProductForm(previous => ({ ...previous, name: event.target.value }))}
                placeholder="Nome do produto"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <FormInput
                type="text"
                value={productForm.sku}
                onChange={(event) => setProductForm(previous => ({ ...previous, sku: event.target.value }))}
                placeholder="SKU"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <FormSelect
                value={productForm.category}
                onChange={(event) => setProductForm(previous => ({ ...previous, category: event.target.value, subcategory: '' }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                <option value="">Categoria</option>
                {categories.filter(category => category !== 'Todos').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FormSelect>
              <FormSelect
                value={productForm.subcategory}
                onChange={(event) => setProductForm(previous => ({ ...previous, subcategory: event.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                <option value="">Subcategoria</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </FormSelect>
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  type="text"
                  value={productForm.location}
                  onChange={(event) => setProductForm(previous => ({ ...previous, location: event.target.value }))}
                  placeholder="Local"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                />
                <FormSelect
                  value={productForm.unit}
                  onChange={(event) => setProductForm(previous => ({ ...previous, unit: event.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                >
                  {['un', 'pct', 'cx', 'garrafa', 'lata', 'ml', 'litro', 'kg', 'par'].map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </FormSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  type="number"
                  value={productForm.price}
                  onChange={(event) => setProductForm(previous => ({ ...previous, price: event.target.value }))}
                  placeholder="Preço de venda"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                />
                <FormInput
                  type="number"
                  value={productForm.cost}
                  onChange={(event) => setProductForm(previous => ({ ...previous, cost: event.target.value }))}
                  placeholder="Custo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FormLabel className="block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1">Atual</FormLabel>
                  <FormInput
                    type="number"
                    value={productForm.stock}
                    onChange={(event) => setProductForm(previous => ({ ...previous, stock: event.target.value }))}
                    placeholder="Ex.: 24"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-sm"
                  />
                </div>
                <div>
                  <FormLabel className="block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1">Mínimo</FormLabel>
                  <FormInput
                    type="number"
                    value={productForm.minStock}
                    onChange={(event) => setProductForm(previous => ({ ...previous, minStock: event.target.value }))}
                    placeholder="Ex.: 8"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-sm"
                  />
                </div>
                <div>
                  <FormLabel className="block text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1">Ideal</FormLabel>
                  <FormInput
                    type="number"
                    value={productForm.idealStock}
                    onChange={(event) => setProductForm(previous => ({ ...previous, idealStock: event.target.value }))}
                    placeholder="Ex.: 36"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-sm"
                  />
                </div>
              </div>
              <FormSelect
                value={productForm.status}
                onChange={(event) => setProductForm(previous => ({ ...previous, status: event.target.value as 'active' | 'inactive' }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </FormSelect>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleSaveProduct}
                className="w-full h-12 rounded-xl bg-primary text-background-dark font-black text-sm uppercase tracking-widest"
              >
                Salvar produto
              </button>
              {editingProductId && (
                <button
                  onClick={handleToggleProductStatus}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest"
                >
                  {activeProduct?.status === 'inactive' ? 'Reativar produto' : 'Desabilitar produto'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && (
        <div className="fixed inset-0 z-[240] bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">{adjustReason === 'IN' ? 'Entrada de mercadoria' : 'Perda / Quebra'}</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <FormSelect
                value={adjustProductId}
                onChange={(e) => setAdjustProductId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </FormSelect>
              <FormInput
                type="number"
                min={1}
                step={1}
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Quantidade"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <FormInput
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="Observação (opcional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <button
                onClick={applyAdjustment}
                className="w-full h-12 rounded-xl bg-primary text-background-dark font-black text-sm uppercase tracking-widest"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[260] bg-black/80 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold">
          {toast}
          <button className="ml-3 text-primary" onClick={() => setToast(null)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
