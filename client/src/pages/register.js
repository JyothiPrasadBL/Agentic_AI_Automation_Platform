import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const router = useRouter(); const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setLoading(true); setError(''); try { await register(form.name, form.email, form.password); router.push('/dashboard'); } catch (err) { setError(err.response?.data?.message || 'Unable to create your account.'); } finally { setLoading(false); } }
  return <main className="grid min-h-screen place-items-center p-6"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"><div><h1 className="text-2xl font-bold">Create your account</h1><p className="mt-1 text-sm text-slate-400">Start automating operations.</p></div>{error && <p className="rounded bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<label className="block text-sm">Name<input required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="block text-sm">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="block text-sm">Password<input required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><button disabled={loading} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">{loading ? 'Creating account…' : 'Create account'}</button><p className="text-center text-sm text-slate-400">Already registered? <Link className="text-cyan-400" href="/login">Sign in</Link></p></form></main>;
}
