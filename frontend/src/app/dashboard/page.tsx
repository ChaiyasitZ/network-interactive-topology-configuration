'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RotateCcw, MonitorPlay, Terminal, Cpu, Clock, Code2 } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'deployments' | 'ai'>('deployments');
  const [deployLogs, setDeployLogs] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'deployments') {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/logs/deployments');
        if (res.ok) setDeployLogs(await res.json());
      } else {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/logs/ai-generations');
        if (res.ok) setAiLogs(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch logs', error);
    }
    setLoading(false);
  };

  const handleRollback = async (logId: string) => {
    if (!confirm('Are you sure you want to rollback to the baseline snapshot for this deployment?')) return;
    
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/deploy/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, credentials: {} }) // Note: In production you would pass actual stored vault credentials here
      });
      const data = await res.json();
      alert(data.message);
      fetchLogs(); // refresh logs
    } catch (error) {
      console.error('Rollback failed:', error);
      alert('Failed to execute rollback');
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Observability</h1>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('deployments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'deployments' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <Terminal className="w-4 h-4" /> Deployments
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <Cpu className="w-4 h-4" /> AI Analytics
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'deployments' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Device</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Terminal Output</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading deployment logs...</td>
                </tr>
              ) : deployLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No deployments have been executed yet.</td>
                </tr>
              ) : (
                deployLogs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {log.deviceHostname}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${log.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${log.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${log.status === 'rolled_back' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      `}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        <Terminal className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{log.terminalOutput || 'No output'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRollback(log._id)}
                        disabled={log.status === 'rolled_back'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Operation Context</th>
                <th className="p-4 font-medium">Tokens / Cost</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading AI analytics...</td>
                </tr>
              ) : aiLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No AI generations logged yet.</td>
                </tr>
              ) : (
                aiLogs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 align-top">
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white capitalize mb-1">{log.intentType || 'Configuration Generation'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                         {JSON.stringify(log.prompt).substring(0, 100)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-gray-900 dark:text-gray-300">Total: {log.tokensUsed || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {log.modelUsed || 'openrouter/auto'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {log.executionTimeMs ? `${(log.executionTimeMs / 1000).toFixed(2)}s` : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}