import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { api.get('/workflows/dashboard').then(({ data }) => setDashboard(data)).catch(() => setDashboard({ metrics: {} })); }, []);
  const metricList = [['Total workflows', dashboard?.metrics?.totalWorkflows ?? '—'], ['Active workflows', dashboard?.metrics?.activeWorkflows ?? '—'], ['Total executions', dashboard?.metrics?.totalExecutions ?? '—'], ['Success rate', `${dashboard?.metrics?.successRate ?? 0}%`]];
  return <ProtectedRoute><AppShell><p className="text-sm font-medium text-cyan-400">Operator console</p><div className="mt-1 flex items-end justify-between"><h1 className="text-3xl font-bold">Hello, {user?.name}</h1><Link className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950" href="/workflows/builder">New workflow</Link></div><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricList.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</section><section className="mt-8"><h2 className="text-lg font-semibold">Recent workflows</h2><div className="mt-3 space-y-2">{dashboard?.recentWorkflows?.length ? dashboard.recentWorkflows.map((workflow) => <Link key={workflow.id} href={`/workflows/${workflow.id}`} className="block rounded-lg border border-slate-800 p-4 hover:border-cyan-500/50"><span className="font-medium">{workflow.name}</span><span className="ml-3 text-sm text-slate-500">v{workflow.version} · {workflow.status}</span></Link>) : <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">No workflows yet. Start with a new automation.</p>}</div></section></AppShell></ProtectedRoute>;
}
