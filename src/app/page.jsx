"use client"

import React, { useCallback, useState, memo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import axios from 'axios'
import { Send, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

const CustomNode = memo(({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {data.image ? (
              <img
                src={data.image}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            )}
            <div className="text-lg font-semibold text-gray-800">{data.label}</div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
          >
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        {isOpen && (
          <div className="mt-3 space-y-2">
            {data.description && (
              <div className="text-sm text-gray-600">
                {data.description}
              </div>
            )}
            {data.additionalDetails && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Details:</span> {data.additionalDetails}
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-2 !h-2" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

const nodeTypes = {
  custom: CustomNode,
}

export default function Component() {
  const [input, setInput] = useState("")
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchFlowchartData = async (message) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.post("/api/flow", { message })
      const data = res.data

      if (data.nodes && data.connections) {
        const customNodes = data.nodes.map((node) => ({
          ...node,
          type: 'custom',
          data: {
            ...node.data,
            image: node.data.image || null,
            label: node.data.label || node.id,
            description: node.data.description || null,
          },
        }))
        setNodes(customNodes)
        setEdges(generateEdges(data.connections))
      } else {
        throw new Error('Invalid data structure received from API')
      }
    } catch (error) {
      console.error('Error fetching flowchart data:', error)
      setError(error.response?.data?.message || error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const generateEdges = (connections) => {
    return connections.flatMap((connection) =>
      connection.to.map((targetId) => ({
        id: `e${connection.from}-${targetId}`,
        source: connection.from,
        target: targetId,
        type: 'smoothstep',
        style: { stroke: '#4fd1c5', strokeWidth: 2 },
      }))
    )
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 text-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Flowchart Generator</h1>
        <p className="text-gray-500">Visualize your data with interactive flowcharts.</p>
      </div>

      {/* Input and Generate Button */}
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
          className="flex-1 p-3 text-base bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
        <button
          onClick={() => fetchFlowchartData(input)}
          disabled={isLoading}
          className="p-3 text-base flex items-center justify-center space-x-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}

      {/* Flowchart Container */}
      <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
          <MiniMap
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            nodeColor={() => '#4fd1c5'}
            maskColor="rgba(255, 255, 255, 0.5)"
          />
          <Background variant="dots" gap={16} size={1} color="rgba(0, 0, 0, 0.1)" />
        </ReactFlow>
      </div>
    </div>
  )
}