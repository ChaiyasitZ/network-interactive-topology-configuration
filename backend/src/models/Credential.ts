import mongoose, { Document, Schema } from 'mongoose';

export interface ICredential extends Document {
  profileName: string;
  username: string;
  passwordEncrypted: string; // We'll encrypt this before saving later
  deviceType: 'ios' | 'nexus' | 'linux';
  createdAt: Date;
  updatedAt: Date;
}

const credentialSchema = new Schema<ICredential>(
  {
    profileName: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    passwordEncrypted: { type: String, required: true },
    deviceType: { type: String, enum: ['ios', 'nexus', 'linux'], default: 'ios' },
  },
  { timestamps: true }
);

export default mongoose.model<ICredential>('Credential', credentialSchema);