import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import type { KitchenStation, Product, ProductCategory } from '../../types';
import { api } from '../../services/api';

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

const PRESET_PHOTOS = [
  {
    label: 'Pescado',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Camarones',
    url: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Ceviche',
    url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Bebida',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Antojito',
    url: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Postre',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
  },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  productToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Especialidades del Mar');
  const [station, setStation] = useState<KitchenStation>('cocina');
  const [price, setPrice] = useState<number>(150);
  const [costPrice, setCostPrice] = useState<number>(60);
  const [stock, setStock] = useState<number>(20);
  const [minStock, setMinStock] = useState<number>(8);
  const [unit, setUnit] = useState<'pza' | 'orden' | 'kg' | 'vaso' | 'plato' | 'bolsa'>('orden');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await api.uploadImage(file);
      setImageUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error subiendo fotografía.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setStation(productToEdit.station || 'cocina');
      setPrice(productToEdit.price);
      setCostPrice(productToEdit.costPrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setUnit(productToEdit.unit);
      setImageUrl(productToEdit.imageUrl || PRESET_PHOTOS[0].url);
      setDescription(productToEdit.description || '');
    } else {
      setName('');
      setCategory('Especialidades del Mar');
      setStation('cocina');
      setPrice(150);
      setCostPrice(60);
      setStock(20);
      setMinStock(8);
      setUnit('orden');
      setImageUrl(PRESET_PHOTOS[0].url);
      setDescription('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        category,
        station,
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        minStock: Number(minStock) || 0,
        unit,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        active: true,
      };

      if (productToEdit) {
        await api.updateProduct(productToEdit.id, payload);
      } else {
        await api.createProduct(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error guardando producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">
              {productToEdit ? 'Editar Producto o Platillo' : 'Agregar Nuevo Platillo'}
            </h3>
            <p className="text-xs text-sky-200">
              Se sincroniza con Caja POS, Comandero, Cocina KDS y Menú Digital.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Tacos de Pescado al Pastor"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Estación KDS</label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value as KitchenStation)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="cocina">Cocina / Brasas</option>
                <option value="fria">Barra Fría</option>
                <option value="barra">Bebidas / Barra</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unidad</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="orden">orden</option>
                <option value="plato">plato</option>
                <option value="kg">kg</option>
                <option value="pza">pza</option>
                <option value="vaso">vaso</option>
                <option value="bolsa">bolsa</option>
              </select>
            </div>
          </div>

          {/* Fotografía del Platillo */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#087E8B]" />
              <span>Imagen del Platillo (Subir archivo persistente o galería)</span>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <label className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-[#087E8B]/50 bg-sky-50/50 hover:bg-sky-50 text-[#0B3954] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer touch-press">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-[#087E8B]" />
                    <span>Subir foto desde dispositivo / cámara</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {PRESET_PHOTOS.map((ph) => (
                <button
                  key={ph.label}
                  type="button"
                  onClick={() => setImageUrl(ph.url)}
                  className={`relative h-12 rounded-xl overflow-hidden border-2 touch-press ${
                    imageUrl === ph.url ? 'border-[#0B3954] ring-2 ring-[#087E8B]/30' : 'border-slate-200'
                  }`}
                  title={ph.label}
                >
                  <img src={ph.url} alt={ph.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/uploads/... o https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <label className="text-xs font-bold text-emerald-900 block mb-1">
                Precio Venta ($ MXN)
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-lg font-extrabold text-emerald-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Costo Insumo ($ MXN)
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full text-lg font-extrabold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Stock Inicial</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Descripción para Menú Digital</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
