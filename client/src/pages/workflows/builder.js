import { useCallback, useEffect, useMemo, useState } from 'react';
import { addEdge, useEdgesState, useNodesState } from '@xyflow/react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import PromptInputPanel from '../../components/PromptInputPanel';
import api from '../../services/api';

const starterNodes = [{ id: 'trigger-1', position: { x: 120, y: 180 }, data: { type: 'manual-trigger', label: 'Start manually', config: {} }, type: 'default' }];
export default function Builder() {
  const router = useRouter(); const workflowId = typeof router.query.id === 'string' ? router.query.id : null;
  const [nodes, setNodes, onNodesChange] = useNodesState(starterNodes); const [edges, setEdges, onEdgesChange] = useEdgesState([]); const [selected, setSelected] = useState(null); const [name, setName] = useState('Untitled workflow'); const [notice, setNotice] = useState(''); const [generating, setGenerating] = useState(false);
  useEffect(() => { if (!workflowId) return; api.get(`/workflows/${workflowId}`).then(({ data }) => { setName(data.workflow.name); setNodes(data.workflow.nodes); setEdges(data.workflow.edges); }).catch((error) => setNotice(error.response?.data?.message || 'Unable to load workflow.')); }, [workflowId, setEdges, setNodes]);
  const onConnect = useCallback((connection) => setEdges((current) => addEdge({ ...connection, animated: true }, current)), [setEdges]);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selected), [nodes, selected]);
  function addNode(type, label) { const id = crypto.randomUUID(); setNodes((current) => [...current, { id, type: 'default', position: { x: 240 + current.length * 35, y: 100 + current.length * 45 }, data: { type, label, config: {} } }]); setSelected(id); }
  function updateNode(next) { setNodes((current) => current.map((node) => node.id === next.id ? next : node)); }
  async function generate(prompt) { setGenerating(true); setNotice(''); try { const { data } = await api.post('/workflows/generate', { prompt }); setName(data.workflow.name); setNodes(data.workflow.nodes); setEdges(data.workflow.edges); setSelected(null); setNotice(`Graph generated with ${data.provider}${data.fallbackUsed ? ' fallback' : ''}.`); } catch (error) { setNotice(error.response?.data?.message || 'Unable to generate workflow.'); } finally { setGenerating(false); } }
  async function save() { if (!name.trim()) return setNotice('A workflow name is required.'); if (!nodes.some((node) => node.data.type.includes('trigger'))) return setNotice('Add at least one trigger node before saving.'); const payload = { name, nodes, edges, status: 'draft', trigger: { type: 'manual' } }; const { data } = workflowId ? await api.put(`/workflows/${workflowId}`, payload) : await api.post('/workflows', payload); setNotice(`Saved workflow ${data.workflow.name}.`); if (!workflowId) router.replace(`/workflows/${data.workflow.id}`); }
  async function execute() { if (!workflowId) return setNotice('Save this workflow before executing it.'); try { const { data } = await api.post(`/workflows/${workflowId}/execute`, { input: {} }); router.push(`/executions?id=${data.execution.id}`); } catch (error) { setNotice(error.response?.data?.message || 'Unable to start execution.'); } }
  return <ProtectedRoute><AppShell><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-cyan-400">Workflow builder</p><h1 className="text-3xl font-bold">{workflowId ? 'Edit workflow' : 'Build an automation'}</h1></div><div className="flex gap-2">{workflowId && <button className="bg-slate-800 text-slate-200 hover:bg-slate-700" onClick={execute}>Run workflow</button>}<button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={save}>Save workflow</button></div></div>{!workflowId && <PromptInputPanel onGenerate={generate} loading={generating} />}<div className="mb-4 flex gap-3"><input className="max-w-md" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" />{notice && <p className="self-center text-sm text-slate-400">{notice}</p>}</div><div className="grid gap-4 xl:grid-cols-[200px_minmax(0,1fr)_260px]"><NodePalette onAdd={addNode}/><WorkflowCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelected(node.id)} /><NodeConfigPanel node={selectedNode} onChange={updateNode} onDelete={(id) => { setNodes((current) => current.filter((node) => node.id !== id)); setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id)); setSelected(null); }} /></div></AppShell></ProtectedRoute>;
}
