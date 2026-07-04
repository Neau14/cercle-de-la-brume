'use client';

import { useEffect, useState } from 'react';

export default function EnseignementPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('THEORIQUE');
  const [userRole, setUserRole] = useState('OBSERVER');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('THEORIQUE');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, coursesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/courses'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses);
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
    if (!title.trim() || !category) {
      setError('Titre et catégorie requis.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          content,
          scheduledAt: scheduledAt || null,
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la planification.');
        return;
      }

      const data = await res.json();
      setCourses([data.course, ...courses]);
      setTitle('');
      setDescription('');
      setContent('');
      setScheduledAt('');
      setLocation('');
      setShowModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courses.filter((c) => c.category === activeTab);
  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  // Fallback default suggestions for each category
  const suggestions = {
    THEORIQUE: [],
    PRATIQUE: [],
    DEVELOPPEMENT: []
  };

  const displayCourses = filteredCourses.length > 0 ? filteredCourses : suggestions[activeTab];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">📖 Enseignement & Entraînement</h1>
        <p className="page-subtitle">Formations théoriques et pratiques pour renforcer la faction des démons face aux chasseurs.</p>
      </div>

      <div className="tabs">
        <button
          onClick={() => setActiveTab('THEORIQUE')}
          className={`tab ${activeTab === 'THEORIQUE' ? 'active' : ''}`}
        >
          📘 Cours Théoriques
        </button>
        <button
          onClick={() => setActiveTab('PRATIQUE')}
          className={`tab ${activeTab === 'PRATIQUE' ? 'active' : ''}`}
        >
          ⚔️ Cours Pratiques
        </button>
        <button
          onClick={() => setActiveTab('DEVELOPPEMENT')}
          className={`tab ${activeTab === 'DEVELOPPEMENT' ? 'active' : ''}`}
        >
          🧠 Développement Personnel
        </button>
      </div>

      <div className="section-header">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {activeTab === 'THEORIQUE' && 'Compréhension du monde humain, de l’anatomie et de la menace des souffles.'}
          {activeTab === 'PRATIQUE' && 'Entraînements physiques, vitesse, endurance, coordination tactique.'}
          {activeTab === 'DEVELOPPEMENT' && 'Maîtrise de l’ego, psychologie de combat et sang-froid.'}
        </span>
        {canPost && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Planifier un Cours / Entraînement
          </button>
        )}
      </div>

      <div className="content-grid">
        {displayCourses.map((course) => (
          <div key={course.id} className="glass-card content-card">
            <div className="content-card-header">
              <span className="badge badge-category">{course.category}</span>
              {course.scheduledAt && (
                <span className="badge" style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--accent-secondary-light)' }}>
                  ⏳ Planifié
                </span>
              )}
            </div>
            <h3 className="content-card-title">{course.title}</h3>
            <p className="content-card-body">{course.description}</p>
            {course.content && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '2px solid var(--accent-primary-light)' }}>
                <strong>Détails :</strong> {course.content}
              </div>
            )}
            
            <div className="content-card-footer">
              <span className="content-card-author">
                👤 {course.author?.rpName || 'Instructeur du Cercle'}
              </span>
              {course.scheduledAt ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>
                  📅 {new Date(course.scheduledAt).toLocaleString('fr-FR')} {course.location ? `• Loc: ${course.location}` : ''}
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manuel du Cercle</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course scheduling modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Planifier une session d'enseignement</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            {error && <div className="auth-message error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Titre du cours</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                  disabled={saving}
                  placeholder="Ex: Survie face à un adversaire supérieur"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  disabled={saving}
                >
                  <option value="THEORIQUE">Théorique</option>
                  <option value="PRATIQUE">Pratique</option>
                  <option value="DEVELOPPEMENT">Développement Personnel</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Brève description</label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  disabled={saving}
                  placeholder="Ex: Analyse psychologique et gestion de la fuite."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content">Détails ou Programme</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-textarea"
                  disabled={saving}
                  placeholder="Objectif du cours, points clés abordés..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scheduledAt">Date et Heure de la session (Optionnel)</label>
                <input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="form-input"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">Lieu RP (Optionnel)</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  disabled={saving}
                  placeholder="Ex: Colline brumeuse, Forêt de l'Est..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Planification...' : 'Planifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
