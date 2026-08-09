import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { disconnectSocket, getSocket } from '../../services/socket';

const links = [['Dashboard', '/dashboard'], ['Workflows', '/workflows/builder'], ['Executions', '/executions'], ['Integrations', '/integrations'], ['Settings', '/settings']];

export default function AppShell({ children }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout); const token = useAuthStore((state) => state.token); const [notifications, setNotifications] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { api.get('/notifications').then(({ data }) => setNotifications(data.notifications)).catch(() => {}); const socket = getSocket(token); const onNotification = (item) => setNotifications((current) => [item, ...current]); socket?.on('notification', onNotification); return () => socket?.off('notification', onNotification); }, [token]);
  const unread = notifications.filter((item) => !item.read).length;
  return <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
    <aside className="border-b border-slate-800 bg-slate-900/50 p-5 md:border-b-0 md:border-r">
      <Link className="text-xl font-bold text-cyan-400" href="/dashboard">Agentflow_AI</Link>
      <nav className="mt-8 flex gap-2 md:flex-col">{links.map(([label, href]) => <Link key={href} href={href} className={`rounded-lg px-3 py-2 text-sm ${router.pathname === href ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:bg-slate-800'}`}>{label}</Link>)}</nav>
      <button className="mt-8 bg-slate-800 text-sm text-slate-300 hover:bg-slate-700" onClick={() => setOpen(!open)}>Notifications {unread ? `(${unread})` : ''}</button>
      <button className="mt-2 bg-slate-800 text-sm text-slate-300 hover:bg-slate-700" onClick={() => { disconnectSocket(); logout(); router.push('/login'); }}>Log out</button>
    </aside>
    <main className="relative p-6 md:p-10">{children}{open && <aside className="fixed right-4 top-4 z-50 w-80 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><button className="p-1 text-slate-400" onClick={() => setOpen(false)}>×</button></div><div className="mt-3 max-h-96 space-y-3 overflow-auto">{notifications.length ? notifications.map((item) => <article key={item.id} className="rounded-lg bg-slate-800 p-3 text-sm"><p className="font-medium">{item.title}</p><p className="mt-1 text-slate-400">{item.message}</p></article>) : <p className="text-sm text-slate-500">No notifications yet.</p>}</div></aside>}</main>
  </div>;
}
