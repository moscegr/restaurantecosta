import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Search,
  Plus,
  Edit3,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  UtensilsCrossed,
  Trash2,
} from 'lucide-react';
import type { Product } from '../../types';
import { api } from '../../services/api';
import { RestockModal } from './RestockModal';
import { ProductModal } from './ProductModal';

export const InventarioView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [filterSemaphore, setFilterSemaphore] = useState<'todos' | 'critico' | 'minimo' | 'optimo'>('todos');

  const loadProducts = async () => {
    try {
      const list = await api.getProducts();
      setProducts(list);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const criticos = products.filter((p) => p.stock <= 2);
  const minimos = products.filter((p) => p.stock > 2 && p.stock <= p.minStock);
  const optimos = products.filter((p) => p.stock > p.minStock);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filterSemaphore === 'critico') return p.stock <= 2;
    if (filterSemaphore === 'minimo') return p.stock > 2 && p.stock <= p.minStock;
    if (filterSemaphore === 'optimo') return p.stock > p.minStock;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5 pb-16">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Catálogo e Inventario</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Semáforo de existencias y descuento automático por cada venta en MongoDB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#0B3954] hover:bg-[#082C42] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 touch-press shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Nuevo Platillo / Producto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProductForRestock(null);
                setIsRestockOpen(true);
              }}
              className="px-4 py-2.5 bg-[#087E8B] hover:bg-[#066873] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 touch-press shadow-xs"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Registrar Entrada</span>
            </button>
          </div>
        </div>

        {/* Semáforo de Stock */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setFilterSemaphore(filterSemaphore === 'critico' ? 'todos' : 'critico')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 touch-press ${
              filterSemaphore === 'critico'
                ? 'bg-rose-100 border-rose-400'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60'
            }`}
          >
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-rose-900 block">Crítico</span>
              <span className="text-base font-extrabold text-rose-700">{criticos.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFilterSemaphore(filterSemaphore === 'minimo' ? 'todos' : 'minimo')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 touch-press ${
              filterSemaphore === 'minimo'
                ? 'bg-amber-100 border-amber-400'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-900 block">Stock Bajo</span>
              <span className="text-base font-extrabold text-amber-800">{minimos.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFilterSemaphore(filterSemaphore === 'optimo' ? 'todos' : 'optimo')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 touch-press ${
              filterSemaphore === 'optimo'
                ? 'bg-emerald-100 border-emerald-400'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-emerald-900 block">Óptimo</span>
              <span className="text-base font-extrabold text-emerald-700">{optimos.length}</span>
            </div>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto, marisco, bebida o insumo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
          />
        </div>
      </div>

      {/* Tabla / Lista con Miniaturas Fotográficas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredProducts.map((p) => {
          const isCritico = p.stock <= 2;
          const isMinimo = p.stock > 2 && p.stock <= p.minStock;

          return (
            <div
              key={p.id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {p.name}
                    </h4>
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCritico
                          ? 'bg-rose-500'
                          : isMinimo
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {p.category} · Estación: <span className="uppercase font-semibold">{p.station}</span> · Mínimo: {p.minStock} {p.unit}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Venta: <span className="font-bold text-slate-700">${p.price}</span> · Costo: ${p.costPrice}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right">
                  <span
                    className={`text-lg font-extrabold block leading-none ${
                      isCritico ? 'text-rose-600' : isMinimo ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {p.stock}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{p.unit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(p);
                    setIsProductModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 touch-press"
                  title="Editar producto"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`¿Eliminar "${p.name}" del catálogo?`)) return;
                    try {
                      await api.deleteProduct(p.id);
                      await loadProducts();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 touch-press"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductForRestock(p);
                    setIsRestockOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0B3954] border border-sky-200 text-xs font-bold touch-press"
                >
                  + Surtir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <RestockModal
        product={selectedProductForRestock}
        allProducts={products}
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        onSuccess={loadProducts}
      />

      <ProductModal
        productToEdit={editingProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  );
};
