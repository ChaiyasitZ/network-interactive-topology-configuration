import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Router, Server, SwitchCamera } from 'lucide-react';
import { motion } from 'framer-motion';

export type DeviceData = {
  label: string;
  type: 'router' | 'switch' | 'server';
  ip?: string;
  status?: 'online' | 'offline' | 'unreachable';
};

const CustomNode = ({ data, selected }: NodeProps<Node & { data: DeviceData }>) => {
  const getIcon = () => {
    switch (data.type) {
      case 'router':
        return <Router className="w-8 h-8 text-blue-600" />;
      case 'switch':
        return <SwitchCamera className="w-8 h-8 text-green-600" />;
      case 'server':
        return <Server className="w-8 h-8 text-gray-600" />;
      default:
        return <Router className="w-8 h-8 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'unreachable':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 flex flex-col items-center justify-center min-w-[120px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="absolute top-[-4px] right-[-4px] w-3 h-3 rounded-full border border-white z-10">
        <div className={`w-full h-full rounded-full ${getStatusColor()}`} />
      </div>
      
      {getIcon()}
      
      <div className="mt-2 text-center">
        <div className="font-bold text-sm text-gray-800">{data.label}</div>
        {data.ip && <div className="text-xs text-gray-500">{data.ip}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </motion.div>
  );
};

export default CustomNode;