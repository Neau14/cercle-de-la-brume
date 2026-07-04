'use client';

export default function Header({ user, onMenuToggle, activeSection }) {
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <div className="header-path">
          Le Cercle de la Brume
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
            {user?.rpName ? user.rpName.substring(0, 2).toUpperCase() : 'DM'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.rpName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role}
            </span>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
