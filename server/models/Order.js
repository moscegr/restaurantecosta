import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    station: { type: String, enum: ['cocina', 'barra', 'fria'], default: 'cocina' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    folio: { type: String, required: true, unique: true },
    tableOrRamada: { type: String, required: true },
    guestCount: { type: Number, default: 2, min: 1 },
    waiterId: { type: String, default: '' },
    waiterName: { type: String, default: 'Caja Directa' },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    tip: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    costTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cobrado', 'cancelado'],
      default: 'pendiente',
    },
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'tarjeta', 'transferencia', ''],
      default: '',
    },
    amountPaid: { type: Number, default: 0 },
    change: { type: Number, default: 0 },
    dateString: { type: String, required: true }, // YYYY-MM-DD
    notes: { type: String, default: '' },
    paidAt: { type: Date },
    invoiceData: {
      rfc: { type: String, default: '' },
      razonSocial: { type: String, default: '' },
      usoCfdi: { type: String, default: 'G03 - Gastos en general' },
      email: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model('Order', orderSchema);
