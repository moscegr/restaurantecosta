import React, { useState } from 'react';
import { 
  X, MessageCircle, QrCode, Utensils, BedDouble, 
  MapPin, Phone, Wifi, Compass, Printer 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Product, Room, BusinessConfig } from '../../types';

interface SitioPublicoModalProps {
  products: Product[];
  rooms: Room[];
  config: BusinessConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SitioPublicoModal: React.FC<SitioPublicoModalProps> = ({
  products,
  rooms,
  config,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'menu' | 'hospedaje' | 'qr'>('menu');

  const businessName = config?.businessName || 'Ramada & Cabañas Las Brisas';
  const phone = config?.phone || '741 123 4567';
  const whatsappNumber = config?.whatsapp?.replace(/\D/g, '') || '527411234567';
  const shareUrl = window.location.href;

  const handleOrderWhatsApp = (dishName: string, price: number) => {
    const text = encodeURIComponent(
      `¡Hola! Estoy en ${businessName} y me gustaría ordenar:\n• 1x *${dishName}* ($${price} MXN)\n¿Me lo podrían preparar por favor? 🌴`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handleReserveWhatsApp = (roomName: string, price: number) => {
    const text = encodeURIComponent(
      `¡Hola ${businessName}! Me interesa reservar la cabaña *${roomName}* ($${price} MXN/noche). ¿Tienen disponibilidad para este fin de semana? 🌊`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-50 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-cyan-500/20">
        {/* Banner Hero Costeño */}
        <div className="relative bg-gradient-to-r from-cyan-900 via-teal-800 to-amber-700 text-white p-5 sm:p-6 select-none">
          <div className="absolute top-2 right-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-cyan-950 flex items-center justify-center font-black shadow-xl border-2 border-white/40">
              <Compass className="w-8 h-8 text-cyan-950" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 bg-black/20 px-2 py-0.5 rounded-full">
                Vista Pública del Comensal
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                {businessName}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{config?.address}, {config?.municipio}, Gro.</span>
              </p>
            </div>
          </div>

          {/* Datos Rápidos: WiFi y Teléfono */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-3 text-xs text-teal-100">
            {config?.wifiName && (
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Wifi className="w-3.5 h-3.5 text-amber-300" /> WiFi: {config.wifiName} ({config.wifiPassword})
              </span>
            )}
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Phone className="w-3.5 h-3.5 text-amber-300" /> Tel: {phone}
            </span>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'menu'
                ? 'text-cyan-900 border-b-2 border-cyan-800 bg-cyan-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menú Digital ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hospedaje')}
            className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'hospedaje'
                ? 'text-cyan-900 border-b-2 border-cyan-800 bg-cyan-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Cabañas & Cuartos ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr'
                ? 'text-cyan-900 border-b-2 border-cyan-800 bg-cyan-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Código QR de Mesas</span>
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* 1. MENÚ DIGITAL */}
          {activeTab === 'menu' && (
            <div className="space-y-3">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>🌴 Pide directamente a tu mesero o pulsa el botón para pedir por WhatsApp.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.filter(p => p.active).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-3xl">{p.icon}</span>
                        <span className="text-base font-black text-cyan-900">
                          ${p.price} MXN
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-2">
                        {p.name}
                      </h4>
                      {p.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleOrderWhatsApp(p.name, p.price)}
                      className="mt-3 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 touch-press"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pedir por WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CABAÑAS & HOSPEDAJE */}
          {activeTab === 'hospedaje' && (
            <div className="space-y-3">
              <div className="bg-cyan-50 p-3 rounded-2xl border border-cyan-200 text-xs text-cyan-900">
                🌊 Cabañas frente a las playas de Copala y Marquelia con hamacas, brisa marina y tranquilidad garantizada.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {r.type}
                        </span>
                        <span className="text-base font-black text-cyan-900">
                          ${r.pricePerNight} / noche
                        </span>
                      </div>
                      <h4 className="font-black text-base text-slate-900 mt-2">
                        {r.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Capacidad para hasta {r.capacity} personas. Baño completo, ventilador o aire, frente a la playa.
                      </p>
                    </div>

                    <button
                      onClick={() => handleReserveWhatsApp(r.name, r.pricePerNight)}
                      className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow touch-press"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Reservar Cabaña por WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CÓDIGO QR */}
          {activeTab === 'qr' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-sm mx-auto">
              <div>
                <h4 className="font-black text-lg text-slate-900">
                  Código QR para tus Mesas y Ramadas
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Imprímelo y colócalo en acrílicos o en las palapas para que tus clientes escaneen el menú.
                </p>
              </div>

              {/* Contenedor del QR */}
              <div className="p-4 bg-white rounded-2xl border-4 border-cyan-800 shadow-inner inline-block mx-auto">
                <QRCodeSVG
                  value={shareUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0e7490"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-xl">
                {businessName} · Menú Digital
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow touch-press"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir QR</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Volver a Administración del Sistema
          </button>
        </div>
      </div>
    </div>
  );
};
