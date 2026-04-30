'use client';

import React, { useState } from 'react';
import useStore from '@/store/topologyStore';
import { Terminal, Save, X, RotateCcw, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfigDiff from './ConfigDiff';

export default function ConfigEditor() {
  const { selectedNodeId, nodes, configs, setConfig, setSelectedNodeId } = useStore();
  const [localConfig, setLocalConfig] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'edit' | 'diff'>('edit');
  
  // Update local uncommitted state when selection changes
  React.useEffect(() => {
    if (selectedNodeId) {
      setLocalConfig(configs[selectedNodeId] || '! No generated config found for this device.\n! Use AI Generator to create configs.');
      setActiveTab('edit'); // reset tab on change
    }
  }, [selectedNodeId, configs]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNodeId || !selectedNode) {
    return null; // hide completely if nothing selected (Handled by flex container in page.tsx)
  }

  const handleSave = () => {
    setConfig(selectedNodeId, localConfig);
    // Ideally emit over websocket
  };

  // Mock a "Live Config" to compare against for demo purposes
  // In Phase 6, this will be fetched from an actual real-time device `show run`
  const mockLiveConfig = '! Live Config on Device\ninterface GigabitEthernet0/1\n ip address 10.0.0.1 255.255.255.0\n no shutdown\n!\nrouter bgp 100\n network 10.0.0.0\n!';

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-96 flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="text-gray-500 w-5 h-5" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {selectedNode.data?.label as string}
          </h3>
        </div>
        <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('edit')} 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'edit' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Edit Config
        </button>
        <button 
          onClick={() => setActiveTab('diff')} 
          className={`flex-1 py-2 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'diff' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <GitCompare className="w-4 h-4" /> Diff View
        </button>
      </div>

      {/* Editor / Diff Body */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-black overflow-y-auto relative">
        {activeTab === 'edit' ? (
          <textarea 
            className="w-full h-full p-3 font-mono text-sm bg-gray-900 text-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none whitespace-pre"
            value={localConfig}
            onChange={(e) => setLocalConfig(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <ConfigDiff oldConfig={mockLiveConfig} newConfig={localConfig} />
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <button 
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Config
        </button>
        <button 
          className="px-4 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-md transition-colors"
          onClick={() => setLocalConfig(configs[selectedNodeId] || '')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}