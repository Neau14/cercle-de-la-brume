'use client';

import { useEffect, useState } from 'react';

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('OBSERVER');
  const [selectedAnswers, setSelectedAnswers] = useState({});

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

  const defaultCases = [
    {
      id: 'c1',
      title: 'Cas N°1 : Le Pourfendeur Blessé',
      scenario: 'Tu poursuis un Pourfendeur blessé qui s\'enfuit vers un temple shintoiste. La nuit est presque terminée, le soleil va se lever dans 15 minutes. Que fais-tu ?',
      options: [
        'Prendre le risque de foncer pour le dévorer avant le lever du jour.',
        'Abandonner la traque et chercher immédiatement un abri souterrain.',
        'Utiliser des projectiles ou l\'environnement pour bloquer sa fuite à distance sans t\'exposer.'
      ]
    },
    {
      id: 'c2',
      title: 'Cas N°2 : Supériorité Numérique',
      scenario: 'Tu affrontes deux jeunes chasseurs coordonnés. L\'un utilise le Souffle de l\'Eau (défensif) et l\'autre le Souffle de la Foudre (très rapide). Quelle stratégie adoptes-tu ?',
      options: [
        'Concentrer toutes les attaques sur l\'utilisateur de la Foudre pour éliminer le danger de vitesse.',
        'Séparer les deux cibles en créant un mur de brume ou de débris, puis éliminer l\'un après l\'autre.',
        'Adopter une garde défensive absolue pour épuiser leur endurance.'
      ]
    },
    {
      id: 'c3',
      title: 'Cas N°3 : Blessure Grave',
      scenario: 'Lors d\'une patrouille, ton bras droit et une partie de ton abdomen sont tranchés par un sabre du Soleil. La régénération prendra au moins 2 minutes. Continues-tu à te battre ou fuis-tu ? Pourquoi ?',
      options: [
        'Continuer à attaquer sauvagement pour créer un effet de surprise malgré la blessure.',
        'Battre en retraite immédiatement en profitant de la brume et se régénérer dans l\'ombre.',
        'Simuler la mort ou l\'évanouissement pour tendre une embuscade s\'ils s\'approchent.'
      ]
    }
  ];

  const handleSelectOption = (caseId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [caseId]: optionIndex
    });
  };

  const displaySims = simulations.length > 0 ? simulations : defaultCases;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">⚔️ Simulations Tactiques</h1>
        <p className="page-subtitle">Débats sur des cas pratiques et affine tes réflexes stratégiques face à diverses situations RP.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {displaySims.map((sim) => (
          <div key={sim.id} className="glass-card-static" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--accent-primary-light)', marginBottom: '12px' }}>{sim.title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
              {sim.scenario}
            </p>

            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Options de réaction :</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(typeof sim.options === 'string' ? JSON.parse(sim.options) : sim.options).map((option, idx) => {
                const isSelected = selectedAnswers[sim.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(sim.id, idx)}
                    className="btn"
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      background: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      padding: '12px 16px',
                    }}
                  >
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
                      fontWeight: 700
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {selectedAnswers[sim.id] !== undefined && (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                🟢 <strong>Choix enregistré.</strong> Analyse tactique : ce choix est débattu au sein de la faction. Consulte le salon d'Entraide ou de Débats pour argumenter ton choix avec d'autres démons.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
