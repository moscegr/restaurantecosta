import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  QrCode,
  Utensils,
  BedDouble,
  MapPin,
  Phone,
  Wifi,
  Compass,
  Printer,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Search,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { BusinessConfig, Product, ProductCategory, Room } from '../../types';
import { HorizontalScroller } from '../HorizontalScroller';

interface SitioPublicoModalProps {
  products: Product[];
  rooms: Room[];
  config: BusinessConfig | null;
  isOpen: boolean;
  standalone?: boolean;
  onClose: () => void;
}

const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Especialidades del Mar',
  'Pescados y Mariscos',
  'Bebidas y Chilate',
  'Botanas y Antojitos',
  'Postres y Cocos',
];

export const SitioPublicoModal: React.FC<SitioPublicoModalProps> = ({
  products,
  rooms,
  config,
  isOpen,
  standalone = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'hospedaje' | 'qr'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [waCart, setWaCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'En Ramada / Mesa' | 'Para Llevar'>('En Ramada / Mesa');
  const [checkIn, setCheckIn] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState(() =>
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [guests, setGuests] = useState(2);

  if (!isOpen) return null;

  const businessName = config?.businessName || 'Ramada & Cabañas Las Brisas';
  const phone = config?.phone || '741 123 4567';
  const whatsappNumber = config?.whatsapp?.replace(/\D/g, '') || '527411234567';
  const publicMenuUrl = `${window.location.origin}/?menu=publico`;

  const updateCart = (productId: string, delta: number) => {
    setWaCart((prev) => {
      const next = (prev[productId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const availableProducts = products.filter((p) => {
    if (!p.active || p.stock <= 0) return false;
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartItems = products
    .filter((p) => waCart[p.id] > 0)
    .map((p) => ({ product: p, qty: waCart[p.id] }));

  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleSendFullWhatsAppOrder = () => {
    if (cartItems.length === 0) return;
    let text = `Hola *${businessName}*, me gustaría realizar el siguiente pedido:\n\n`;
    text += `Cliente: ${customerName || 'Visitante'}\n`;
    text += `Modalidad: ${orderType}\n`;
    text += `-------------------------\n`;
    cartItems.forEach((item) => {
      text += `- ${item.qty}x ${item.product.name} ($${item.product.price * item.qty})\n`;
    });
    text += `-------------------------\n`;
    text += `*Total estimado: $${cartTotal.toLocaleString('es-MX')} MXN*\n\n`;
    text += `Quedo atento a su confirmación.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReserveRoomWhatsApp = (room: Room) => {
    let text = `Hola *${businessName}*, deseo consultar disponibilidad y reservar hospedaje:\n\n`;
    text += `Unidad: *${room.name}* (${room.type})\n`;
    text += `Tarifa: $${room.pricePerNight} MXN / noche\n`;
    text += `Llegada: ${checkIn}\n`;
    text += `Salida: ${checkOut}\n`;
    text += `Huéspedes: ${guests} persona(s)\n`;
    text += `Titular: ${customerName || 'Interesado'}\n\n`;
    text += `Por favor indíquenme cómo confirmar el anticipo.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const tabs = standalone
    ? ([
        { id: 'menu', label: 'Carta Digital', icon: Utensils },
        { id: 'hospedaje', label: 'Cabañas y Cuartos', icon: BedDouble },
      ] as const)
    : ([
        { id: 'menu', label: 'Carta Digital', icon: Utensils },
        { id: 'hospedaje', label: 'Cabañas', icon: BedDouble },
        { id: 'qr', label: 'Código QR', icon: QrCode },
      ] as const);

  return (
    <div
      className={
        standalone
          ? 'h-[100dvh] w-full bg-[#FAF8F5] flex flex-col overflow-hidden'
          : 'fixed inset-0 h-[100dvh] z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-hidden'
      }
    >
      <div
        className={
          standalone
            ? 'bg-[#FAF8F5] w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0 shadow-xl border-x border-slate-200 overflow-hidden'
            : 'bg-[#FAF8F5] sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92dvh] min-h-0 border border-slate-200'
        }
      >
        {/* Hero Costeño Mobile-First */}
        <div className="relative bg-[#0B3954] text-white p-4 sm:p-6 shrink-0">
          {standalone ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-sky-100 touch-press"
            >
              Acceso Staff
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white touch-press"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 pr-16">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-[#0B3954] flex items-center justify-center shadow-lg shrink-0">
              <Compass className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-amber-300">
                Menú Digital y Reservas
              </span>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-white leading-tight mt-0.5 truncate">
                {businessName}
              </h2>
              <p className="text-[11px] sm:text-sm text-sky-200 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {config?.address}, {config?.municipio}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex flex-wrap gap-2 text-[11px] text-sky-100">
            {config?.wifiName && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                <Wifi className="w-3.5 h-3.5 text-amber-400" />
                Wi-Fi: {config.wifiName} ({config.wifiPassword})
              </span>
            )}
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg hover:bg-white/20"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              {phone}
            </a>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-200 bg-white shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 touch-press ${
                  activeTab === tab.id
                    ? 'text-[#0B3954] border-b-2 border-[#0B3954] bg-sky-50/40'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido */}
        <div className="p-3.5 sm:p-5 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4 pb-8">
          {activeTab === 'menu' && (
            <>
              {/* Buscador + Categorías swipeables para smartphone */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar platillo, marisco o bebida..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                  />
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
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </HorizontalScroller>
              </div>

              {/* Tarjetas horizontales compactas en móvil, grid fotográfico en tablet/PC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableProducts.map((p) => {
                  const qty = waCart[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-row sm:flex-col justify-between"
                    >
                      <div className="w-28 sm:w-full h-auto sm:h-32 bg-slate-100 relative shrink-0">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Utensils className="w-7 h-7" />
                          </div>
                        )}
                        <span className="hidden sm:inline-block absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#0B3954]/90 text-white text-xs font-extrabold">
                          ${p.price} MXN
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                              {p.name}
                            </h4>
                            <span className="sm:hidden font-extrabold text-sm text-[#0B3954] shrink-0">
                              ${p.price}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-2.5">
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => updateCart(p.id, 1)}
                              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-[#0B3954] hover:text-white text-slate-800 text-xs font-bold flex items-center justify-center gap-1 touch-press"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agregar</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => updateCart(p.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white text-slate-800 flex items-center justify-center shadow-2xs touch-press"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-extrabold text-[#0B3954]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCart(p.id, 1)}
                                className="w-8 h-8 rounded-lg bg-[#0B3954] text-white flex items-center justify-center shadow-2xs touch-press"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'hospedaje' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-600 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#087E8B]" /> Llegada
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#087E8B]" /> Salida
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Huéspedes</label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center touch-press"
                      aria-label="Disminuir huéspedes"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(15, g + 1))}
                      className="w-8 h-8 rounded-lg bg-[#0B3954] text-white flex items-center justify-center touch-press"
                      aria-label="Aumentar huéspedes"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Tu Nombre</label>
                  <input
                    type="text"
                    placeholder="Titular"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-36 w-full bg-slate-100 relative">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BedDouble className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 text-[#0B3954] text-[10px] font-extrabold uppercase">
                          {r.type}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {r.name}
                          </h4>
                          <span className="font-extrabold text-sm text-[#087E8B] shrink-0">
                            ${r.pricePerNight} / noche
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Capacidad hasta {r.capacity} personas.
                        </p>
                        {r.amenities && r.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {r.amenities.map((am) => (
                              <span
                                key={am}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                              >
                                {am}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <button
                        type="button"
                        onClick={() => handleReserveRoomWhatsApp(r)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 touch-press"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Reservar por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qr' && !standalone && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4 max-w-md mx-auto">
              <h4 className="font-display text-xl font-bold text-slate-900">
                Código QR para Mesas y Ramadas
              </h4>
              <p className="text-xs text-slate-500">
                Al escanear este código desde un celular, el comensal entra directo a la carta
                digital y pedidos por WhatsApp sin pantalla de acceso.
              </p>

              <div className="p-5 bg-white rounded-2xl border-4 border-[#0B3954] inline-block mx-auto">
                <QRCodeSVG
                  value={publicMenuUrl}
                  size={210}
                  bgColor="#ffffff"
                  fgColor="#0B3954"
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-xs font-bold text-slate-700">{businessName}</p>
              <p className="text-[11px] font-mono text-slate-500 break-all bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                {publicMenuUrl}
              </p>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 touch-press"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Señalética QR</span>
              </button>
            </div>
          )}
        </div>

        {/* Barra inferior fija de Carrito WhatsApp optimizada para Smartphones */}
        {activeTab === 'menu' && cartItems.length > 0 && (
          <div className="bg-[#0B3954] text-white p-3.5 sm:px-5 border-t border-white/10 shadow-2xl space-y-2.5 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-sky-200"
              />
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
              >
                <option className="text-slate-900" value="En Ramada / Mesa">
                  En Ramada / Mesa
                </option>
                <option className="text-slate-900" value="Para Llevar">
                  Para Llevar
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSendFullWhatsAppOrder}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 touch-press shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                Pedir por WhatsApp ({cartCount}) · ${cartTotal.toLocaleString('es-MX')} MXN
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
