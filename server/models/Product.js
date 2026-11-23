import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Especialidades del Mar',
        'Pescados y Mariscos',
        'Bebidas y Chilate',
        'Botanas y Antojitos',
        'Postres y Cocos',
      ],
      required: true,
    },
    station: {
      type: String,
      enum: ['cocina', 'barra', 'fria'],
      default: 'cocina',
    },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5, min: 0 },
    unit: {
      type: String,
      enum: ['pza', 'orden', 'kg', 'vaso', 'plato', 'bolsa'],
      default: 'orden',
    },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model('Product', productSchema);
