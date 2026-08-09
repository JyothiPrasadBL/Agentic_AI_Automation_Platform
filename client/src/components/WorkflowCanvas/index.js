import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick }) {
  return <div className="h-[560px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950"><ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} fitView><Background gap={20} color="#1e293b" /><Controls /><MiniMap /></ReactFlow></div>;
}
