'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Check if the loading screen has already been shown in this session
    const hasLoaded = sessionStorage.getItem('cercle-brume-loaded');
    if (hasLoaded) {
      return;
    }

    setVisible(true);

    // Generate 30 mist particles with random starting positions (dispersed)
    const newParticles = Array.from({ length: 35 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 200; // disperse them far out
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;
      const size = 30 + Math.random() * 50;
      const duration = 2.2 + Math.random() * 0.8;
      const delay = Math.random() * 0.4;

      return {
        id: i,
        startX: `${startX}px`,
        startY: `${startY}px`,
        size: `${size}px`,
        duration: `${duration}s`,
        delay: `${delay}s`,
      };
    });

    setParticles(newParticles);

    // Set loaded flag in session storage
    sessionStorage.setItem('cercle-brume-loaded', 'true');

    // Hide after animation finishes (approx 4.5s)
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="loading-screen">
      <div className="mist-bg"></div>
      <div className="loading-mist-container">
        {/* Render dispersing/gathering particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="mist-particle"
            style={{
              '--start-x': p.startX,
              '--start-y': p.startY,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}

        {/* Compact circle that forms at the end */}
        <div className="loading-circle">
          <div className="loading-circle-inner"></div>
        </div>
      </div>

      <h2 className="loading-text">Formation du cercle de la brume</h2>
      <div className="loading-subtitle">Faction des démons • RP Demon Slayer</div>
    </div>
  );
}
