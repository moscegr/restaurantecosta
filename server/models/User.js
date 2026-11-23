import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'cajero', 'mesero', 'cocina', 'recepcion'],
      required: true,
    },
    pinHash: { type: String, required: true },
    active: { type: Boolean, default: true },
    shift: { type: String, default: 'Matutino / Vespertino' },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.pinHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
