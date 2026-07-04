'use client';

import { useEffect, useState } from 'react';

export default function DebatsPage() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  
  // Debate Creation states
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Response inputs
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingToId, setReplyingToId] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, debatesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/debates'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (debatesRes.ok) {
          const debatesData = await debatesRes.json();
          setDebates(debatesData.debates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateDebate = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors du débat.');
        return;
      }

      const data = await res.json();
      setDebates([data.debate, ...debates]);
      setSubject('');
      setDescription('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handlePostReply = async (debateId) => {
    const text = replyInputs[debateId];
    if (!text || !text.trim()) return;

    setSendingReply(true);
    setError('');

    try {
      const res = await fetch(`/api/debates/${debateId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Impossible d\'enregistrer votre réponse.');
        return;
      }

      const data = await res.json();
      
      // Update local state
      setDebates(debates.map(d => {
        if (d.id === debateId) {
          return {
            ...d,
            responses: [...(d.responses || []), data.response],
            _count: { ...d._count, responses: (d._count?.responses || 0) + 1 }
          };
        }
        return d;
      }));

      // Clear input
      setReplyInputs({ ...replyInputs, [debateId]: '' });
      setReplyingToId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const defaultDebates = [];

  const displayDebates = debates.length > 0 ? debates : defaultDebates;
  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement des débats...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🧠 Débats de la Faction</h1>
        <p className="page-subtitle">Discussions intellectuelles sur la philosophie démoniaque, la morale et nos doctrines RP.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Les membres débattent ici des doctrines et tactiques.</span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Lancer un Débat
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {displayDebates.map((debate) => (
          <div key={debate.id} className="glass-card-static" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ color: 'var(--accent-primary-light)' }}>{debate.subject}</h3>
              <span className="badge badge-category">Débat</span>
            </div>
            
            {debate.description && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '10px', marginBottom: '20px', lineHeight: 1.6 }}>
                {debate.description}
              </p>
            )}

            {/* Replies section */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                💬 Opinions publiées ({debate._count?.responses || 0}) :
              </h4>

              {(!debate.responses || debate.responses.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '16px' }}>
                  Aucune opinion émise.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {debate.responses.map((rep) => (
                    <div key={rep.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{rep.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>👤 {rep.author?.rpName || 'Démon anonyme'}</span>
                        <span>{new Date(rep.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canPost && (
                <div>
                  {replyingToId === debate.id ? (
                    <div>
                      <textarea
                        value={replyInputs[debate.id] || ''}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [debate.id]: e.target.value })}
                        className="form-textarea"
                        placeholder="Écris ton opinion motivée..."
                        style={{ minHeight: '80px', marginBottom: '10px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handlePostReply(debate.id)}
                          className="btn btn-primary btn-sm"
                          disabled={sendingReply || !(replyInputs[debate.id] || '').trim()}
                        >
                          Publier l'Opinion
                        </button>
                        <button
                          onClick={() => setReplyingToId(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingToId(debate.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      ✍️ Donner mon avis
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Lancé par {debate.author?.rpName || 'Admin'}</span>
              <span>{new Date(debate.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Lancer un Débat RP</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleCreateDebate}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Sujet de Discussion</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: L'utilisation de pièges contre le souffle de la foudre"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Contexte et problématique</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Explique le contexte du débat et les questions soulevées pour stimuler la discussion..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
