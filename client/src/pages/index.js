import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  useEffect(() => { if (hydrated) router.replace(user ? '/dashboard' : '/login'); }, [hydrated, user, router]);
  return <main className="grid min-h-screen place-items-center text-slate-400">Loading Agentflow_AI…</main>;
}
