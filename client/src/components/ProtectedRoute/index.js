import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  useEffect(() => { if (hydrated && !user) router.replace('/login'); }, [hydrated, user, router]);
  if (!hydrated || !user) return <main className="grid min-h-screen place-items-center text-slate-400">Loading session…</main>;
  return children;
}
