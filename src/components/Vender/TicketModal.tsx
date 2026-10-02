import React from 'react';
import { Printer, MessageCircle, Check, X, Compass } from 'lucide-react';
import type { Sale, BusinessConfig } from '../../types';

interface TicketModalProps {
  sale: Sale | null;
  config: BusinessConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  sale,
  config,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const businessName = config?.businessName || 'Ramada & Cabañas Las Brisas';
    let text = `🌊 *${businessName}* 🌊\n`;
    text += `📍 ${config?.address || 'Playa Ventura, Copala, Gro.'}\n`;
    text += `🗓️ Fecha: ${sale.dateString} - ${new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `🎯 Destino: ${sale.destination}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    sale.items.forEach(item => {
      text += `• ${item.quantity}x ${item.name} - $${item.subtotal}\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*TOTAL: $${sale.total.toLocaleString('es-MX')} MXN*\n`;
    text += `💳 Pago: ${sale.paymentMethod.toUpperCase()}`;
    if (sale.paymentMethod === 'efectivo') {
      text += ` (Pagó: $${sale.amountPaid} | Cambio: $${sale.change})\n`;
    } else {
      text += `\n`;
    }
    text += `¡Muchas gracias por su visita a la Costa Chica! 🌴\n`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        {/* Banner de éxito */}
        <div className="bg-emerald-600 text-white p-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-white active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <h3 className="text-xl font-black">¡Venta Registrada!</h3>
          <p className="text-xs text-emerald-100 font-medium">
            Inventario descontado y registrado en Dinero del día.
          </p>
        </div>

        {/* Representación de Ticket Térmico 58/80mm */}
        <div className="p-5 bg-amber-50/40 text-slate-800 font-mono text-xs space-y-3 border-y border-dashed border-slate-300 print:p-0 print:border-none">
          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 font-bold text-sm text-cyan-900">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>{config?.businessName || 'Ramada & Cabañas Las Brisas'}</span>
            </div>
            <p className="text-[11px] text-slate-500">{config?.tagline}</p>
            <p className="text-[10px] text-slate-400">
              {config?.address}, {config?.municipio}, Guerrero
            </p>
            {config?.rfc && <p className="text-[10px] text-slate-400">RFC: {config.rfc}</p>}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Folio Venta: #{sale.id || 'NUEVA'}</span>
              <span>{new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha: {sale.dateString}</span>
              <span className="font-bold text-cyan-800">{sale.destination}</span>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5">
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <span className="font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold shrink-0 ml-2">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t-2 border-slate-800 pt-2 space-y-1 font-sans">
            <div className="flex justify-between text-base font-black text-slate-900">
              <span>TOTAL:</span>
              <span className="text-cyan-800">${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-mono">
              <span>Método:</span>
              <span className="uppercase font-bold">{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === 'efectivo' && (
              <>
                <div className="flex justify-between text-xs text-slate-600 font-mono">
                  <span>Recibido:</span>
                  <span>${sale.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-700 font-mono">
                  <span>Cambio:</span>
                  <span>${sale.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 text-center text-[10px] text-slate-400">
            ¡Gracias por apoyar el comercio local de la Costa Chica! 🌴
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-3 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-center gap-1.5 shadow-sm touch-press"
            >
              <Printer className="w-4 h-4 text-cyan-700" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm touch-press"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-cyan-800 hover:bg-cyan-900 text-white rounded-xl font-black text-sm shadow-md touch-press"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};
