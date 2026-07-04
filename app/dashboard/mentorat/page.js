'use client';

import { useEffect, useState } from 'react';

export default function MentoratPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, usersRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/admin/users'), // Safe call since fallback to empty or roles check
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          setUserRole(meData.user.role);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mentorsList = users.filter((u) => u.isMentor);
  const menteesList = users.filter((u) => u.role === 'PENDING' || u.role === 'OBSERVER' || (u.role === 'MEMBER' && !u.mentor));

  const hasMentor = currentUser?.mentor;
  const hasMentees = currentUser?.mentees && currentUser.mentees.length > 0;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🎓 Programme de Mentorat</h1>
        <p className="page-subtitle">Chaque démon prometteur reçoit l'appui d'un aîné pour parfaire son entraînement et survivre aux missions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* User Mentorship Card */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            👤 Ton Statut de Mentorat
          </h3>
          
          {hasMentor ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>Tu es actuellement guidé par :</p>
              <div className="glass-card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-primary-light)' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary-light)' }}>
                  {currentUser.mentor.rpName}
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Mentor attitré du Cercle. N'hésite pas à le solliciter pour des entraînements.
                </p>
              </div>
            </div>
          ) : hasMentees ? (
            <div>
              <p style={{ marginBottom: '12px' }}>Tu es le mentor des démons suivants :</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentUser.mentees.map((mentee) => (
                  <div key={mentee.id} className="glass-card" style={{ padding: '12px', borderLeft: '3px solid #4ade80' }}>
                    <strong style={{ color: '#4ade80' }}>{mentee.rpName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      En attente de formation RP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tu n'as pas de mentor assigné ni de démon sous ta tutelle pour le moment.
              {userRole === 'PENDING' && " Une fois validé par l'administration, un mentor te sera attribué."}
            </div>
          )}
        </div>

        {/* Mentorship Directory */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            🤝 Liste des Mentors Disponibles
          </h3>
          {mentorsList.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Aucun mentor disponible.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mentorsList.map((mentor) => (
                <div key={mentor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{mentor.rpName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Membre du Cercle depuis {new Date(mentor.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="badge badge-member">Mentor</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
