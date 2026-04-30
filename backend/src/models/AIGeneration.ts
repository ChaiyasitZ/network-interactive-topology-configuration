import mongoose, { Document, Schema } from 'mongoose';

export interface IAIGeneration extends Document {
  prompt: string;
  topologyContext: Record<string, any>;
  aiOutput: string;
  createdAt: Date;
}

const aiGenerationSchema = new Schema<IAIGeneration>(
  {
    prompt: { type: String, required: true },
    topologyContext: { type: Schema.Types.Mixed, required: true },
    aiOutput: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAIGeneration>('AIGeneration', aiGenerationSchema);