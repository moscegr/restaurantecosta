import React, { useState } from 'react';
import { X, Phone, Calendar, Check, Sparkles } from 'lucide-react';
import type { Room } from '../../types';
import { db } from '../../db/db';

interface RoomModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !room) return null;

  const [guestName, setGuestName] = useState(room.guestName || '');
  const [guestPhone, setGuestPhone] = useState(room.guestPhone || '');
  const [nights, setNights] = useState<number>(1);
  const [chargeNow, setChargeNow] = useState<boolean>(true);
  const [notes, setNotes] = useState(room.notes || '');

  const totalCost = room.pricePerNight * nights;

  // Registrar Entrada (Check-In)
  const handleCheckIn = async () => {
    if (!guestName.trim()) {
      alert('Por favor escribe el nombre del huésped.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + nights * 24 * 3600000).toISOString().split('T')[0];

    await db.transaction('rw', [db.rooms, db.transactions], async () => {
      await db.rooms.update(room.id!, {
        status: 'ocupada',
        guestName,
        guestPhone,
        checkInDate: todayStr,
        checkOutDate: checkOut,
        notes,
      });

      // Si se cobra de inmediato, registrar el ingreso en Dinero/Caja
      if (chargeNow) {
        await db.transactions.add({
          date: new Date().toISOString(),
          dateString: todayStr,
          type: 'ingreso',
          category: 'Hospedaje',
          amount: totalCost,
          description: `Hospedaje: ${room.name} (${nights} noche/s) - ${guestName}`,
          paymentMethod: 'efectivo',
        });
      }
    });

    onUpdate();
    onClose();
  };

  // Registrar Salida (Check-Out) -> Pasa a Limpieza
  const handleCheckOut = async () => {
    await db.rooms.update(room.id!, {
      status: 'limpieza',
      guestName: '',
      guestPhone: '',
      checkInDate: undefined,
      checkOutDate: undefined,
      notes: 'Limpieza pendiente tras salida de huésped',
    });
    onUpdate();
    onClose();
  };

  // Terminar Limpieza -> Pasa a Libre
  const handleFinishCleaning = async () => {
    await db.rooms.update(room.id!, {
      status: 'libre',
      notes: '',
    });
    onUpdate();
    onClose();
  };

  // Marcar como Reservada
  const handleReserve = async () => {
    if (!guestName.trim()) {
      alert('Por favor escribe el nombre del interesado.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    await db.rooms.update(room.id!, {
      status: 'reservada',
      guestName,
      guestPhone,
      notes: notes || 'Reservación confirmada',
      checkInDate: todayStr,
    });
    onUpdate();
    onClose();
  };

  // Liberar cuarto
  const handleSetFree = async () => {
    await db.rooms.update(room.id!, {
      status: 'libre',
      guestName: '',
      guestPhone: '',
      notes: '',
    });
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-cyan-900 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-cyan-950 flex items-center justify-center font-black">
              {room.number}
            </div>
            <div>
              <h3 className="text-lg font-black">{room.name}</h3>
              <p className="text-xs text-teal-200">
                {room.type} · ${room.pricePerNight} MXN / noche · Capacidad {room.capacity} pers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* ESTADO ACTUAL */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Estado Actual:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                room.status === 'libre'
                  ? 'bg-emerald-100 text-emerald-800'
                  : room.status === 'ocupada'
                  ? 'bg-cyan-100 text-cyan-900'
                  : room.status === 'limpieza'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {room.status}
            </span>
          </div>

          {/* SI ESTÁ OCUPADA */}
          {room.status === 'ocupada' && (
            <div className="space-y-3">
              <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-200 space-y-2 text-xs">
                <p className="font-bold text-cyan-950 text-sm">
                  Huésped: {room.guestName || 'Sin registrar'}
                </p>
                {room.guestPhone && (
                  <p className="text-cyan-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Tel: {room.guestPhone}
                  </p>
                )}
                {room.notes && (
                  <p className="text-slate-600 bg-white p-2 rounded-lg border border-cyan-100">
                    Notas: {room.notes}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckOut}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-cyan-950 font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 touch-press"
              >
                <span>Registrar Salida (Check-Out)</span>
                <span className="text-xs font-normal">➔ Pasa a Limpieza</span>
              </button>
            </div>
          )}

          {/* SI ESTÁ EN LIMPIEZA */}
          {room.status === 'limpieza' && (
            <div className="space-y-3 text-center py-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Este cuarto requiere limpieza y cambio de sábanas.
              </p>
              <button
                type="button"
                onClick={handleFinishCleaning}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 touch-press"
              >
                <Check className="w-5 h-5" />
                <span>Marcar Limpio y Disponible</span>
              </button>
            </div>
          )}

          {/* SI ESTÁ LIBRE O RESERVADA: FORMULARIO DE CHECK-IN / RESERVA */}
          {(room.status === 'libre' || room.status === 'reservada') && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Nombre del Huésped / Titular *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Familia Rodríguez o Juan Pérez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="744 123 4567"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Noches
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-200 font-black text-slate-700"
                    >
                      -
                    </button>
                    <span className="font-black text-sm text-slate-800 flex-1 text-center">
                      {nights}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNights(nights + 1)}
                      className="w-8 h-8 rounded-lg bg-cyan-100 font-black text-cyan-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Notas / Requerimientos
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cuna extra, toallas adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              {/* Opción de cobro */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-900 block">
                    Cobro por {nights} {nights === 1 ? 'noche' : 'noches'}:
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    ${totalCost.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={chargeNow}
                    onChange={(e) => setChargeNow(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Cobrar y registrar en Caja</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md touch-press flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Ocupar Ahora (Check-In)</span>
                </button>

                <button
                  type="button"
                  onClick={handleReserve}
                  className="py-3 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md touch-press flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
          {room.status !== 'libre' && (
            <button
              type="button"
              onClick={handleSetFree}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Forzar estado a Libre
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
