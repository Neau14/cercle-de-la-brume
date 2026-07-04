'use client';

import { useEffect, useState } from 'react';

export default function CodexPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [subject, setSubject] = useState('');
  const [observations, setObservations] = useState('');
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, codexRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/codex'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (codexRes.ok) {
          const codexData = await codexRes.json();
          setEntries(codexData.entries);
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
    if (!subject.trim() || !observations.trim()) {
      setError('Sujet et observations requis.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/codex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, observations, advice }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création.');
        return;
      }

      const data = await res.json();
      setEntries([data.entry, ...entries]);
      setSubject('');
      setObservations('');
      setAdvice('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.observations.toLowerCase().includes(search.toLowerCase()) ||
    e.author.rpName.toLowerCase().includes(search.toLowerCase())
  );

  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement du Codex...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">💡 Le Codex de la Brume</h1>
        <p className="page-subtitle">L'encyclopédie collective rédigée par les démons pour cataloguer nos observations et tactiques face aux Pourfendeurs.</p>
      </div>

      <div className="section-header">
        <input
          type="text"
          placeholder="Rechercher une fiche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ width: '100%', maxWidth: '300px' }}
        />
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Ajouter au Codex
          </button>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-state-icon">📖</div>
          <div className="empty-state-text">Aucune fiche trouvée</div>
          <div className="empty-state-hint">Sois le premier à documenter une faiblesse de Pourfendeur !</div>
        </div>
      ) : (
        <div className="content-grid">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="glass-card content-card">
              <div className="content-card-header">
                <span className="codex-number">Fiche N°{entry.entryNumber}</span>
                <span className="badge badge-category">Codex</span>
              </div>
              <h3 className="content-card-title">{entry.subject}</h3>
              <div className="content-card-body">
                <div className="codex-section-title">Observations</div>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{entry.observations}</p>
                
                {entry.advice && (
                  <>
                    <div className="codex-section-title">Conseils tactiques</div>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: 'var(--text-primary)', fontStyle: 'italic', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '8px' }}>
                      {entry.advice}
                    </p>
                  </>
                )}
              </div>
              <div className="content-card-footer">
                <span className="content-card-author">
                  <span className="content-card-author-avatar">
                    {entry.author.rpName.substring(0, 2).toUpperCase()}
                  </span>
                  {entry.author.rpName}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Nouvelle contribution au Codex</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            
            {error && <div className="auth-message error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Sujet de recherche (Ex: Pourfendeurs du souffle de l'Eau)</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Style de souffle, tactique ou comportement"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="observations">Observations / Constatations</label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Décris précisément ce que tu as observé (Défense forte, rigidité des déplacements...)"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="advice">Conseils pour les Démons</label>
                <textarea
                  id="advice"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="form-textarea"
                  disabled={saving}
                  placeholder="Comment les contourner ou exploiter leurs failles"
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
