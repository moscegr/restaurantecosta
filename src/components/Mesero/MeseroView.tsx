import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, Plus, Minus, Trash2, User, Search, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Product, ProductCategory, KitchenOrder, KitchenOrderItem } from '../../types';
import { db } from '../../db/db';


const ALL_TABLES = [
  'Ramada 1 (Playa)',
  'Ramada 2 (Playa)',
  'Ramada 3 (Playa)',
  'Ramada 4 (Playa)',
  'Ramada 5 (Playa)',
  'Mesa 1 (Interior)',
  'Mesa 2 (Palapa)',
  'Mesa 3 (Palapa)',
  'Mesa 4 (Palapa)',
  'Barra Principal',
  'Para Llevar',
];

const WAITERS = ['Toño (Mesero)', 'Lupita (Mesera)', 'Don Juan', 'Mariana'];

const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Especialidades del Mar',
  'Pescados y Mariscos',
  'Bebidas y Chilate',
  'Botanas y Antojitos',
  'Postres y Cocos',
];

export const MeseroView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrders, setActiveOrders] = useState<KitchenOrder[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Ramada 1 (Playa)');
  const [selectedWaiter, setSelectedWaiter] = useState<string>('Toño (Mesero)');
  const [currentItems, setCurrentItems] = useState<KitchenOrderItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const [allProds, orders] = await Promise.all([
      db.products.where('active').equals(1).toArray(),
      db.kitchenOrders.where('status').noneOf(['cobrado']).toArray(),
    ]);
    setProducts(allProds);
    setActiveOrders(orders);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Verificar si la mesa seleccionada ya tiene una orden abierta
  useEffect(() => {
    const existing = activeOrders.find(o => o.tableOrRamada === selectedTable);
    if (existing) {
      setCurrentItems(existing.items);
      setGeneralNotes(existing.notes || '');
      if (existing.waiterName) setSelectedWaiter(existing.waiterName);
    } else {
      setCurrentItems([]);
      setGeneralNotes('');
    }
  }, [selectedTable, activeOrders]);

  const addToComanda = (product: Product) => {
    setCurrentItems(prev => {
      const idx = prev.findIndex(item => item.productId === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id!,
          name: product.name,
          quantity: 1,
          price: product.price,
        },
      ];
    });
  };

  const updateItemQty = (productId: number, delta: number) => {
    setCurrentItems(prev => {
      return prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as KitchenOrderItem[];
    });
  };

  const updateItemNotes = (productId: number, notes: string) => {
    setCurrentItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, notes } : item
      )
    );
  };

  const totalComanda = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Enviar a Cocina (KDS)
  const handleSendToKitchen = async () => {
    if (currentItems.length === 0) {
      alert('Agrega al menos un platillo o bebida a la comanda.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      const existingOrder = activeOrders.find(o => o.tableOrRamada === selectedTable);

      if (existingOrder && existingOrder.id) {
        // Actualizar comanda existente
        await db.kitchenOrders.update(existingOrder.id, {
          items: currentItems,
          total: totalComanda,
          notes: generalNotes,
          waiterName: selectedWaiter,
          status: 'pendiente', // vuelve a alertar en cocina con los nuevos items
        });
      } else {
        // Crear nueva comanda para cocina
        await db.kitchenOrders.add({
          tableOrRamada: selectedTable,
          waiterName: selectedWaiter,
          items: currentItems,
          total: totalComanda,
          status: 'pendiente',
          createdAt: nowIso,
          dateString: todayStr,
          notes: generalNotes,
        });
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });

      await loadData();
      alert(`✅ ¡Comanda de ${selectedTable} enviada a Cocina con éxito!`);
    } catch (err) {
      console.error('Error enviando a cocina:', err);
      alert('Hubo un error al enviar la orden.');
    }
  };

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 select-none">
      {/* 1. SECCIÓN IZQUIERDA: SELECTOR DE MESAS & CATÁLOGO */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 min-w-0">
        {/* Barra de Mesero y Mesas */}
        <div className="bg-white p-3 sm:p-4 border-b border-slate-200 space-y-2.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mesero en Turno:</span>
                <select
                  value={selectedWaiter}
                  onChange={(e) => setSelectedWaiter(e.target.value)}
                  className="bg-transparent font-black text-xs sm:text-sm text-slate-800 focus:outline-none"
                >
                  {WAITERS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {activeOrders.length} {activeOrders.length === 1 ? 'mesa activa' : 'mesas activas'} en cocina
            </div>
          </div>

          {/* Carrusel de Mesas / Ramadas Táctiles */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Seleccionar Mesa o Ramada:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {ALL_TABLES.map((t) => {
                const isSelected = selectedTable === t;
                const hasActive = activeOrders.find(o => o.tableOrRamada === t);
                const isReady = hasActive?.status === 'listo';

                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all touch-press flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-cyan-800 text-white shadow-md ring-2 ring-cyan-700/40'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                        : hasActive
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t}</span>
                    {hasActive && (
                      <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buscador y Categorías */}
          <div className="space-y-2 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar platillo o bebida rápida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all touch-press ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cuadrícula Táctil de Platillos */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.map((p) => {
            const inOrder = currentItems.find(i => i.productId === p.id);

            return (
              <button
                key={p.id}
                onClick={() => addToComanda(p)}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all touch-press relative ${
                  inOrder
                    ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-white border-slate-200 hover:border-cyan-400 shadow-xs'
                }`}
              >
                {inOrder && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-cyan-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow">
                    {inOrder.quantity}
                  </span>
                )}

                <div>
                  <span className="text-3xl block mb-1">{p.icon}</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="font-black text-cyan-900 text-sm sm:text-base">
                    ${p.price}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {p.unit}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECCIÓN DERECHA: COMANDA DEL MESERO */}
      <div className="w-full lg:w-96 xl:w-[400px] bg-white flex flex-col h-auto lg:h-full border-t lg:border-t-0 shadow-xl z-10 shrink-0">
        {/* Cabecera de la comanda */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                {selectedTable}
              </h3>
              <p className="text-[11px] text-teal-200">
                Atiende: {selectedWaiter}
              </p>
            </div>
          </div>

          {currentItems.length > 0 && (
            <button
              onClick={() => setCurrentItems([])}
              className="text-xs bg-white/10 hover:bg-rose-600 px-2 py-1 rounded-lg text-teal-100 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Lista de productos de la comanda */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 min-h-[160px] max-h-64 lg:max-h-none">
          {currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold">Comanda vacía para {selectedTable}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toca platillos o bebidas a la izquierda para agregarlos a la orden del cliente.
              </p>
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.productId} className="py-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {item.name}
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      ${item.price} c/u
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateItemQty(item.productId, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center touch-press"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-xs sm:text-sm text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQty(item.productId, 1)}
                      className="w-7 h-7 rounded-lg bg-cyan-100 hover:bg-cyan-200 font-black text-cyan-900 flex items-center justify-center touch-press"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-14 text-right font-black text-xs sm:text-sm text-cyan-950">
                      ${item.price * item.quantity}
                    </span>
                  </div>
                </div>

                {/* Notas de preparación (ej. sin cebolla, dorado) */}
                <input
                  type="text"
                  placeholder="Nota al cocinero: ej. bien dorado, sin salsa..."
                  value={item.notes || ''}
                  onChange={(e) => updateItemNotes(item.productId, e.target.value)}
                  className="w-full text-[11px] px-2 py-1 bg-amber-50/60 border border-amber-200/80 rounded-lg text-amber-950 placeholder:text-amber-800/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            ))
          )}
        </div>

        {/* Notas generales de la mesa */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <input
            type="text"
            placeholder="Nota general (ej. 'Mesa con niños', 'Traer primero bebidas')"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          />
        </div>

        {/* Footer con Total y Botón de Enviar a Cocina */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de la Mesa
            </span>
            <span className="text-2xl font-black text-slate-900">
              ${totalComanda.toLocaleString('es-MX')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              disabled={currentItems.length === 0}
              onClick={handleSendToKitchen}
              className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all touch-press ${
                currentItems.length > 0
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Flame className="w-5 h-5 text-amber-200" />
              <span>ENVIAR A COCINA (KDS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
