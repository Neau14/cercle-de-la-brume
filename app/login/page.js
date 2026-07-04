'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const banReason = searchParams.get('reason');

  const handleDiscordLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="auth-page">
      <div className="mist-bg"></div>
      <div className="auth-container animate-in">
        <div className="glass-card-static auth-card">
          <div className="auth-header">
            <div className="sidebar-logo" style={{ margin: '0 auto 16px', width: '60px', height: '60px', fontSize: '1.6rem' }}>
              霧
            </div>
            <h1 className="auth-title">Le Cercle de la Brume</h1>
            <p className="auth-subtitle">Système d'unification et d'organisation des démons</p>
          </div>

          {error === 'pending' && (
            <div className="auth-message info">
              <strong>Compte enregistré.</strong> Votre demande d'accès est en cours de validation par un administrateur. Repassez plus tard !
            </div>
          )}

          {error === 'banned' && (
            <div className="auth-message error">
              <strong>Accès Révoqué.</strong> Vous avez été banni du Cercle de la Brume.<br />
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Raison : {banReason || 'Non spécifiée'}</span>
            </div>
          )}

          {error && error !== 'pending' && error !== 'banned' && (
            <div className="auth-message error">
              <strong>Erreur :</strong> Connexion échouée ({error}). Veuillez réessayer.
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleDiscordLogin} 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #5865F2, #4752C4)', border: 'none', boxShadow: '0 4px 15px rgba(88, 101, 242, 0.4)' }}
            >
              <svg width="20" height="20" viewBox="0 0 127.14 96.36" style={{ fill: 'white', marginRight: '10px' }}>
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,72.58,0c.82.71,1.68,1.4,2.58,2a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129,54.65,122.94,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              Se connecter avec Discord
            </button>
          </div>

          <div className="auth-footer" style={{ marginTop: '30px', opacity: 0.6 }}>
            Accès sécurisé réservé aux membres de la faction.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Chargement...</div>}>
      <LoginContent />
    </Suspense>
  );
}
