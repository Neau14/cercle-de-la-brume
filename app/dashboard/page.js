'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    codexCount: 0,
    coursesCount: 0,
    reportsCount: 0,
    journalCount: 0,
  });
  const [recentJournal, setRecentJournal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [codexRes, coursesRes, reportsRes, journalRes] = await Promise.all([
          fetch('/api/codex'),
          fetch('/api/courses'),
          fetch('/api/combat-reports'),
          fetch('/api/journal'),
        ]);

        const codexData = codexRes.ok ? await codexRes.json() : { entries: [] };
        const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] };
        const reportsData = reportsRes.ok ? await reportsRes.json() : { reports: [] };
        const journalData = journalRes.ok ? await journalRes.json() : { entries: [] };

        setStats({
          codexCount: codexData.entries.length,
          coursesCount: coursesData.courses.length,
          reportsCount: reportsData.reports.length,
          journalCount: journalData.entries.length,
        });

        setRecentJournal(journalData.entries.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Récupération des données du Cercle...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Le Cercle de la Brume</h1>
        <p className="page-subtitle">Unification, formation et archivage stratégique pour la survie et la suprématie des démons.</p>
      </div>

      {/* Stats Quick Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">💡</div>
          <div className="stat-value">{stats.codexCount}</div>
          <div className="stat-label">Fiches Codex</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{stats.coursesCount}</div>
          <div className="stat-label">Cours Planifiés</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-value">{stats.reportsCount}</div>
          <div className="stat-label">Rapports Combat</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.journalCount}</div>
          <div className="stat-label">Bulletins Journal</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
        
        {/* Left Side: Recent Bulletins */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            📰 Dernières Nouvelles du Cercle
          </h3>
          {recentJournal.length === 0 ? (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Aucun bulletin publié pour le moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentJournal.map((entry) => (
                <div key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-primary-light)' }}>
                      Bulletin N°{entry.number} : {entry.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {entry.content.substring(0, 140)}{entry.content.length > 140 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/journal" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Voir tout le Journal
          </Link>
        </div>

        {/* Right Side: Quick Tips & RP Guidelines */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            🩸 Principes de la Brume
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li>
              <strong>Unification :</strong> Ne combattez pas seul inutilement. Apprenez de l'expérience de vos pairs.
            </li>
            <li>
              <strong>Codex collaboratif :</strong> Ajoutez vos découvertes sur les Pourfendeurs dès que possible.
            </li>
            <li>
              <strong>Partage :</strong> Si vous développez ou observez une faille dans le Souffle de l'Eau ou de la Foudre, documentez-la.
            </li>
            <li>
              <strong>Mentorat actif :</strong> Les anciens guident les nouveaux pour réduire le taux de perte de notre faction.
            </li>
          </ul>

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary-light)', fontWeight: 700, marginBottom: '6px' }}>
              💡 Le savais-tu ?
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "Le Cercle de la Brume récompense le travail d'analyse, l'enseignement et la recherche autant que la force brute. Contribue pour gagner de prestigieuses distinctions."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
