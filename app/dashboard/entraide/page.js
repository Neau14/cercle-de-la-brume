'use client';

import { useEffect, useState } from 'react';

export default function EntraidePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PARTENAIRE');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, entraideRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/entraide'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (entraideRes.ok) {
          const entraideData = await entraideRes.json();
          setPosts(entraideData.posts);
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
      const res = await fetch('/api/entraide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la publication.');
        return;
      }

      const data = await res.json();
      setPosts([data.post, ...posts]);
      setTitle('');
      setContent('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const categoryLabels = {
    PARTENAIRE: '🤝 Partenaires RP',
    CONSEIL: '💡 Conseils de jeu',
    TECHNIQUE: '🔥 Avis technique/Pouvoir',
    RETOUR: '📝 Retours sur Fiche',
  };

  const displayPosts = posts;

  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement du salon d'entraide...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🤝 Salon d'Entraide</h1>
        <p className="page-subtitle">Demande des partenaires de jeu, des conseils tactiques, ou des retours sur tes créations RP.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Partage tes idées et collabore avec la communauté des démons.</span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Nouveau message
          </button>
        )}
      </div>

      <div className="content-grid">
        {displayPosts.map((post) => (
          <div key={post.id} className="glass-card content-card">
            <div className="content-card-header">
              <span className="badge badge-category">{categoryLabels[post.category] || post.category}</span>
            </div>
            <h3 className="content-card-title">{post.title}</h3>
            <p className="content-card-body" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            <div className="content-card-footer">
              <span className="content-card-author">👤 Rédigé par {post.author.rpName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(post.createdAt).toLocaleDateString('fr-FR')}
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
              <h2 className="modal-title">Nouveau Message d'Entraide</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Sujet de ta demande</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Avis sur le style de combat de mon démon"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Type de Demande</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  disabled={saving}
                >
                  <option value="PARTENAIRE">🤝 Recherche Partenaire RP</option>
                  <option value="CONSEIL">💡 Demande de Conseils</option>
                  <option value="TECHNIQUE">🔥 Avis Pouvoir Sanguinaire</option>
                  <option value="RETOUR">📝 Retours sur Fiche Personnage</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content">Contenu détaillé</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Décris précisément ce dont tu as besoin (idées, horaires, aides, liens RP...)"
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
