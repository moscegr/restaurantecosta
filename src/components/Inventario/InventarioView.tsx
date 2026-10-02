import React, { useState, useEffect } from 'react';
import { PackagePlus, Search } from 'lucide-react';
import type { Product } from '../../types';
import { db } from '../../db/db';
import { RestockModal } from './RestockModal';

export const InventarioView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [filterSemaphore, setFilterSemaphore] = useState<'todos' | 'critico' | 'minimo' | 'optimo'>('todos');

  const loadProducts = async () => {
    const list = await db.products.where('active').equals(1).toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenRestock = (product?: Product) => {
    setSelectedProductForRestock(product || null);
    setIsRestockOpen(true);
  };

  // Contadores para el semáforo
  const criticos = products.filter(p => p.stock <= 2);
  const minimos = products.filter(p => p.stock > 2 && p.stock <= p.minStock);
  const optimos = products.filter(p => p.stock > p.minStock);

  // Filtrado
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (filterSemaphore === 'critico') return p.stock <= 2;
    if (filterSemaphore === 'minimo') return p.stock > 2 && p.stock <= p.minStock;
    if (filterSemaphore === 'optimo') return p.stock > p.minStock;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-3 sm:p-5 max-w-5xl mx-auto space-y-4">
      {/* Cabecera & Botón de Nueva Compra */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Inventario de Existencias
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Control con semáforo y descuento automático por comanda
            </p>
          </div>

          <button
            onClick={() => handleOpenRestock()}
            className="py-3 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 touch-press"
          >
            <PackagePlus className="w-5 h-5 text-amber-300" />
            <span>+ Registrar Compra / Entrada</span>
          </button>
        </div>

        {/* Semáforo de Estado (Slide 22) */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => setFilterSemaphore(filterSemaphore === 'critico' ? 'todos' : 'critico')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 transition-all touch-press ${
              filterSemaphore === 'critico'
                ? 'bg-rose-100 border-rose-400 shadow-sm'
                : 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0"></span>
            <div className="text-left">
              <span className="text-[10px] sm:text-xs font-bold text-rose-900 block">
                🔴 Crítico / Agotado
              </span>
              <span className="text-sm sm:text-base font-black text-rose-700">
                {criticos.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setFilterSemaphore(filterSemaphore === 'minimo' ? 'todos' : 'minimo')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 transition-all touch-press ${
              filterSemaphore === 'minimo'
                ? 'bg-amber-100 border-amber-400 shadow-sm'
                : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0"></span>
            <div className="text-left">
              <span className="text-[10px] sm:text-xs font-bold text-amber-900 block">
                🟡 Cerca del Mínimo
              </span>
              <span className="text-sm sm:text-base font-black text-amber-700">
                {minimos.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setFilterSemaphore(filterSemaphore === 'optimo' ? 'todos' : 'optimo')}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 transition-all touch-press ${
              filterSemaphore === 'optimo'
                ? 'bg-emerald-100 border-emerald-400 shadow-sm'
                : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></span>
            <div className="text-left">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-900 block">
                🟢 Stock Óptimo
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-700">
                {optimos.length}
              </span>
            </div>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar insumo, marisco, cerveza, hielo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>
      </div>

      {/* Lista de Existencias */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <p className="p-8 text-center text-xs sm:text-sm text-slate-400">
            No se encontraron productos con ese filtro.
          </p>
        ) : (
          filteredProducts.map((p) => {
            const isCritico = p.stock <= 2;
            const isMinimo = p.stock > 2 && p.stock <= p.minStock;

            return (
              <div
                key={p.id}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl select-none">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {p.name}
                      </h4>
                      {/* Semáforo visual */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCritico
                            ? 'bg-rose-500 ring-2 ring-rose-300 animate-pulse'
                            : isMinimo
                            ? 'bg-amber-500 ring-2 ring-amber-300'
                            : 'bg-emerald-500'
                        }`}
                        title={
                          isCritico
                            ? 'Stock Crítico'
                            : isMinimo
                            ? 'Stock Cerca del Mínimo'
                            : 'Stock Saludable'
                        }
                      ></span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500">
                      {p.category} · Mínimo sugerido: {p.minStock} {p.unit}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Precio Venta: ${p.price} · Costo Compra: ${p.costPrice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-lg sm:text-xl font-black block leading-none ${
                        isCritico
                          ? 'text-rose-600'
                          : isMinimo
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {p.stock}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {p.unit}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenRestock(p)}
                    className="py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs rounded-xl border border-cyan-200 transition-all touch-press flex items-center gap-1"
                  >
                    <span>+ Entrada</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Reabastecimiento */}
      <RestockModal
        product={selectedProductForRestock}
        allProducts={products}
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  );
};
