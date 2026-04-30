'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  ReactFlowProvider,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useStore from '@/store/topologyStore';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'R1 (Core)', type: 'router', ip: '10.0.0.1', status: 'online' },
    position: { x: 250, y: 100 },
  },
  {
    id: '2',
    type: 'custom',
    data: { label: 'SW1 (Dist)', type: 'switch', ip: '10.0.0.2', status: 'offline' },
    position: { x: 100, y: 300 },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: 'SW2 (Dist)', type: 'switch', ip: '10.0.0.3', status: 'unreachable' },
    position: { x: 400, y: 300 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', data: { label: 'Gi0/1 - Fa0/1' } },
  { id: 'e1-3', source: '1', target: '3', type: 'custom', data: { label: 'Gi0/2 - Fa0/1' } },
];

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges } = useStore();
  const reactFlowWrapper = useRef(null);

  // Initialize store with default nodes/edges once
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const onSave = useCallback(() => {
    if (reactFlowWrapper.current) {
      const state = useStore.getState();
      const topologyData = {
        nodes: state.nodes,
        edges: state.edges,
      };
      console.log('Exporting Topology JSON:', JSON.stringify(topologyData, null, 2));
      alert('Topology JSON exported to console!');
    }
  }, []);

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <button 
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm font-semibold transition-colors"
          >
            Export JSON
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}