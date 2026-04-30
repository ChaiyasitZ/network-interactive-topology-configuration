import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            padding: '2px 4px',
            borderRadius: 4,
            backgroundColor: 'white',
            border: '1px solid #eee',
            className: 'nodrag nopan',
          }}
        >
          {data?.label as string}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}