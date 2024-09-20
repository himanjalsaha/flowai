const CustomNode = ({ data }) => {
    return (
      <div style={{ padding: 10, backgroundColor: '#fff', border: '1px solid #777' }}>
        <strong>{data.label}</strong>
      </div>
    );
  };
  
  const initialElements = [
    { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
    { id: '2', data: { label: 'Custom Node' }, position: { x: 100, y: 100 }, type: 'custom' },
    { id: '3', data: { label: 'Step 2' }, position: { x: 400, y: 100 } },
    // Add your edges as needed
  ];
  
  function FlowChart() {
    const nodeTypes = { custom: CustomNode };
  
    return (
      <div style={{ height: 500 }}>
        <ReactFlow elements={initialElements} nodeTypes={nodeTypes} />
      </div>
    );
  }
  