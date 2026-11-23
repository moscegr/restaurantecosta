import React, { useState } from 'react';
import { X, Phone, Calendar, Check, Sparkles } from 'lucide-react';
import type { PaymentMethod, Room } from '../../types';
import { api } from '../../services/api';

interface RoomModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({ room, isOpen, onClose, onUpdate }) => {
  const [guestName, setGuestName] = useState(room?.guestName || '');
  const [guestPhone, setGuestPhone] = useState(room?.guestPhone || '');
  const [nights, setNights] = useState<number>(1);
  const [chargeNow, setChargeNow] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState(room?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !room) return null;

  const totalCost = room.pricePerNight * nights;

  const handleCheckIn = async () => {
    if (!guestName.trim()) {
      alert('Ingresa el nombre del huésped titular.');
      return;
    }
    try {
      setSaving(true);
      await api.checkInRoom(room.id, {
        guestName,
        guestPhone,
        nights,
        chargeNow,
        paymentMethod,
        notes,
      });
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async () => {
    await api.checkOutRoom(room.id);
    onUpdate();
    onClose();
  };

  const handleFinishCleaning = async () => {
    await api.updateRoom(room.id, { status: 'libre', notes: '' });
    onUpdate();
    onClose();
  };

  const handleReserve = async () => {
    if (!guestName.trim()) {
      alert('Ingresa el nombre de quien reserva.');
      return;
    }
    await api.updateRoom(room.id, {
      status: 'reservada',
      guestName,
      guestPhone,
      notes: notes || 'Reservación confirmada',
      checkInDate: new Date().toISOString().split('T')[0],
    });
    onUpdate();
    onClose();
  };

  const handleSetFree = async () => {
    await api.updateRoom(room.id, {
      status: 'libre',
      guestName: '',
      guestPhone: '',
      notes: '',
    });
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0B3954] flex items-center justify-center font-extrabold">
              {room.number}
            </div>
            <div>
              <h3 className="text-base font-extrabold">{room.name}</h3>
              <p className="text-xs text-sky-200">
                {room.type} · ${room.pricePerNight} MXN / noche · Hasta {room.capacity} huéspedes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Estado Actual</span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-200 text-slate-800">
              {room.status}
            </span>
          </div>

          {room.status === 'ocupada' && (
            <div className="space-y-3">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-1.5 text-xs">
                <p className="font-extrabold text-[#0B3954] text-sm">
                  Huésped: {room.guestName || 'Sin registrar'}
                </p>
                {room.guestPhone && (
                  <p className="text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {room.guestPhone}
                  </p>
                )}
                {room.notes && <p className="text-slate-600 pt-1">Notas: {room.notes}</p>}
              </div>

              <button
                type="button"
                onClick={handleCheckOut}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-sm touch-press"
              >
                Registrar Salida (Check-Out) y enviar a Limpieza
              </button>
            </div>
          )}

          {room.status === 'limpieza' && (
            <div className="space-y-3 text-center py-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Habitación en preparación y sanitización.
              </p>
              <button
                type="button"
                onClick={handleFinishCleaning}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 touch-press"
              >
                <Check className="w-5 h-5" />
                <span>Marcar Lista y Disponible</span>
              </button>
            </div>
          )}

          {(room.status === 'libre' || room.status === 'reservada') && (
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Huésped *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej. Familia Rodríguez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="744 123 4567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Noches</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-extrabold">{nights}</span>
                    <button
                      type="button"
                      onClick={() => setNights(nights + 1)}
                      className="w-10 h-10 rounded-xl bg-sky-100 text-[#0B3954] font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas de estancia</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Toallas extra, hora de llegada..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Total estancia ({nights} {nights === 1 ? 'noche' : 'noches'})
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800">
                      ${totalCost.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
                    <input
                      type="checkbox"
                      checked={chargeNow}
                      onChange={(e) => setChargeNow(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>Cobrar ahora</span>
                  </label>
                </div>

                {chargeNow && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => setPaymentMethod(pm)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold uppercase border ${
                          paymentMethod === pm
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleCheckIn}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
                >
                  <Check className="w-4 h-4" />
                  <span>Registrar Check-In</span>
                </button>
                <button
                  type="button"
                  onClick={handleReserve}
                  className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {room.status !== 'libre' ? (
            <button
              type="button"
              onClick={handleSetFree}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Liberar habitación
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
