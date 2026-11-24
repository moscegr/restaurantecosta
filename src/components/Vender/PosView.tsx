import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  UtensilsCrossed,
  MapPin,
  Search,
  Receipt,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  BusinessConfig,
  CartItem,
  InvoiceData,
  Order,
  PaymentMethod,
  Product,
  ProductCategory,
} from '../../types';
import { api } from '../../services/api';
import { QuickPayModal } from './QuickPayModal';
import { TicketModal } from './TicketModal';
import { ProductModal } from '../Inventario/ProductModal';
import { HorizontalScroller } from '../HorizontalScroller';

interface PosViewProps {
  config: BusinessConfig | null;
  canManageProducts?: boolean;
}

const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Especialidades del Mar',
  'Pescados y Mariscos',
  'Bebidas y Chilate',
  'Botanas y Antojitos',
  'Postres y Cocos',
];

const DESTINATIONS = [
  'Venta en Barra',
  'Para Llevar',
  'Ramada 1 (Playa)',
  'Ramada 2 (Playa)',
  'Ramada 3 (Playa)',
  'Ramada 4 (Playa)',
  'Mesa 1 (Interior)',
  'Mesa 2 (Palapa)',
  'Mesa 3 (Palapa)',
  'Cabaña 1',
  'Cabaña 2',
];

export const PosView: React.FC<PosViewProps> = ({ config, canManageProducts = true }) => {
  const dynamicDestinations =
    config?.tables && config.tables.length > 0
      ? ['Venta en Barra', ...config.tables]
      : DESTINATIONS;
  const [products, setProducts] = useState<Product[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [selectedOpenOrder, setSelectedOpenOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [destination, setDestination] = useState<string>('Venta en Barra');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      const [prodList, openList] = await Promise.all([
        api.getProducts(),
        api.getOrders({ open: true }),
      ]);
      setProducts(prodList);
      setOpenOrders(openList);
    } catch (err) {
      console.error('Error cargando POS:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product) => {
    setSelectedOpenOrder(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const selectOpenOrderForPayment = (order: Order) => {
    setCart([]);
    setSelectedOpenOrder(order);
  };

  const currentSubtotal = selectedOpenOrder
    ? selectedOpenOrder.subtotal
    : cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleConfirmSale = async (payload: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    tip: number;
    discount: number;
    invoiceData?: InvoiceData;
  }) => {
    try {
      let finalized: Order;

      if (selectedOpenOrder) {
        finalized = await api.payOrder(selectedOpenOrder.id, payload);
      } else {
        finalized = await api.createOrder({
          tableOrRamada: destination,
          items: cart.map((c) => ({
            productId: c.product.id,
            name: c.product.name,
            quantity: c.quantity,
            price: c.product.price,
            costPrice: c.product.costPrice,
            station: c.product.station,
          })),
          payImmediately: true,
          ...payload,
        });
      }

      confetti({ particleCount: 45, spread: 55, origin: { y: 0.75 } });
      setCompletedOrder(finalized);
      setIsPayModalOpen(false);
      setIsTicketModalOpen(true);
      setCart([]);
      setSelectedOpenOrder(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo procesar el cobro.');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#F4F6F9]">
      {/* Izquierda: Cuentas Abiertas + Catálogo Fotográfico */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 min-w-0">
        {/* Cuentas Abiertas de Meseros listas para cobrar */}
        {openOrders.length > 0 && (
          <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Receipt className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-extrabold text-amber-950">
                Cuentas Abiertas por Cobrar ({openOrders.length})
              </span>
            </div>
            <HorizontalScroller className="gap-2">
              {openOrders.map((ord) => {
                const isSelected = selectedOpenOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => selectOpenOrderForPayment(ord)}
                    className={`px-3 py-2 rounded-xl border text-left shrink-0 touch-press flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-[#0B3954] text-white border-[#0B3954] shadow-sm'
                        : 'bg-white text-slate-800 border-amber-300 hover:border-[#0B3954]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold leading-tight">{ord.tableOrRamada}</p>
                      <p
                        className={`text-[10px] font-medium flex items-center gap-1 ${
                          isSelected ? 'text-sky-200' : 'text-slate-500'
                        }`}
                      >
                        <Clock className="w-3 h-3" /> {ord.items.length} conceptos · {ord.status}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-[#0B3954]'
                      }`}
                    >
                      ${ord.subtotal}
                    </span>
                  </button>
                );
              })}
            </HorizontalScroller>
          </div>
        )}

        {/* Buscador y Categorías */}
        <div className="bg-white p-3.5 sm:p-4 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar platillo, marisco o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#087E8B] focus:bg-white"
              />
            </div>

            {canManageProducts && (
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#0B3954] hover:bg-[#082C42] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 touch-press"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Nuevo Platillo</span>
              </button>
            )}
          </div>

          <HorizontalScroller className="gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 touch-press ${
                  selectedCategory === cat
                    ? 'bg-[#0B3954] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </HorizontalScroller>
        </div>

        {/* Grid Fotográfico de Productos */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map((product) => {
            const inCart = cart.find((c) => c.product.id === product.id);
            const isOut = product.stock <= 0;
            const isLow = product.stock <= product.minStock;

            return (
              <button
                key={product.id}
                type="button"
                disabled={isOut}
                onClick={() => addToCart(product)}
                className={`group relative rounded-2xl border-2 overflow-hidden text-left bg-white flex flex-col justify-between touch-press ${
                  isOut
                    ? 'opacity-45 border-slate-200 cursor-not-allowed'
                    : inCart
                    ? 'border-[#087E8B] ring-2 ring-[#087E8B]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Imagen del platillo */}
                <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UtensilsCrossed className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badge de stock */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-xs ${
                      isOut
                        ? 'bg-rose-600 text-white'
                        : isLow
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900/75 text-white'
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>

                  {inCart && (
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#087E8B] text-white text-xs font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                      {inCart.quantity}
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-[#0B3954]">
                      ${product.price}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      /{product.unit}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Derecha: Comanda / Cuenta a Cobrar */}
      <div className="w-full lg:w-[390px] xl:w-[420px] bg-white flex flex-col h-auto lg:h-full border-t lg:border-t-0 shadow-lg z-10 shrink-0">
        <div className="px-4 py-3.5 bg-[#0B3954] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {selectedOpenOrder ? `Cuenta: ${selectedOpenOrder.tableOrRamada}` : 'Venta Directa POS'}
              </h3>
              <p className="text-[11px] text-sky-200">
                {selectedOpenOrder
                  ? `Folio ${selectedOpenOrder.folio} · Mesero: ${selectedOpenOrder.waiterName}`
                  : `${cart.reduce((s, c) => s + c.quantity, 0)} productos seleccionados`}
              </p>
            </div>
          </div>

          {(cart.length > 0 || selectedOpenOrder) && (
            <button
              type="button"
              onClick={() => {
                setCart([]);
                setSelectedOpenOrder(null);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-white touch-press"
              title="Limpiar selección"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selector de Destino si es venta directa */}
        {!selectedOpenOrder && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#087E8B] shrink-0" />
            <span className="text-xs font-bold text-slate-600 shrink-0">Destino:</span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            >
              {dynamicDestinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Lista de Conceptos */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100 min-h-[140px] max-h-60 lg:max-h-none">
          {selectedOpenOrder ? (
            selectedOpenOrder.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.quantity}x {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-amber-700 font-medium">Nota: {item.notes}</p>
                  )}
                </div>
                <span className="font-extrabold text-sm text-[#0B3954] shrink-0">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-bold text-slate-500">Sin productos en caja</p>
              <p className="text-[11px] mt-0.5 max-w-[220px]">
                Selecciona una cuenta abierta arriba o toca los platillos del catálogo.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-400">${item.product.price} c/u</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 touch-press"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-8 h-8 rounded-lg bg-sky-100 hover:bg-sky-200 flex items-center justify-center text-[#0B3954] touch-press"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-right font-extrabold text-sm text-[#0B3954]">
                    ${item.product.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Cobro */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500">Subtotal MXN</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${currentSubtotal.toLocaleString('es-MX')}
            </span>
          </div>

          <button
            type="button"
            disabled={currentSubtotal <= 0}
            onClick={() => setIsPayModalOpen(true)}
            className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-md touch-press ${
              currentSubtotal > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Cobrar Cuenta</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-sm">
              ${currentSubtotal.toLocaleString('es-MX')}
            </span>
          </button>
        </div>
      </div>

      <QuickPayModal
        subtotal={currentSubtotal}
        tableName={selectedOpenOrder ? selectedOpenOrder.tableOrRamada : destination}
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onConfirmSale={handleConfirmSale}
      />

      <TicketModal
        order={completedOrder}
        config={config}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
