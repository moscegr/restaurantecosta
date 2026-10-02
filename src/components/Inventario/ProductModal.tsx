import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { db } from '../../db/db';

interface ProductModalProps {
  productToEdit?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Especialidades del Mar',
  'Pescados y Mariscos',
  'Bebidas y Chilate',
  'Botanas y Antojitos',
  'Postres y Cocos',
];

const PRESET_ICONS = [
  '🐟', '🦐', '🦞', '🐙', '🍸', '🥣', 
  '🍲', '🥗', '🌮', '🧉', '🥥', '🍺', 
  '🍹', '🥤', '🧊', '🥧', '🍌', '🥩'
];

export const ProductModal: React.FC<ProductModalProps> = ({
  productToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Especialidades del Mar');
  const [price, setPrice] = useState<number>(150);
  const [costPrice, setCostPrice] = useState<number>(60);
  const [stock, setStock] = useState<number>(20);
  const [minStock, setMinStock] = useState<number>(8);
  const [unit, setUnit] = useState<'pza' | 'orden' | 'kg' | 'vaso' | 'plato' | 'bolsa'>('orden');
  const [icon, setIcon] = useState('🐟');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setCostPrice(productToEdit.costPrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setUnit(productToEdit.unit as any);
      setIcon(productToEdit.icon);
      setDescription(productToEdit.description || '');
    } else {
      setName('');
      setCategory('Especialidades del Mar');
      setPrice(150);
      setCostPrice(60);
      setStock(20);
      setMinStock(8);
      setUnit('orden');
      setIcon('🐟');
      setDescription('');
    }
  }, [productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor escribe el nombre del platillo o producto.');
      return;
    }

    try {
      const productData: Product = {
        name: name.trim(),
        category,
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        minStock: Number(minStock) || 0,
        unit,
        icon,
        description: description.trim(),
        active: true,
      };

      if (productToEdit && productToEdit.id) {
        await db.products.update(productToEdit.id, productData);
      } else {
        await db.products.add(productData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Hubo un error al guardar el producto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-cyan-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-1 bg-white/10 rounded-xl">{icon}</span>
            <div>
              <h3 className="text-lg font-black leading-tight">
                {productToEdit ? 'Editar Producto o Platillo' : 'Agregar Nuevo Platillo o Producto'}
              </h3>
              <p className="text-xs text-teal-200">
                Se agregará al Punto de Venta, Inventario y Menú Digital
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Nombre */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nombre del Platillo / Bebida / Insumo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Tacos de Pescado al Pastor o Coctel de Ostión"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Categoría y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Unidad de Venta *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              >
                <option value="orden">orden</option>
                <option value="plato">plato</option>
                <option value="kg">kg (kilo)</option>
                <option value="pza">pza (pieza)</option>
                <option value="vaso">vaso</option>
                <option value="bolsa">bolsa</option>
              </select>
            </div>
          </div>

          {/* Selector de Icono / Emoji rápido para pantallas táctiles */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Icono / Emoji Representativo
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition-all touch-press ${
                    icon === emoji
                      ? 'bg-amber-400 text-cyan-950 scale-110 shadow-sm border border-amber-500'
                      : 'hover:bg-slate-200/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Precios: Venta y Costo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <label className="font-extrabold text-emerald-900 block text-xs mb-1">
                Precio de Venta ($ MXN) *
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-emerald-700 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full text-lg font-black text-emerald-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-600 block text-xs mb-1">
                Costo Insumo ($ MXN)
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full text-lg font-black text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Control de Stock para el Semáforo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Stock Inicial ({unit})
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Stock Mínimo (Alerta)
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>
          </div>

          {/* Descripción para el Menú Digital */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Descripción / Ingredientes (Visible en menú de comensales)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Servido con arroz blanco, ensalada fresca y frijolitos negros con tortillas calientes."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Agregar Platillo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
