import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Check } from 'lucide-react';
import type { Product } from '../../types';
import { api } from '../../services/api';

interface RestockModalProps {
  product: Product | null;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  product,
  allProducts,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(20);
  const [recordExpense, setRecordExpense] = useState<boolean>(true);
  const [supplierNotes, setSupplierNotes] = useState<string>('Compra a proveedor local');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const target = product || allProducts[0];
      if (target) {
        setSelectedProductId(target.id);
        setUnitCost(target.costPrice);
      }
      setQuantity(10);
    }
  }, [isOpen, product, allProducts]);

  if (!isOpen) return null;

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId) || product;
  const totalCost = (unitCost * quantity) || 0;

  const handleConfirm = async () => {
    if (!selectedProduct || quantity <= 0) return;
    try {
      setSaving(true);
      await api.restockProduct(selectedProduct.id, {
        quantity,
        unitCost,
        recordExpense,
        supplierNotes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error registrando entrada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackagePlus className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-extrabold">Entrada de Mercancía / Compra</h3>
              <p className="text-xs text-sky-200">Actualiza existencias y registra egreso en caja</p>
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

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Producto a Reabastecer</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const found = allProducts.find((p) => p.id === e.target.value);
                if (found) setUnitCost(found.costPrice);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock actual: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Cantidad ({selectedProduct?.unit || 'pza'})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  className="w-10 h-10 rounded-xl bg-slate-100 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 5)}
                  className="w-10 h-10 rounded-xl bg-sky-100 text-[#0B3954] font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Costo Unitario ($ MXN)</label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Proveedor / Notas</label>
            <input
              type="text"
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">Total compra:</span>
              <span className="text-lg font-extrabold text-amber-950">
                ${totalCost.toLocaleString('es-MX')} MXN
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
              <input
                type="checkbox"
                checked={recordExpense}
                onChange={(e) => setRecordExpense(e.target.checked)}
                className="w-4 h-4 accent-[#0B3954] rounded"
              />
              <span>Descontar de Caja</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 font-bold text-xs text-slate-700 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-[#087E8B] hover:bg-[#066873] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 touch-press"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Confirmar Entrada'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
