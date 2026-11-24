import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Search,
  Flame,
  Users,
  Printer,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  BusinessConfig,
  Order,
  OrderItem,
  Product,
  ProductCategory,
  StaffUser,
} from '../../types';
import { api } from '../../services/api';
import { printThermalTicket } from '../../services/pdfService';
import { TablesManageModal } from './TablesManageModal';
import { HorizontalScroller } from '../HorizontalScroller';

interface MeseroViewProps {
  user: StaffUser;
  config: BusinessConfig | null;
  onConfigUpdated?: () => void;
}

const DEFAULT_TABLES = [
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

const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Especialidades del Mar',
  'Pescados y Mariscos',
  'Bebidas y Chilate',
  'Botanas y Antojitos',
  'Postres y Cocos',
];

export const MeseroView: React.FC<MeseroViewProps> = ({ user, config, onConfigUpdated }) => {
  const tableList = config?.tables && config.tables.length > 0 ? config.tables : DEFAULT_TABLES;
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(tableList[0] || 'Ramada 1 (Playa)');
  const [isTablesModalOpen, setIsTablesModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      const [allProds, orders] = await Promise.all([
        api.getProducts(),
        api.getOrders({ open: true }),
      ]);
      setProducts(allProds);
      setActiveOrders(orders);
    } catch (err) {
      console.error('Error cargando comandero:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const existingOrder = activeOrders.find((o) => o.tableOrRamada === selectedTable);

  useEffect(() => {
    if (existingOrder) {
      setCurrentItems(existingOrder.items);
      setGeneralNotes(existingOrder.notes || '');
      setGuestCount(existingOrder.guestCount || 2);
    } else {
      setCurrentItems([]);
      setGeneralNotes('');
      setGuestCount(2);
    }
  }, [selectedTable, activeOrders]);

  const addToComanda = (product: Product) => {
    setCurrentItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        const qty = copy[idx].quantity + 1;
        copy[idx] = { ...copy[idx], quantity: qty, subtotal: qty * copy[idx].price };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
          costPrice: product.costPrice,
          subtotal: product.price,
          station: product.station,
          notes: '',
        },
      ];
    });
  };

  const updateItemQty = (productId: string, delta: number) => {
    setCurrentItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const qty = item.quantity + delta;
            return qty > 0 ? { ...item, quantity: qty, subtotal: qty * item.price } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const updateItemNotes = (productId: string, notes: string) => {
    setCurrentItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, notes } : item))
    );
  };

  const totalComanda = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendToKitchen = async () => {
    if (currentItems.length === 0) return;

    try {
      if (existingOrder) {
        await api.updateOrder(existingOrder.id, {
          items: currentItems,
          notes: generalNotes,
          guestCount,
          status: 'pendiente',
        });
      } else {
        await api.createOrder({
          tableOrRamada: selectedTable,
          guestCount,
          items: currentItems,
          notes: generalNotes,
          payImmediately: false,
        });
      }

      confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
      setFeedback(`Comanda de ${selectedTable} enviada a Cocina KDS.`);
      setTimeout(() => setFeedback(''), 3500);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error enviando comanda.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#F4F6F9]">
      {/* Izquierda: Selector de Mesas y Catálogo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 min-w-0">
        <div className="bg-white p-3.5 sm:p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">
              Mesas y Enramadas ({activeOrders.length} abiertas)
            </span>
            <div className="flex items-center gap-2">
              {feedback && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {feedback}
                </span>
              )}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsTablesModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3954] border border-slate-200 text-xs font-bold flex items-center gap-1.5 touch-press"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Gestionar Mesas / Enramadas</span>
                </button>
              )}
            </div>
          </div>

          {/* Carrusel de Mesas */}
          <HorizontalScroller className="gap-2">
            {tableList.map((t) => {
              const isSelected = selectedTable === t;
              const active = activeOrders.find((o) => o.tableOrRamada === t);
              const isReady = active?.status === 'listo';

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTable(t)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap touch-press flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-[#0B3954] text-white border-[#0B3954] shadow-sm'
                      : isReady
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : active
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{t}</span>
                  {active && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : isReady
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      ${active.subtotal}
                    </span>
                  )}
                </button>
              );
            })}
          </HorizontalScroller>

          {/* Buscador y Categorías */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar platillo o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>

            <HorizontalScroller className="gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 touch-press ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </HorizontalScroller>
          </div>
        </div>

        {/* Grid de Platillos con Foto */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map((p) => {
            const inOrder = currentItems.find((i) => i.productId === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => addToComanda(p)}
                className={`rounded-2xl border-2 overflow-hidden text-left bg-white flex flex-col justify-between touch-press relative ${
                  inOrder
                    ? 'border-amber-500 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="relative h-24 w-full bg-slate-100">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UtensilsCrossed className="w-7 h-7" />
                    </div>
                  )}
                  {inOrder && (
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center border-2 border-white shadow">
                      {inOrder.quantity}
                    </span>
                  )}
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="font-extrabold text-sm text-[#0B3954]">${p.price}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {p.station}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Derecha: Comanda Activa */}
      <div className="w-full lg:w-[390px] bg-white flex flex-col h-auto lg:h-full border-t lg:border-t-0 shadow-lg z-10 shrink-0">
        <div className="px-4 py-3.5 bg-[#0B3954] text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm leading-tight">{selectedTable}</h3>
            <p className="text-[11px] text-sky-200">Mesero: {user.name}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {existingOrder && (
              <button
                type="button"
                onClick={() =>
                  printThermalTicket(existingOrder, config, 'cocina', config?.thermalPaperWidth || '80mm')
                }
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white touch-press"
                title="Imprimir comanda térmica"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
            {currentItems.length > 0 && (
              <button
                type="button"
                onClick={() => setCurrentItems([])}
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white touch-press"
                title="Vaciar comanda"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Comensales */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#087E8B]" />
            <span>Comensales en mesa</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700"
            >
              -
            </button>
            <span className="text-xs font-extrabold w-5 text-center">{guestCount}</span>
            <button
              type="button"
              onClick={() => setGuestCount(guestCount + 1)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100 min-h-[150px] max-h-64 lg:max-h-none">
          {currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400">
              <UtensilsCrossed className="w-9 h-9 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-bold text-slate-500">Comanda vacía</p>
              <p className="text-[11px] mt-0.5">Toca platillos del catálogo para agregar a la mesa.</p>
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.productId} className="py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400">${item.price} c/u</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 touch-press"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItemQty(item.productId, 1)}
                      className="w-8 h-8 rounded-lg bg-sky-100 hover:bg-sky-200 flex items-center justify-center text-[#0B3954] touch-press"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-14 text-right font-extrabold text-xs text-[#0B3954]">
                      ${item.price * item.quantity}
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Nota a cocina (ej. bien dorado, sin cebolla...)"
                  value={item.notes || ''}
                  onChange={(e) => updateItemNotes(item.productId, e.target.value)}
                  className="w-full text-[11px] px-2.5 py-1.5 bg-amber-50/70 border border-amber-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            ))
          )}
        </div>

        {/* Nota general y envío */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <input
            type="text"
            placeholder="Nota general de la mesa..."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
          />

          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500">Cuenta acumulada</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${totalComanda.toLocaleString('es-MX')}
            </span>
          </div>

          <button
            type="button"
            disabled={currentItems.length === 0}
            onClick={handleSendToKitchen}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md touch-press ${
              currentItems.length > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>{existingOrder ? 'Actualizar Orden en Cocina' : 'Enviar Orden a Cocina (KDS)'}</span>
          </button>
        </div>
      </div>

      <TablesManageModal
        tables={tableList}
        isOpen={isTablesModalOpen}
        onClose={() => setIsTablesModalOpen(false)}
        onSaved={() => {
          onConfigUpdated?.();
          loadData();
        }}
      />
    </div>
  );
};
