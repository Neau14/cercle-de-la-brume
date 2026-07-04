'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRpPage() {
  const [rpName, setRpName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verify user is authenticated but lacks an RP Name
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user.rpName) {
          if (data.user.role === 'PENDING') {
            router.push('/login?error=pending');
          } else {
            router.push('/dashboard');
          }
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setChecking(false);
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rpName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/rp-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        return;
      }

      // If user is ADMIN (first user auto-promotion), send to dashboard directly.
      // Otherwise they are PENDING and go to pending alert screen.
      if (data.user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/login?error=pending');
      }
    } catch (err) {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="mist-bg"></div>
      <div className="auth-container animate-in">
        <div className="glass-card-static auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Nom de Démon</h1>
            <p className="auth-subtitle">Saisis ton identité de jeu pour rejoindre Le Cercle de la Brume</p>
          </div>

          {error && <div className="auth-message error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="rpName">Nom In-RP</label>
              <input
                id="rpName"
                type="text"
                placeholder="Ex: Ryuga Amagiri"
                value={rpName}
                onChange={(e) => setRpName(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !rpName.trim()}>
              {loading ? 'Enregistrement...' : 'Enregistrer le nom RP'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '20px', opacity: 0.6 }}>
            Une fois validé par l'administration, tu pourras accéder aux données du Cercle.
          </div>
        </div>
      </div>
    </div>
  );
}
