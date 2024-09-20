import React from 'react';
import ReactFlow from 'react-flow-renderer';

const initialElements = [
  { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Step 1' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Step 2' }, position: { x: 400, y: 100 } },
  { id: '4', type: 'output', data: { label: 'End' }, position: { x: 250, y: 200 } },
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' }
];

function FlowChart() {
  return (
    <div style={{ height: 500 }}>
      <ReactFlow elements={initialElements} />
    </div>
  );
}

export default FlowChart;
