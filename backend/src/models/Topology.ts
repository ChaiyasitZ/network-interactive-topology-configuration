import mongoose, { Document, Schema } from 'mongoose';

export interface ITopology extends Document {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt: Date;
  updatedAt: Date;
}

const topologySchema = new Schema<ITopology>(
  {
    name: { type: String, required: true },
    description: { type: String },
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ITopology>('Topology', topologySchema);