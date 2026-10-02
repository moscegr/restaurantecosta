import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, Trash2, ShoppingBag, UtensilsCrossed, 
  MapPin, Search 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Product, CartItem, PaymentMethod, Sale, ProductCategory, BusinessConfig } from '../../types';
import { db } from '../../db/db';
import { QuickPayModal } from './QuickPayModal';
import { TicketModal } from './TicketModal';
import { ProductModal } from '../Inventario/ProductModal';

interface PosViewProps {
  config: BusinessConfig | null;
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
  'Ramada 1 (Playa)',
  'Ramada 2 (Playa)',
  'Ramada 3 (Playa)',
  'Ramada 4 (Playa)',
  'Mesa 1 (Interior)',
  'Mesa 2 (Interior)',
  'Mesa 3 (Palapa)',
  'Mesa 4 (Palapa)',
  'Para Llevar',
  'Cabaña 1',
  'Cabaña 2',
  'Cuarto 3',
];

export const PosView: React.FC<PosViewProps> = ({ config }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [destination, setDestination] = useState<string>('Ramada 1 (Playa)');
  
  // Modales
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const loadProducts = async () => {
    const list = await db.products.where('active').equals(1).toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Funciones de Carrito / Comanda
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Ejecución de la venta (Regla de los 3 toques)
  const handleConfirmSale = async (method: PaymentMethod, amountPaid: number, change: number) => {
    if (cart.length === 0) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      const saleItems = cart.map(item => ({
        productId: item.product.id!,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const costTotal = cart.reduce(
        (sum, item) => sum + item.product.costPrice * item.quantity,
        0
      );

      const saleData: Sale = {
        date: nowIso,
        dateString: todayStr,
        items: saleItems,
        total: totalAmount,
        costTotal,
        paymentMethod: method,
        amountPaid,
        change,
        destination,
        status: 'completada',
      };

      // Guardar en Dexie y descontar stock automáticamente
      await db.transaction('rw', [db.sales, db.products, db.transactions], async () => {
        const saleId = await db.sales.add(saleData);
        saleData.id = saleId;

        // Descontar inventario
        for (const item of cart) {
          if (item.product.id) {
            const currentProd = await db.products.get(item.product.id);
            if (currentProd) {
              const newStock = Math.max(0, currentProd.stock - item.quantity);
              await db.products.update(item.product.id, { stock: newStock });
            }
          }
        }

        // Registrar ingreso en caja
        await db.transactions.add({
          date: nowIso,
          dateString: todayStr,
          type: 'ingreso',
          category: 'Venta POS',
          amount: totalAmount,
          description: `Venta #${saleId} - ${destination} (${cart.length} productos)`,
          paymentMethod: method,
          referenceId: saleId,
        });
      });

      // Confetti feedback
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      // Recargar catálogo para actualizar existencias visibles
      await loadProducts();

      // Abrir modal de ticket
      setCompletedSale(saleData);
      setIsPayModalOpen(false);
      setIsTicketModalOpen(true);
      clearCart();
    } catch (err) {
      console.error('Error al guardar la venta:', err);
      alert('Hubo un error al guardar la venta.');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100">
      {/* SECCIÓN IZQUIERDA: CATÁLOGO TÁCTIL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        {/* Barra superior de búsqueda y categorías */}
        <div className="bg-white p-3 sm:p-4 border-b border-slate-200 space-y-2.5 shadow-sm">
          {/* Campo de búsqueda y botón rápido para agregar platillos */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar platillo, chilate, marisco o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={() => setIsProductModalOpen(true)}
              className="px-3 py-2.5 bg-cyan-800 hover:bg-cyan-900 active:bg-cyan-950 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 shadow-sm touch-press"
              title="Crear y agregar nuevo platillo al menú"
            >
              <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
              <span className="hidden sm:inline">+ Agregar Platillo</span>
            </button>
          </div>

          {/* Carrusel de Categorías Táctiles Grandes */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all touch-press ${
                    isActive
                      ? 'bg-cyan-800 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuadrícula Táctil de Productos */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
          {filteredProducts.map((product) => {
            const inCart = cart.find(c => c.product.id === product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock <= product.minStock;

            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all touch-press ${
                  isOutOfStock
                    ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                    : inCart
                    ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200/90 hover:border-cyan-500 shadow-sm hover:shadow'
                }`}
              >
                {/* Badge en carrito */}
                {inCart && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-cyan-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {inCart.quantity}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl select-none">{product.icon}</span>
                    {/* Semáforo de stock (Slide 22) */}
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                      title={`Existencias: ${product.stock} ${product.unit}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOutOfStock ? 'bg-rose-600' : isLowStock ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      ></span>
                      {product.stock} {product.unit}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-2 line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <span className="text-base sm:text-lg font-black text-cyan-900">
                    ${product.price}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    por {product.unit}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN DERECHA: COMANDA ACTIVA / CARRITO TÁCTIL */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white flex flex-col h-auto lg:h-full border-t lg:border-t-0 shadow-xl z-20">
        {/* Cabecera de la comanda */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                Comanda Activa
              </h3>
              <p className="text-[11px] text-teal-200">
                {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'} en orden
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs bg-white/10 hover:bg-white/20 active:bg-rose-600/80 px-2 py-1 rounded-lg text-teal-100 transition-colors flex items-center gap-1"
              title="Vaciar orden"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Selector de Mesa / Ramada */}
        <div className="p-3 bg-cyan-50/70 border-b border-cyan-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-700 shrink-0" />
          <span className="text-xs font-bold text-cyan-950 shrink-0">Destino:</span>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1 bg-white border border-cyan-200 rounded-lg py-1 px-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          >
            {DESTINATIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Lista de productos en comanda */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 min-h-[140px] max-h-60 lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-medium">La comanda está vacía.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toca cualquier platillo o bebida del menú para agregarlo.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    ${item.product.price} c/u
                  </p>
                </div>

                {/* Controles táctiles grandes (+ y -) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id!, -1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center font-black text-slate-700 touch-press"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-6 text-center text-xs sm:text-sm font-black text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.product.id!, 1)}
                    className="w-8 h-8 rounded-lg bg-cyan-100 hover:bg-cyan-200 active:bg-cyan-300 flex items-center justify-center font-black text-cyan-900 touch-press"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <span className="w-16 text-right font-black text-xs sm:text-sm text-cyan-950">
                    ${item.product.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer de Cobro Gigante (Toque 1) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total a Pagar
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ${totalAmount.toLocaleString('es-MX')}
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsPayModalOpen(true)}
            className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl transition-all touch-press ${
              cart.length > 0
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 text-white cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>COBRAR</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-sm">
              ${totalAmount.toLocaleString('es-MX')}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de Cobro Rápido (Toques 2 y 3) */}
      <QuickPayModal
        total={totalAmount}
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onConfirmSale={handleConfirmSale}
      />

      {/* Modal de Ticket y Compartir por WhatsApp */}
      <TicketModal
        sale={completedSale}
        config={config}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Modal para Crear Nuevo Platillo */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  );
};
