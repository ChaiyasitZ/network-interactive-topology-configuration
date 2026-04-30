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
  const { nodes, edges, configs, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, setSelectedNodeId } = useStore();
  const reactFlowWrapper = useRef(null);

  // Initialize store with default nodes/edges once
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const onSave = useCallback(() => {
    const topologyData = { nodes, edges };
    console.log('Exporting Topology JSON:', JSON.stringify(topologyData, null, 2));
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(topologyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'topology.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const exportAnsible = useCallback(() => {
    let yaml = "---\n- name: Deploy NetCanvas AI Configurations\n  hosts: all\n  gather_facts: no\n  tasks:\n";
    
    let hasConfigs = false;
    nodes.forEach(node => {
      const config = configs[node.id];
      if (config && !config.startsWith('! No generated config') && config.trim() !== '') {
        hasConfigs = true;
        yaml += `    - name: Apply configuration to ${node.data.label}\n`;
        yaml += `      cisco.ios.ios_config:\n`;
        yaml += `        lines:\n`;
        config.split('\n').forEach(line => {
          if(line.trim() && !line.startsWith('!')) {
            yaml += `          - ${line.trim()}\n`;
          }
        });
        yaml += `      when: inventory_hostname == '${node.data.ip || node.data.label}'\n\n`;
      }
    });

    if (!hasConfigs) {
      alert("No configurations found! Generate or write some configs in the Editor first.");
      return;
    }

    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infrastructure_playbook.yml';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, configs]);

  return (
    <div className="w-full h-[600px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-black relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(event, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />        <Panel position="top-right" className="flex gap-2">
          <button 
            onClick={onSave}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Export JSON
          </button>
          <button 
            onClick={exportAnsible}
            className="px-3 py-1.5 bg-blue-600 border border-transparent shadow-sm rounded-md text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Export to Ansible
          </button>
        </Panel>        <Panel position="top-right">
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