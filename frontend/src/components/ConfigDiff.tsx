import React from 'react';
import { diffLines } from 'diff';

interface ConfigDiffProps {
  oldConfig: string;
  newConfig: string;
}

export default function ConfigDiff({ oldConfig, newConfig }: ConfigDiffProps) {
  const diffResult = diffLines(oldConfig, newConfig);

  return (
    <div className="w-full h-full font-mono text-sm bg-gray-900 text-gray-300 p-3 rounded-md overflow-y-auto whitespace-pre-wrap">
      {diffResult.map((part, index) => {
        const color = part.added 
          ? 'bg-green-900/50 text-green-400' 
          : part.removed 
            ? 'bg-red-900/50 text-red-500' 
            : 'text-gray-400';
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        
        const lines = part.value.replace(/\n$/, '').split('\n');
        return (
          <div key={index} className={color}>
            {lines.map((line, i) => (
              <div key={i}>{prefix}{line}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}