'use client';

import React from 'react';
const STEPS = 12;

const Loading: React.FC = () => {
  return (
    <div className="loading" role="status" aria-label="Cargando">
      {/* SVG sprite */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <symbol id="paw" viewBox="0 0 249 209.32">
          <ellipse cx="27.917" cy="106.333" rx="24" ry="34" />
          <ellipse cx="84.75" cy="47.749" rx="30" ry="44" />
          <ellipse cx="162" cy="47.749" rx="30" ry="44" />
          <ellipse cx="221.083" cy="106.333" rx="24" ry="34" />
          <path d="M43.98 165.39s9.76-63.072 76.838-64.574c0 0 71.082-6.758 83.096 70.33 0 0 2.586 19.855-12.54 31.855 0 0-15.75 17.75-43.75-6.25 0 0-7.124-8.374-24.624-7.874 0 0-12.75-.125-21.5 6.625 0 0-16.375 18.376-37.75 12.75 0 0-28.29-7.72-19.77-42.86z"/>
        </symbol>
      </svg>

      <div className="loading-content">
        <div className="ajax-loader" style={{ ['--count' as any]: STEPS }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div className="paw" key={i} style={{ ['--i' as any]: i }}>
              <svg className="icon" aria-hidden="true">
                <use href="#paw" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
