'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  const links = [
    { label: 'Tableau de bord', href: '/dashboard', icon: '🏠', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Codex de la Brume', href: '/dashboard/codex', icon: '💡', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Enseignement', href: '/dashboard/enseignement', icon: '📖', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Recherche', href: '/dashboard/recherche', icon: '🔍', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Mentorat', href: '/dashboard/mentorat', icon: '🎓', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Entraide', href: '/dashboard/entraide', icon: '🤝', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Simulations', href: '/dashboard/simulations', icon: '⚔️', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Bibliothèque', href: '/dashboard/bibliotheque', icon: '📚', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Défis & Missions', href: '/dashboard/defis', icon: '🩸', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Débats & Discus', href: '/dashboard/debats', icon: '🧠', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Distinctions', href: '/dashboard/distinctions', icon: '🏅', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Journal du Cercle', href: '/dashboard/journal', icon: '📝', roles: ['ADMIN', 'MEMBER'] },
    { label: 'Panel Admin', href: '/dashboard/admin', icon: '🛡️', roles: ['ADMIN'] },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '15px', boxShadow: '0 0 10px rgba(88, 28, 135, 0.5)' }} />
          </div>
          <div>
            <h1 className="sidebar-title" style={{ fontFamily: "'Cinzel', serif" }}>
              Le Cercle<br />de la Brume
            </h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Le cercle</div>
          {links.map((link) => {
            const hasAccess = link.roles.includes(user?.role);
            
            // Hide Panel Admin entirely for non-admins (don't gray it out)
            if (link.href === '/dashboard/admin' && !hasAccess) return null;

            const isActive = pathname === link.href;

            if (!hasAccess) {
              return (
                <div
                  key={link.href}
                  className="sidebar-link"
                  style={{ opacity: 0.4, cursor: 'not-allowed', textDecoration: 'none' }}
                  title="Accès refusé"
                >
                  <span className="sidebar-link-icon" style={{ filter: 'grayscale(100%)' }}>{link.icon}</span>
                  <span>{link.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>🔒</span>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="sidebar-avatar" style={{ padding: user?.avatarUrl ? 0 : undefined, overflow: 'hidden' }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.rpName ? user.rpName.substring(0, 2).toUpperCase() : 'DM'
                )}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.rpName || 'Démon anonyme'}</div>
                <div className="sidebar-user-role">
                  {user?.role} {user?.isMentor && <span style={{ color: '#fbbf24', marginLeft: '4px', fontSize: '0.8rem' }}>(Mentor)</span>}
                </div>
              </div>
            </div>
            <button 
              onClick={logout} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary-light)', cursor: 'pointer', fontSize: '1.2rem' }}
              title="Se déconnecter"
            >
              ⏏️
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
