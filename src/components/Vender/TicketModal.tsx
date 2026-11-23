import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  MessageCircle,
  Check,
  X,
  Compass,
} from 'lucide-react';
import type { BusinessConfig, Order } from '../../types';
import { generateInvoicePDF, printThermalTicket } from '../../services/pdfService';

interface TicketModalProps {
  order: Order | null;
  config: BusinessConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  order,
  config,
  isOpen,
  onClose,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    config?.thermalPaperWidth || '80mm'
  );

  if (!isOpen || !order) return null;

  const handleSendWhatsApp = () => {
    const businessName = config?.businessName || 'Ramada & Cabañas Las Brisas';
    let text = `*${businessName}*\n`;
    text += `${config?.address || 'Playa Ventura'}, ${config?.municipio || 'Copala'}, Guerrero\n`;
    text += `Folio: ${order.folio}\n`;
    text += `Ubicación: ${order.tableOrRamada}\n`;
    text += `----------------------------\n`;
    order.items.forEach((item) => {
      text += `${item.quantity}x ${item.name} - $${item.subtotal.toFixed(2)}\n`;
    });
    text += `----------------------------\n`;
    if (order.tip > 0) text += `Propina: $${order.tip.toFixed(2)}\n`;
    text += `*TOTAL: $${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*\n`;
    text += `Pago: ${(order.paymentMethod || 'Efectivo').toUpperCase()}\n`;
    text += `Gracias por su visita.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        {/* Banner Éxito */}
        <div className="bg-emerald-600 text-white p-5 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white touch-press"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <h3 className="text-lg font-extrabold">Venta Registrada con Éxito</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Inventario descontado e ingreso reflejado en Finanzas.
          </p>
        </div>

        {/* Vista previa de Ticket Térmico */}
        <div className="p-5 bg-[#FAF8F5] text-slate-800 font-mono text-xs space-y-2.5 border-y border-dashed border-slate-300">
          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 font-sans font-extrabold text-sm text-[#0B3954]">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>{config?.businessName || 'Ramada & Cabañas Las Brisas'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {config?.address}, {config?.municipio}, {config?.state}
            </p>
            {config?.rfc && <p className="text-[10px] text-slate-500">RFC: {config.rfc}</p>}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Folio:</span>
              <span className="font-bold">{order.folio}</span>
            </div>
            <div className="flex justify-between">
              <span>Mesa / Destino:</span>
              <span className="font-bold">{order.tableOrRamada}</span>
            </div>
            <div className="flex justify-between">
              <span>Atendió:</span>
              <span>{order.waiterName}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-2">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold shrink-0">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-slate-800 pt-2 space-y-1 font-sans">
            {order.tip > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Propina:</span>
                <span>${order.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900">
              <span>TOTAL MXN:</span>
              <span className="text-[#0B3954]">
                ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-mono">
              <span>Pago ({(order.paymentMethod || 'efectivo').toUpperCase()}):</span>
              <span>
                Recibido ${order.amountPaid.toFixed(2)} · Cambio ${order.change.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Impresión Térmica y Factura PDF */}
        <div className="p-4 bg-white space-y-3">
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Ancho impresora térmica:</span>
            <div className="flex gap-1.5">
              {(['58mm', '80mm'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPaperWidth(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold touch-press ${
                    paperWidth === w
                      ? 'bg-[#0B3954] text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => printThermalTicket(order, config, 'cliente', paperWidth)}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Printer className="w-4 h-4 text-[#0B3954]" />
              <span>Ticket {paperWidth}</span>
            </button>

            <button
              type="button"
              onClick={() => generateInvoicePDF(order, config)}
              className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 touch-press shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              <span>Factura PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-3 bg-[#0B3954] hover:bg-[#082C42] text-white rounded-xl font-extrabold text-xs touch-press"
            >
              Nueva Operación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
