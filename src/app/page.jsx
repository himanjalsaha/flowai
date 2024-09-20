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
import { Send, Loader2, AlertCircle } from 'lucide-react'

const CustomNode = memo(({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-black border border-gray-700">
      <div className="flex items-center">
        {data.image ? (
          <img
            src={data.image}
            alt=""
            className="rounded-full w-10 h-10 mr-2"
          />
        ) : (
          <div className="w-10 h-10 mr-2 bg-gray-700 rounded-full"></div>
        )}
        <div className="text-lg font-bold text-white">{data.label}</div>
      </div>
      {data.description && (
        <div className="mt-2 text-sm text-gray-300">{data.description}</div>
      )}
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  )
})

CustomNode.displayName = 'CustomNode'

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
            image: node.data.image || null, // Use the image URL from the API or null if not provided
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
        animated: true,
        style: { stroke: '#4fd1c5', strokeWidth: 2 },
      }))
    )
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white p-4">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
          className="flex-1 p-2 text-lg bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-500"
        />
        <button
          onClick={() => fetchFlowchartData(input)}
          disabled={isLoading}
          className="p-2 text-lg flex items-center justify-center space-x-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed w-32 h-10"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-100">{error}</span>
        </div>
      )}

      <div className="flex-1 bg-gray-800 rounded-lg p-2 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10 rounded-lg">
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
          className="bg-gray-800"
          fitView
        >
          <Controls className="bg-gray-700 border border-gray-600 rounded-md" />
          <MiniMap 
            className="bg-gray-700 border border-gray-600 rounded-md"
            nodeColor={() => '#000000'}
            maskColor="rgba(0, 0, 0, 0.5)"
          />
          <Background variant="dots" gap={12} size={1} color="rgba(255, 255, 255, 0.2)" />
        </ReactFlow>
      </div>
    </div>
  )
}