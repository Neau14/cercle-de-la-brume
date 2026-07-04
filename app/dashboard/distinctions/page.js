'use client';

import { useEffect, useState } from 'react';

export default function DistinctionsPage() {
  const [distinctions, setDistinctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ANALYSE');
  const [targetUserId, setTargetUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, distRes, usersRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/distinctions'),
          fetch('/api/admin/users'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (distRes.ok) {
          const distData = await distRes.json();
          setDistinctions(distData.distinctions);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users.filter(u => u.role !== 'PENDING' && u.role !== 'BANNED'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetUserId) {
      setError('Titre et destinataire requis.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/distinctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, userId: targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'attribution.');
        return;
      }

      const data = await res.json();
      setDistinctions([data.distinction, ...distinctions]);
      setTitle('');
      setTargetUserId('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const defaultDistinctions = [];

  const categoryLabels = {
    ANALYSE: '🔍 Meilleur rapport d\'analyse',
    ENSEIGNEMENT: '📖 Meilleur professeur',
    MENTORAT: '🎓 Meilleur mentor',
    PROGRESSION: '📈 Plus belle progression',
    EQUIPE: '🤝 Meilleur esprit d\'équipe',
  };

  const displayDistinctions = distinctions.length > 0 ? distinctions : defaultDistinctions;
  const isIdAdmin = userRole === 'ADMIN';

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement des distinctions...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🏅 Distinctions & Tableau d'Honneur</h1>
        <p className="page-subtitle">Récompenses attribuées aux démons méritants du Cercle pour leurs contributions exceptionnelles à la faction.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Célébrons les accomplissements intellectuels et d'entraide de nos membres.
        </span>
        {isIdAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Décerner une Distinction
          </button>
        )}
      </div>

      <div className="content-grid">
        {displayDistinctions.map((dist) => (
          <div key={dist.id} className="glass-card content-card" style={{ borderLeft: '3px solid var(--accent-secondary)' }}>
            <div className="content-card-header">
              <span className="badge badge-category" style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--accent-secondary-light)' }}>
                {categoryLabels[dist.category] || dist.category}
              </span>
            </div>
            <h3 className="content-card-title" style={{ color: 'white', fontFamily: "'Cinzel', serif" }}>
              {dist.title}
            </h3>
            
            <div style={{ marginTop: '10px', fontSize: '0.95rem' }}>
              Récipiendaire : <strong style={{ color: 'var(--accent-primary-light)' }}>{dist.user.rpName}</strong>
            </div>

            <div className="content-card-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Décerner le : {new Date(dist.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Décerner une Distinction</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Titre de la Distinction</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Professeur émérite du mois"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Catégorie de Mérite</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  disabled={saving}
                >
                  <option value="ANALYSE">🔍 Meilleur rapport d'analyse</option>
                  <option value="ENSEIGNEMENT">📖 Meilleur professeur</option>
                  <option value="MENTORAT">🎓 Meilleur mentor</option>
                  <option value="PROGRESSION">📈 Plus belle progression</option>
                  <option value="EQUIPE">🤝 Meilleur esprit d'équipe</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="targetUser">Membre Récompensé</label>
                <select
                  id="targetUser"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="form-select"
                  required
                  disabled={saving}
                >
                  <option value="">-- Choisir un Démon --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.rpName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Attribution...' : 'Décerner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
