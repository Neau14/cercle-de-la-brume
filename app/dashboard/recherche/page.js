'use client';

import { useEffect, useState } from 'react';

export default function RecherchePage() {
  const [profiles, setProfiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('POURFENDEURS');
  const [userRole, setUserRole] = useState('OBSERVER');
  
  // Modals state
  const [showSlayerModal, setShowSlayerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Slayer Form states
  const [slayerName, setSlayerName] = useState('');
  const [grade, setGrade] = useState('');
  const [breathStyle, setBreathStyle] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [personality, setPersonality] = useState('');
  const [knownFights, setKnownFights] = useState('');
  
  // Report Form states
  const [reportTitle, setReportTitle] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [whyAnalysis, setWhyAnalysis] = useState('');
  const [improvements, setImprovements] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, slayersRes, reportsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/slayers'),
          fetch('/api/combat-reports'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
        }

        if (slayersRes.ok) {
          const slayersData = await slayersRes.json();
          setProfiles(slayersData.profiles);
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateSlayer = async (e) => {
    e.preventDefault();
    if (!slayerName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/slayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: slayerName,
          grade,
          breathStyle,
          strengths,
          weaknesses,
          personality,
          knownFights,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création.');
        return;
      }

      const data = await res.json();
      setProfiles([data.profile, ...profiles]);
      setSlayerName('');
      setGrade('');
      setBreathStyle('');
      setStrengths('');
      setWeaknesses('');
      setPersonality('');
      setKnownFights('');
      setShowSlayerModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/combat-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          whatWorked,
          whatFailed,
          whyAnalysis,
          improvements,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création.');
        return;
      }

      const data = await res.json();
      setReports([data.report, ...reports]);
      setReportTitle('');
      setWhatWorked('');
      setWhatFailed('');
      setWhyAnalysis('');
      setImprovements('');
      setShowReportModal(false);
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const canPost = ['ADMIN', 'MEMBER'].includes(userRole);

  const staticStudies = [
    {
      id: 'e1',
      title: 'Pourquoi les Pourfendeurs combattent-ils ?',
      description: 'Analyse des motivations profondes des humains rejoignant l\'armée.',
      content: 'Majoritairement motivés par la vengeance personnelle (famille massacrée). Cette obsession les rend implacables mais prévisibles. Leurs émotions de colère altèrent souvent leur lucidité tactique.',
      author: 'Ryuga Amagiri'
    },
    {
      id: 'e2',
      title: 'Quelles émotions rendent un humain dangereux ?',
      description: 'L\'effet de la peur, du désespoir et du dévouement sur le combat.',
      content: 'Un humain terrifié fait des erreurs d\'esquive. Cependant, un humain acculé qui combat pour protéger autrui développe un sursaut d\'adrénaline et une force inattendue. Privilégier l\'isolement des cibles.',
      author: 'Ryuga Amagiri'
    }
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🔍 Division Recherche & Renseignements</h1>
        <p className="page-subtitle">Base de données tactique sur nos ennemis et compte-rendus d'affrontements.</p>
      </div>

      <div className="tabs">
        <button
          onClick={() => setActiveTab('POURFENDEURS')}
          className={`tab ${activeTab === 'POURFENDEURS' ? 'active' : ''}`}
        >
          ⚔️ Fiches Pourfendeurs
        </button>
        <button
          onClick={() => setActiveTab('COMBATS')}
          className={`tab ${activeTab === 'COMBATS' ? 'active' : ''}`}
        >
          📁 Archives des Combats
        </button>
        <button
          onClick={() => setActiveTab('ETUDES')}
          className={`tab ${activeTab === 'ETUDES' ? 'active' : ''}`}
        >
          📚 Études Sociologiques
        </button>
      </div>

      {activeTab === 'POURFENDEURS' && (
        <div>
          <div className="section-header">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fiches détaillées des pourfendeurs rencontrés au combat.</span>
            {canPost && (
              <button onClick={() => setShowSlayerModal(true)} className="btn btn-primary">
                + Ajouter une Fiche
              </button>
            )}
          </div>

          {profiles.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-state-icon">👤</div>
              <div className="empty-state-text">Aucun profil enregistré</div>
              <div className="empty-state-hint">Crée la première fiche pour répertorier un pourfendeur !</div>
            </div>
          ) : (
            <div className="content-grid">
              {profiles.map((profile) => (
                <div key={profile.id} className="glass-card content-card">
                  <div className="content-card-header">
                    <span className="badge badge-category">{profile.grade || 'Grade inconnu'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary-light)' }}>
                      🌬️ {profile.breathStyle || 'Souffle inconnu'}
                    </span>
                  </div>
                  <h3 className="content-card-title">{profile.name}</h3>
                  <div className="content-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                    {profile.strengths && <div><strong>Points forts :</strong> {profile.strengths}</div>}
                    {profile.weaknesses && <div style={{ color: 'var(--accent-secondary-light)' }}><strong>Faiblesses :</strong> {profile.weaknesses}</div>}
                    {profile.personality && <div><strong>Personnalité :</strong> {profile.personality}</div>}
                    {profile.knownFights && <div><strong>Combats connus :</strong> {profile.knownFights}</div>}
                  </div>
                  <div className="content-card-footer">
                    <span className="content-card-author">👤 Rédigé par {profile.author.rpName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'COMBATS' && (
        <div>
          <div className="section-header">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Analyses post-combat pour comprendre nos réussites et nos échecs.</span>
            {canPost && (
              <button onClick={() => setShowReportModal(true)} className="btn btn-primary">
                + Archiver un Combat
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-text">Aucun rapport d'affrontement</div>
              <div className="empty-state-hint">Raconte ton dernier combat et comment l'optimiser.</div>
            </div>
          ) : (
            <div className="content-grid">
              {reports.map((report) => (
                <div key={report.id} className="glass-card content-card">
                  <div className="content-card-header">
                    <span className="badge badge-category">Rapport</span>
                  </div>
                  <h3 className="content-card-title">{report.title}</h3>
                  <div className="content-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                    <div style={{ color: '#4ade80' }}><strong>Ce qui a fonctionné :</strong> {report.whatWorked}</div>
                    <div style={{ color: 'var(--accent-secondary-light)' }}><strong>Ce qui a échoué :</strong> {report.whatFailed}</div>
                    <div><strong>Pourquoi (Analyse) :</strong> {report.whyAnalysis}</div>
                    <div style={{ fontStyle: 'italic', borderLeft: '2px solid var(--accent-primary-light)', paddingLeft: '6px' }}>
                      <strong>Pistes d'amélioration :</strong> {report.improvements}
                    </div>
                  </div>
                  <div className="content-card-footer">
                    <span className="content-card-author">👤 {report.author.rpName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ETUDES' && (
        <div>
          <div className="section-header">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Analyses conceptuelles de la psychologie des pourfendeurs.</span>
          </div>
          <div className="content-grid">
            {staticStudies.map((study) => (
              <div key={study.id} className="glass-card content-card">
                <div className="content-card-header">
                  <span className="badge badge-category">Étude</span>
                </div>
                <h3 className="content-card-title">{study.title}</h3>
                <p className="content-card-body" style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{study.description}</p>
                <p className="content-card-body" style={{ fontSize: '0.82rem', opacity: 0.8 }}>{study.content}</p>
                <div className="content-card-footer">
                  <span className="content-card-author">👤 {study.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slayer Modal */}
      {showSlayerModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Fiche de Pourfendeur</h2>
              <button onClick={() => setShowSlayerModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleCreateSlayer}>
              <div className="form-group">
                <label className="form-label">Nom RP du Pourfendeur</label>
                <input type="text" value={slayerName} onChange={(e) => setSlayerName(e.target.value)} className="form-input" required placeholder="Ex: Tanjiro Kamado" />
              </div>
              <div className="form-group">
                <label className="form-label">Grade</label>
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="form-input" placeholder="Ex: Mizunoto, Hashira..." />
              </div>
              <div className="form-group">
                <label className="form-label">Style de Souffle</label>
                <input type="text" value={breathStyle} onChange={(e) => setBreathStyle(e.target.value)} className="form-input" placeholder="Ex: Souffle de l'Eau..." />
              </div>
              <div className="form-group">
                <label className="form-label">Points forts</label>
                <input type="text" value={strengths} onChange={(e) => setStrengths(e.target.value)} className="form-input" placeholder="Ex: Agilité, défense hermétique" />
              </div>
              <div className="form-group">
                <label className="form-label">Faiblesses</label>
                <input type="text" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} className="form-input" placeholder="Ex: S'épuise vite à longue distance" />
              </div>
              <div className="form-group">
                <label className="form-label">Personnalité / Comportement</label>
                <textarea value={personality} onChange={(e) => setPersonality(e.target.value)} className="form-textarea" placeholder="Ex: Discipliné, refuse d'abandonner..." />
              </div>
              <div className="form-group">
                <label className="form-label">Combats connus</label>
                <input type="text" value={knownFights} onChange={(e) => setKnownFights(e.target.value)} className="form-input" placeholder="Ex: Combat à la Colline de l'Est" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowSlayerModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>Créer la fiche</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="glass-card-static modal">
            <div className="modal-header">
              <h2 className="modal-title">Archiver un rapport d'affrontement</h2>
              <button onClick={() => setShowReportModal(false)} className="modal-close">×</button>
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleCreateReport}>
              <div className="form-group">
                <label className="form-label">Titre du combat / Lieu</label>
                <input type="text" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="form-input" required placeholder="Ex: Embuscade nocturne contre 2 chasseurs" />
              </div>
              <div className="form-group">
                <label className="form-label">Ce qui a fonctionné</label>
                <textarea value={whatWorked} onChange={(e) => setWhatWorked(e.target.value)} className="form-textarea" placeholder="Ex: Attaque surprise par le dessus" />
              </div>
              <div className="form-group">
                <label className="form-label">Ce qui a échoué</label>
                <textarea value={whatFailed} onChange={(e) => setWhatFailed(e.target.value)} className="form-textarea" placeholder="Ex: Pris au piège par une garde serrée" />
              </div>
              <div className="form-group">
                <label className="form-label">Pourquoi ? (Analyse stratégique)</label>
                <textarea value={whyAnalysis} onChange={(e) => setWhyAnalysis(e.target.value)} className="form-textarea" placeholder="Ex: Le souffle de l'eau est très réactif en défense" />
              </div>
              <div className="form-group">
                <label className="form-label">Pistes d'amélioration</label>
                <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} className="form-textarea" placeholder="Ex: Les harceler à distance pour briser leur souffle" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>Enregistrer le rapport</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
