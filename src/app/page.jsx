"use client";
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Send } from 'lucide-react'; // Import Lucide icons

export default function App() {
  const [input, setInput] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Fetch flowchart data based on the input message
  const fetchFlowchartData = async (message) => {
    try {
      const res = await axios.post("/api/flow", { message });
      const data = res.data;

      // Check if the response contains nodes and connections
      if (data.nodes && data.connections) {
        setNodes(data.nodes);
        setEdges(generateEdges(data.connections));
      } else {
        console.error('Invalid data structure', data);
      }
    } catch (error) {
      console.error('Error fetching flowchart data:', error.response ? error.response.data : error.message);
    }
    
  };

  // Dynamically generate edges based on the connections array
// Dynamically generate edges based on the connections array
const generateEdges = (connections) => {
  const edges = [];
  connections.forEach((connection) => {
    connection.to.forEach((targetId) => {
      edges.push({
        id: `e${connection.from}-${targetId}`,
        source: connection.from,
        target: targetId,
        type: connection.type,
      });
    });
  });
  return edges;
};


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white p-4">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
          className="flex-1 p-2 text-lg bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button
          onClick={() => fetchFlowchartData(input)}
          className="p-2 text-lg flex items-center space-x-1 bg-black text-white rounded hover:bg-gray-800 focus:ring focus:ring-blue-500"
        >
          <span>Generate</span>
          <Send className="w-5 h-5" /> {/* Lucide Icon */}
        </button>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg p-2">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          style={{ background: '#1E1E1E' }}
        >
          <Controls style={{ background: '#2D2D2D' }} />
          <MiniMap 
            style={{ background: '#2D2D2D' }} 
            nodeColor={() => '#007ACC'} 
            edgeColor="#888" 
          />
          <Background variant="dots" gap={12} size={1} color="#444444" />
        </ReactFlow>
      </div>
    </div>
  );
}
