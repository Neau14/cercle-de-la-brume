'use client';

import { useEffect, useState } from 'react';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, journalRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/journal'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (journalRes.ok) {
          const journalData = await journalRes.json();
          setEntries(journalData.entries);
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
    if (!title.trim() || !content.trim()) {
      setError('Titre et contenu requis.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création.');
        return;
      }

      const data = await res.json();
      setEntries([data.entry, ...entries]);
      setTitle('');
      setContent('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const defaultEntries = [
    {
      id: 'j1',
      number: 4,
      title: 'Expansion du Cercle et Nouveaux Rapports',
      content: 'Trois nouveaux membres démons ont rejoint le cercle. Deux analyses de combat sur le souffle de la foudre ont été publiées dans la base de recherche. Une nouvelle stratégie de diversion a été testée avec succès.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    },
    {
      id: 'j2',
      number: 3,
      title: 'Premières Fiches du Codex compilées',
      content: 'Le codex est officiellement ouvert. Veuillez y inscrire toutes vos constatations immédiates. Les chasseurs se font de plus en plus agressifs dans le secteur Ouest.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date(Date.now() - 86400000 * 3)
    }
  ];

  const displayEntries = entries.length > 0 ? entries : defaultEntries;
  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement du journal...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">📝 Journal du Cercle de la Brume</h1>
        <p className="page-subtitle">Bulletins d'informations réguliers sur les activités, progressions et effectifs de notre faction.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Les publications et bilans périodiques de l'alliance.</span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Publier un Bulletin
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {displayEntries.map((entry) => (
          <div key={entry.id} className="glass-card-static" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-primary-light)' }}>
                Bulletin N°{entry.number} : {entry.title}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              {entry.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Écrit par : <strong>{entry.author?.rpName || 'Admin'}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Publier un Bulletin</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Titre du Bulletin</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Bilan tactique de la semaine"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content">Contenu de l'annonce</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Écris ton bulletin d'information ici..."
                  style={{ minHeight: '180px' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Publication...' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
