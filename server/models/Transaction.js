import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    dateString: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ['ingreso', 'egreso'], required: true },
    category: {
      type: String,
      enum: [
        'Pescado y Marisco Fresco',
        'Hielo y Bebidas',
        'Carbón y Leña',
        'Gas',
        'Abarrotes y Verduras',
        'Mantenimiento e Higiene',
        'Nómina / Propinas',
        'Venta POS',
        'Hospedaje',
        'Otro',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'tarjeta', 'transferencia'],
      default: 'efectivo',
    },
    referenceId: { type: String, default: '' },
    userName: { type: String, default: 'Sistema' },
  },
  { timestamps: true }
);

transactionSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
