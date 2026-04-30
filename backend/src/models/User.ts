import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IUser>('User', userSchema);