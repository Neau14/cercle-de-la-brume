'use client';

import { useEffect, useState } from 'react';

export default function BibliothequePage() {
  const [guides, setGuides] = useState([]);
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
        const [meRes, guidesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/library'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (guidesRes.ok) {
          const guidesData = await guidesRes.json();
          setGuides(guidesData.guides);
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
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création du guide.');
        return;
      }

      const data = await res.json();
      setGuides([data.guide, ...guides]);
      setTitle('');
      setContent('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const defaultGuides = [
    {
      id: 'g1',
      title: 'Comment réussir une embuscade nocturne',
      content: '1. Repérer le vent pour éviter que l\'odeur de démon ne soit détectée à distance par les chasseurs expérimentés.\n2. Attendre que la cible soit engagée dans un passage étroit (pont, sentier rocheux).\n3. Couper toute retraite avant d\'engager le combat rapproché.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    },
    {
      id: 'g2',
      title: 'Les erreurs classiques des jeunes démons',
      content: 'L\'erreur la plus fréquente est l\'arrogance. Sous-estimer le sabre du Soleil ou ignorer la possibilité qu\'un Corbeau de Liaison appelle des renforts (Hashira) peut s\'avérer fatal. Ne restez jamais sur un lieu de combat plus de 10 minutes.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    }
  ];

  const displayGuides = guides.length > 0 ? guides : defaultGuides;
  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement de la Bibliothèque...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">📚 Bibliothèque du Cercle</h1>
        <p className="page-subtitle">Guides stratégiques, manuels de combat et récits d'expérience pour instruire notre faction.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Des écrits tactiques partagés par nos membres pour guider vos pas.</span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Écrire un Guide
          </button>
        )}
      </div>

      <div className="content-grid">
        {displayGuides.map((guide) => (
          <div key={guide.id} className="glass-card content-card">
            <div className="content-card-header">
              <span className="badge badge-category">Manuel Tactique</span>
            </div>
            <h3 className="content-card-title">{guide.title}</h3>
            <p className="content-card-body" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{guide.content}</p>
            <div className="content-card-footer">
              <span className="content-card-author">👤 Écrit par {guide.author?.rpName || 'Démon chevronné'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(guide.createdAt).toLocaleDateString('fr-FR')}
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
              <h2 className="modal-title">Rédiger un Guide</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Titre du Guide</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Guide du combat nocturne en forêt"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content">Contenu du Guide</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Écris ton guide ici avec des conseils structurés..."
                  style={{ minHeight: '200px' }}
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
