import mongoose from 'mongoose';

const businessConfigSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    tagline: { type: String, default: '' },
    ownerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    municipio: { type: String, enum: ['Copala', 'Marquelia'], default: 'Copala' },
    state: { type: String, default: 'Guerrero' },
    rfc: { type: String, default: '' },
    taxRegime: { type: String, default: '626 - Régimen Simplificado de Confianza (RESICO)' },
    ivaRate: { type: Number, default: 0.16 },
    wifiName: { type: String, default: '' },
    wifiPassword: { type: String, default: '' },
    currency: { type: String, default: 'MXN' },
    thermalPaperWidth: { type: String, enum: ['58mm', '80mm'], default: '80mm' },
    tables: {
      type: [String],
      default: [
        'Ramada 1 (Playa)',
        'Ramada 2 (Playa)',
        'Ramada 3 (Playa)',
        'Ramada 4 (Playa)',
        'Ramada 5 (Playa)',
        'Mesa 1 (Interior)',
        'Mesa 2 (Palapa)',
        'Mesa 3 (Palapa)',
        'Mesa 4 (Palapa)',
        'Barra Principal',
        'Para Llevar',
      ],
    },
  },
  { timestamps: true }
);

businessConfigSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const BusinessConfig = mongoose.model('BusinessConfig', businessConfigSchema);
