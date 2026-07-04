'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.banned) {
          router.push('/login?error=banned');
          return;
        }
        if (data.user.role === 'PENDING') {
          router.push('/login?error=pending');
          return;
        }
        setUser(data.user);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Chargement de l'ombre...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <LoadingScreen />
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-content">
        <Header user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} activeSection="Dashboard" />
        <main className="dashboard-main animate-in">
          {children}
        </main>
      </div>
      <div className="mist-bg"></div>
    </div>
  );
}
