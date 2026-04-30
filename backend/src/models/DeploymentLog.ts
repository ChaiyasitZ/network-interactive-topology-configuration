import mongoose, { Document, Schema } from 'mongoose';

export interface IDeploymentLog extends Document {
  topologyId?: mongoose.Types.ObjectId;
  deviceId: string;
  deviceHostname: string;
  status: 'success' | 'failed' | 'in_progress';
  terminalOutput: string;
  createdAt: Date;
}

const deploymentLogSchema = new Schema<IDeploymentLog>(
  {
    topologyId: { type: Schema.Types.ObjectId, ref: 'Topology' },
    deviceId: { type: String, required: true },
    deviceHostname: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed', 'in_progress'], required: true },
    terminalOutput: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IDeploymentLog>('DeploymentLog', deploymentLogSchema);