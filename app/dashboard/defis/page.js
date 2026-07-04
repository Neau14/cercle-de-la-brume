'use client';

import { useEffect, useState } from 'react';

export default function DefisPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('FACILE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, challengesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/challenges'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (challengesRes.ok) {
          const challengesData = await challengesRes.json();
          setChallenges(challengesData.challenges);
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
    if (!title.trim() || !description.trim()) {
      setError('Titre et description requis.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, difficulty }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création du défi.');
        return;
      }

      const data = await res.json();
      setChallenges([data.challenge, ...challenges]);
      setTitle('');
      setDescription('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const defaultChallenges = [
    {
      id: 'd1',
      title: 'Espionnage rural silencieux',
      difficulty: 'FACILE',
      description: 'Observer un village de nuit sans vous faire repérer ni laisser d’odeur suspecte. Notez les heures de ronde du garde local.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    },
    {
      id: 'd2',
      title: 'Filer un Pourfendeur solitaire',
      difficulty: 'MOYEN',
      description: 'Suivre un pourfendeur en patrouille pendant une heure entière en maintenant une distance de sécurité constante.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    },
    {
      id: 'd3',
      title: 'Infiltration sans effusion de sang',
      difficulty: 'DIFFICILE',
      description: 'Obtenir une information clé concernant les livraisons d’acier du soleil (Nichirin) dans un entrepôt sans tuer le gardien.',
      author: { rpName: 'Ryuga Amagiri' },
      createdAt: new Date()
    }
  ];

  const displayChallenges = challenges.length > 0 ? challenges : defaultChallenges;
  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  const difficultyLabels = {
    FACILE: '🟢 Facile',
    MOYEN: '🟡 Moyen',
    DIFFICILE: '🔴 Difficile',
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement des défis...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🩸 Défis & Missions</h1>
        <p className="page-subtitle">Des objectifs non-combattants pour aiguiser la discrétion, l’esprit d’équipe et la collecte d’informations.</p>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Accomplis des défis RP pour démontrer ton sang-froid et ta discrétion.</span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Créer un Défi
          </button>
        )}
      </div>

      <div className="content-grid">
        {displayChallenges.map((challenge) => (
          <div key={challenge.id} className="glass-card content-card">
            <div className="content-card-header">
              <span className="badge badge-category">{difficultyLabels[challenge.difficulty] || challenge.difficulty}</span>
            </div>
            <h3 className="content-card-title">{challenge.title}</h3>
            <p className="content-card-body">{challenge.description}</p>
            <div className="content-card-footer">
              <span className="content-card-author">👤 Proposé par {challenge.author?.rpName || 'Admin'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {challenge.createdAt ? new Date(challenge.createdAt).toLocaleDateString('fr-FR') : 'Manuel du Cercle'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Créer un Défi / Mission</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Titre de la mission</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Récupérer un objet Nichirin"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="difficulty">Difficulté</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="form-select"
                  disabled={saving}
                >
                  <option value="FACILE">🟢 Facile</option>
                  <option value="MOYEN">🟡 Moyen</option>
                  <option value="DIFFICILE">🔴 Difficile</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description des objectifs</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  required
                  disabled={saving}
                  placeholder="Décris précisément le but de cette mission RP et ses contraintes..."
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
