import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Sencilla', 'Doble', 'Familiar', 'Cabaña Frente al Mar'],
      required: true,
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['libre', 'ocupada', 'limpieza', 'reservada'],
      default: 'libre',
    },
    guestName: { type: String, default: '' },
    guestPhone: { type: String, default: '' },
    checkInDate: { type: String, default: '' },
    checkOutDate: { type: String, default: '' },
    capacity: { type: Number, default: 2 },
    imageUrl: { type: String, default: '' },
    amenities: [{ type: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

roomSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Room = mongoose.model('Room', roomSchema);
