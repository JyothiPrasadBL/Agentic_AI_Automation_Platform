import { useCallback, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

const agentColors = { planner: 'text-violet-300', execution: 'text-cyan-300', validation: 'text-emerald-300', recovery: 'text-amber-300', monitoring: 'text-slate-300' };
export default function Executions() {
  const [items, setItems] = useState([]); const [selected, setSelected] = useState(null); const [logs, setLogs] = useState([]);
  const token = useAuthStore((state) => state.token);
  const refresh = useCallback(async () => { const { data } = await api.get('/executions'); setItems(data.data); }, []);
  const select = useCallback(async (execution) => { setSelected(execution); const { data } = await api.get(`/executions/${execution.id}/timeline`); setLogs(data.logs); }, []);
  useEffect(() => { refresh(); const id = setInterval(refresh, 1500); return () => clearInterval(id); }, [refresh]);
  useEffect(() => { const socket = getSocket(token); const onEvent = (event) => { if (event.executionId === selected?.id) setLogs((current) => [...current, event]); refresh(); }; socket?.on('execution:event', onEvent); return () => socket?.off('execution:event', onEvent); }, [token, selected?.id, refresh]);
  async function action(name) { if (!selected) return; await api.post(`/executions/${selected.id}/${name}`); await refresh(); const { data } = await api.get(`/executions/${selected.id}`); await select(data.execution); }
  return <ProtectedRoute><AppShell><p className="text-sm text-cyan-400">Execution console</p><h1 className="text-3xl font-bold">Workflow executions</h1><div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]"><section className="overflow-hidden rounded-xl border border-slate-800"><div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-slate-800 p-4 text-xs uppercase text-slate-500"><span>Execution</span><span>Status</span><span>Retries</span></div>{items.length ? items.map((item) => <button key={item.id} onClick={() => select(item)} className="grid w-full grid-cols-[1fr_auto_auto] gap-3 border-b border-slate-800 p-4 text-left text-sm hover:bg-slate-900"><span>{item.workflowSnapshot.name}<small className="mt-1 block text-slate-500">{new Date(item.createdAt).toLocaleString()}</small></span><span>{item.status}</span><span>{item.retryCount}</span></button>) : <p className="p-5 text-sm text-slate-500">No executions yet.</p>}</section><section className="rounded-xl border border-slate-800 p-5"><h2 className="font-semibold">Agent timeline</h2>{selected && <div className="mt-3 flex gap-2"><button className="bg-slate-800 text-sm" onClick={() => action('pause')}>Pause</button><button className="bg-slate-800 text-sm" onClick={() => action('resume')}>Resume</button><button className="bg-red-500/15 text-sm text-red-300" onClick={() => action('cancel')}>Cancel</button></div>}<div className="mt-5 space-y-3">{logs.map((log) => <div key={log.id} className="border-l border-slate-700 pl-3 text-sm"><p className={`font-medium ${agentColors[log.agent] || 'text-slate-200'}`}>{log.agent} · {log.eventType}</p><p className="text-slate-400">{log.message}</p></div>)}{selected && !logs.length && <p className="text-sm text-slate-500">Waiting for agent events…</p>}</div></section></div></AppShell></ProtectedRoute>;
}
