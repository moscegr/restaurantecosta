import React, { useState } from 'react';
import { X, PackagePlus, Check } from 'lucide-react';
import type { Product, ExpenseCategory } from '../../types';
import { db } from '../../db/db';

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
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<number>(
    product?.id || allProducts[0]?.id || 0
  );
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(product?.costPrice || 20);
  const [recordExpense, setRecordExpense] = useState<boolean>(true);
  const [supplierNotes, setSupplierNotes] = useState<string>('Compra a proveedor local');

  const selectedProduct = allProducts.find(p => p.id === selectedProductId) || product;
  const totalCost = (unitCost * quantity) || 0;

  const handleConfirmRestock = async () => {
    if (!selectedProduct || !selectedProduct.id || quantity <= 0) {
      alert('Por favor selecciona un producto y una cantidad válida.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      await db.transaction('rw', [db.products, db.transactions], async () => {
        // 1. Actualizar existencias en la tabla de productos
        const newStock = selectedProduct.stock + quantity;
        await db.products.update(selectedProduct.id!, {
          stock: newStock,
          costPrice: unitCost,
        });

        // 2. Si se marcó registrar gasto en Caja, añadir transacción
        if (recordExpense && totalCost > 0) {
          let expenseCat: ExpenseCategory = 'Otro';
          const nameLower = selectedProduct.name.toLowerCase();
          if (nameLower.includes('pescado') || nameLower.includes('marisco') || nameLower.includes('camar') || nameLower.includes('langosta')) {
            expenseCat = 'Pescado y Marisco Fresco';
          } else if (nameLower.includes('hielo') || nameLower.includes('cerveza') || nameLower.includes('refresco')) {
            expenseCat = 'Hielo y Bebidas';
          } else if (nameLower.includes('carbón') || nameLower.includes('leña')) {
            expenseCat = 'Carbón y Leña';
          } else {
            expenseCat = 'Abarrotes y Verduras';
          }

          await db.transactions.add({
            date: nowIso,
            dateString: todayStr,
            type: 'egreso',
            category: expenseCat,
            amount: totalCost,
            description: `Compra inventario: +${quantity} ${selectedProduct.unit} de ${selectedProduct.name} (${supplierNotes})`,
            paymentMethod: 'efectivo',
          });
        }
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al registrar compra de inventario:', err);
      alert('Hubo un error al registrar la compra.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-cyan-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="text-lg font-black leading-tight">
                Entrada de Mercancía / Compra
              </h3>
              <p className="text-xs text-teal-200">
                Aumenta existencias y descuenta de caja en un toque
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
          {/* Seleccionar Producto */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Producto a Reabastecer *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedProductId(id);
                const found = allProducts.find(p => p.id === id);
                if (found) setUnitCost(found.costPrice);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            >
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} (Actual: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad y Costo Unitario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Cantidad que entra ({selectedProduct?.unit || 'pza'})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  className="w-9 h-9 rounded-xl bg-slate-100 font-black text-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 5)}
                  className="w-9 h-9 rounded-xl bg-cyan-100 font-black text-cyan-800"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Costo Unitario ($ MXN)
              </label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>
          </div>

          {/* Notas de proveedor */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Proveedor / Notas
            </label>
            <input
              type="text"
              placeholder="Ej. Pescador Don Manuel, Camión del hielo..."
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Registro de Egreso en Dinero */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Total de la compra:
                </span>
                <span className="text-xl font-black text-amber-800">
                  ${totalCost.toLocaleString('es-MX')} MXN
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                <input
                  type="checkbox"
                  checked={recordExpense}
                  onChange={(e) => setRecordExpense(e.target.checked)}
                  className="w-4 h-4 text-cyan-700 rounded focus:ring-cyan-600"
                />
                <span>Restar de Caja automáticamente</span>
              </label>
            </div>
            <p className="text-[11px] text-amber-800/80">
              💡 Al activar esto, el egreso se refleja de inmediato en tu reporte para el contador (RESICO).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 font-bold text-xs sm:text-sm text-slate-700 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmRestock}
            className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 touch-press"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Entrada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
