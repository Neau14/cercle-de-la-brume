'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state variables
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRpName, setEditRpName] = useState('');
  
  const [banningUserId, setBanningUserId] = useState(null);
  const [banReason, setBanReason] = useState('');
  
  const [mentoringUserId, setMentoringUserId] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        setError('Impossible de charger les utilisateurs.');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError('Erreur réseau lors de la récupération des démons.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAction = async (userId, action, value = null) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour.');
        return;
      }

      setSuccess(data.message || 'Mise à jour effectuée.');
      
      // Reload user list
      loadUsers();

      // Reset action states
      setEditingUserId(null);
      setBanningUserId(null);
      setMentoringUserId(null);
      setBanReason('');
      setSelectedMentorId('');
    } catch (err) {
      setError('Erreur de communication avec l\'assemblée des ombres.');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Es-tu sûr de vouloir supprimer définitivement ce démon du Cercle ?')) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de suppression.');
        return;
      }

      setSuccess(data.message || 'Démon banni des archives.');
      loadUsers();
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="badge badge-admin">Admin</span>;
      case 'MEMBER': return <span className="badge badge-member">Membre</span>;
      case 'OBSERVER': return <span className="badge badge-observer">Observateur</span>;
      case 'PENDING': return <span className="badge badge-pending">En attente</span>;
      case 'BANNED': return <span className="badge badge-banned">Banni</span>;
      default: return <span className="badge">{role}</span>;
    }
  };

  const mentorsList = users.filter(u => ['ADMIN', 'MEMBER'].includes(u.role));

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement du conseil d'administration...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🛡️ Panel Administration</h1>
        <p className="page-subtitle">Gère les accès au Cercle, attribue les rôles (Membre/Observateur), ajuste les noms RP et bannis les traîtres.</p>
      </div>

      {error && <div className="auth-message error">{error}</div>}
      {success && <div className="auth-message success">{success}</div>}

      <div className="admin-table-container glass-card-static" style={{ marginTop: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Démon (Nom RP / Discord)</th>
              <th>Rôle Actuel</th>
              <th>Statut Mentorat</th>
              <th>Date d'Inscription</th>
              <th>Actions Administratives</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{u.rpName || 'Aucun nom défini'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Discord: {u.discordUsername || 'Inconnu'}
                    </div>
                    {u.role === 'BANNED' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-secondary-light)', marginTop: '2px' }}>
                        🚫 Raison du ban : {u.banReason}
                      </div>
                    )}
                  </div>
                </td>
                <td>{getRoleBadge(u.role)}</td>
                <td>
                  {u.mentor ? (
                    <span style={{ fontSize: '0.85rem' }}>
                      🎓 Guidé par <strong>{u.mentor.rpName}</strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sans mentor</span>
                  )}
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  <div className="admin-actions">
                    {/* Role modifications */}
                    {u.role === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(u.id, 'changeRole', 'MEMBER')} className="btn btn-primary btn-sm" style={{ background: 'var(--accent-primary)' }}>
                          Approuver Membre
                        </button>
                        <button onClick={() => handleAction(u.id, 'changeRole', 'OBSERVER')} className="btn btn-secondary btn-sm">
                          Approuver Obs
                        </button>
                      </>
                    )}

                    {u.role !== 'PENDING' && u.role !== 'BANNED' && (
                      <select
                        value={u.role}
                        onChange={(e) => handleAction(u.id, 'changeRole', e.target.value)}
                        className="form-select"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', marginBottom: 0 }}
                      >
                        <option value="MEMBER">Membre</option>
                        <option value="OBSERVER">Observateur</option>
                        <option value="ADMIN">Admin</option>
                        <option value="PENDING">Attente</option>
                      </select>
                    )}

                    {/* Change RP Name */}
                    {editingUserId === u.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editRpName}
                          onChange={(e) => setEditRpName(e.target.value)}
                          className="form-input"
                          style={{ padding: '6px', fontSize: '0.8rem', width: '130px' }}
                        />
                        <button onClick={() => handleAction(u.id, 'updateRpName', editRpName)} className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>✓</button>
                        <button onClick={() => setEditingUserId(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>✗</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingUserId(u.id); setEditRpName(u.rpName || ''); }}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Éditer Nom
                      </button>
                    )}

                    {/* Mentor assignment */}
                    {mentoringUserId === u.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          value={selectedMentorId}
                          onChange={(e) => setSelectedMentorId(e.target.value)}
                          className="form-select"
                          style={{ padding: '6px', fontSize: '0.8rem', width: '130px' }}
                        >
                          <option value="">Aucun mentor</option>
                          {mentorsList.filter(m => m.id !== u.id).map(m => (
                            <option key={m.id} value={m.id}>{m.rpName}</option>
                          ))}
                        </select>
                        <button onClick={() => handleAction(u.id, 'setMentor', selectedMentorId)} className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>✓</button>
                        <button onClick={() => setMentoringUserId(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>✗</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setMentoringUserId(u.id); setSelectedMentorId(u.mentorId || ''); }}
                        className="btn btn-secondary btn-sm"
                      >
                        🎓 Mentor
                      </button>
                    )}

                    {/* Ban and Unban */}
                    {u.role === 'BANNED' ? (
                      <button onClick={() => handleAction(u.id, 'unban')} className="btn btn-secondary btn-sm" style={{ borderColor: 'green', color: 'lightgreen' }}>
                        Débannir
                      </button>
                    ) : (
                      <>
                        {banningUserId === u.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Raison du ban..."
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              className="form-input"
                              style={{ padding: '6px', fontSize: '0.8rem', width: '130px' }}
                            />
                            <button onClick={() => handleAction(u.id, 'ban', banReason)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>Ban</button>
                            <button onClick={() => setBanningUserId(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>✗</button>
                          </div>
                        ) : (
                          <button onClick={() => setBanningUserId(u.id)} className="btn btn-danger btn-sm">
                            Bannir
                          </button>
                        )}
                      </>
                    )}

                    {/* Delete account */}
                    <button onClick={() => handleDelete(u.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-secondary-light)' }}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
