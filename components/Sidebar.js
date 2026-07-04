'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();

  const links = [
    { label: 'Tableau de bord', href: '/dashboard', icon: '🏠', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Codex de la Brume', href: '/dashboard/codex', icon: '💡', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Enseignement', href: '/dashboard/enseignement', icon: '📖', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Recherche', href: '/dashboard/recherche', icon: '🔍', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Mentorat', href: '/dashboard/mentorat', icon: '🎓', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Entraide RP', href: '/dashboard/entraide', icon: '🤝', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Simulations', href: '/dashboard/simulations', icon: '⚔️', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Bibliothèque', href: '/dashboard/bibliotheque', icon: '📚', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Défis & Missions', href: '/dashboard/defis', icon: '🩸', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Débats & Discus', href: '/dashboard/debats', icon: '🧠', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Distinctions', href: '/dashboard/distinctions', icon: '🏅', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Journal du Cercle', href: '/dashboard/journal', icon: '📝', roles: ['ADMIN', 'MEMBER', 'OBSERVER'] },
    { label: 'Panel Admin', href: '/dashboard/admin', icon: '🛡️', roles: ['ADMIN'] },
  ];

  const filteredLinks = links.filter(l => l.roles.includes(user?.role));

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
          <div className="sidebar-section-label">RP Faction</div>
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
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
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.rpName ? user.rpName.substring(0, 2).toUpperCase() : 'DM'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.rpName || 'Démon anonyme'}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
