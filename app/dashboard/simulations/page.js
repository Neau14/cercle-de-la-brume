'use client';

import { useEffect, useState } from 'react';

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [userId, setUserId] = useState(null);
  const [votingFor, setVotingFor] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, simRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/simulations'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUserRole(meData.user.role);
          setUserId(meData.user.id);
        }

        if (simRes.ok) {
          const simData = await simRes.json();
          setSimulations(simData.simulations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleVote = async (simId, choice) => {
    setVotingFor(simId);
    try {
      const res = await fetch(`/api/simulations/${simId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });

      if (res.ok) {
        // Update local state with the new vote
        setSimulations(prev => prev.map(sim => {
          if (sim.id !== simId) return sim;
          // Remove existing vote by this user, then add the new one
          const otherVotes = (sim.votes || []).filter(v => v.userId !== userId);
          return { ...sim, votes: [...otherVotes, { userId, choice }] };
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVotingFor(null);
    }
  };

  const defaultCases = [];

  const displaySims = simulations.length > 0 ? simulations : defaultCases;

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Chargement des simulations...</div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">⚔️ Simulations Tactiques</h1>
        <p className="page-subtitle">Débats sur des cas pratiques et affine tes réflexes stratégiques face à diverses situations RP.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {displaySims.map((sim) => {
          const options = typeof sim.options === 'string' ? JSON.parse(sim.options) : sim.options;
          const votes = sim.votes || [];
          const totalVotes = votes.length;
          const myVote = votes.find(v => v.userId === userId);
          const hasVoted = Boolean(myVote);

          // Count votes per option letter (A, B, C...)
          const voteCounts = {};
          options.forEach((_, idx) => {
            const letter = String.fromCharCode(65 + idx);
            voteCounts[letter] = votes.filter(v => v.choice === letter).length;
          });

          return (
            <div key={sim.id} className="glass-card-static" style={{ padding: '24px' }}>
              <h3 style={{ color: 'var(--accent-primary-light)', marginBottom: '12px' }}>{sim.title}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                {sim.scenario}
              </p>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Options de réaction :</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = myVote?.choice === letter;
                  const count = voteCounts[letter] || 0;
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isVoting = votingFor === sim.id;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleVote(sim.id, letter)}
                      disabled={isVoting}
                      className="btn"
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        background: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        padding: '12px 16px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Vote percentage bar background */}
                      {hasVoted && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${percentage}%`,
                          background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          transition: 'width 0.5s ease',
                          zIndex: 0,
                        }} />
                      )}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        marginRight: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        zIndex: 1,
                        position: 'relative',
                      }}>
                        {letter}
                      </span>
                      <span style={{ zIndex: 1, position: 'relative', flex: 1 }}>{option}</span>
                      {hasVoted && (
                        <span style={{
                          zIndex: 1,
                          position: 'relative',
                          marginLeft: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--accent-primary-light)' : 'var(--text-muted)',
                          minWidth: '40px',
                          textAlign: 'right',
                        }}>
                          {percentage}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {hasVoted && (
                <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {totalVotes} vote{totalVotes > 1 ? 's' : ''} au total
                </div>
              )}

              {hasVoted && (
                <div style={{ marginTop: '10px', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  🟢 <strong>Choix enregistré.</strong> Analyse tactique : ce choix est débattu au sein de la faction. Consulte le salon d'Entraide ou de Débats pour argumenter ton choix avec d'autres démons.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
