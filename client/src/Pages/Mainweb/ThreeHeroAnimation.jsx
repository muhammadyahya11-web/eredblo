import React from 'react';

export default function ThreeHeroAnimation() {
  return (
    <div className="relative w-full flex items-center justify-center select-none" style={{ height: 480 }}>

      {/* ── Deep blue radial background glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 70% at 55% 45%, rgba(29,78,216,0.28) 0%, rgba(15,40,130,0.12) 45%, transparent 75%)'
      }} />

      {/* ── Floating $ Orb (bottom-left) ── */}
      <div className="absolute z-20" style={{ left: '4%', bottom: '22%', animation: 'floatOrb1 5s ease-in-out infinite' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(7,18,50,0.85)',
          border: '1.5px solid rgba(59,130,246,0.5)',
          boxShadow: '0 0 18px rgba(59,130,246,0.35), inset 0 0 12px rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ color: '#60a5fa', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>$</span>
        </div>
      </div>

      {/* ── Floating Chart Orb (upper-right) ── */}
      <div className="absolute z-20" style={{ right: '4%', top: '14%', animation: 'floatOrb2 6s ease-in-out infinite' }}>
        <div style={{
          width: 55, height: 55, borderRadius: '50%',
          background: 'rgba(7,18,50,0.85)',
          border: '1.5px solid rgba(59,130,246,0.5)',
          boxShadow: '0 0 18px rgba(59,130,246,0.35), inset 0 0 12px rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Trend up icon */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
      </div>

      {/* ── Main Shield Container ── */}
      <div className="relative z-10 flex flex-col items-center justify-end" style={{ height: 440 }}>

        {/* Shield SVG with neon glow */}
        <div className="relative" style={{ animation: 'shieldFloat 4s ease-in-out infinite', marginBottom: 0 }}>

          {/* Outer glow layer */}
          <div className="absolute inset-0 pointer-events-none" style={{
            filter: 'blur(28px)',
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(34,211,238,0.18) 0%, transparent 70%)',
            transform: 'scale(1.15)'
          }} />

          <svg
            width="280"
            height="310"
            viewBox="0 0 280 310"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 22px rgba(34,211,238,0.55)) drop-shadow(0 0 8px rgba(59,130,246,0.4))' }}
          >
            <defs>
              {/* Neon glow filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2"/>
                <feMerge>
                  <feMergeNode in="blur2"/>
                  <feMergeNode in="blur1"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Shield body gradient - dark metallic blue */}
              <linearGradient id="shieldBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#060e28"/>
                <stop offset="40%" stopColor="#071232"/>
                <stop offset="100%" stopColor="#030a1e"/>
              </linearGradient>

              {/* Shield rim gradient - subtle highlight */}
              <linearGradient id="shieldRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#0c1a4a" stopOpacity="0.4"/>
              </linearGradient>

              {/* Inner shine */}
              <radialGradient id="shieldShine" cx="35%" cy="28%" r="50%">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#030a1e" stopOpacity="0"/>
              </radialGradient>

              {/* Cyan neon border gradient */}
              <linearGradient id="neonBorderGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="40%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>

            {/* Shield path - matching the image proportions */}
            {/* Main shield body fill */}
            <path
              d="M140 12 C140 12 240 42 250 42 L250 145 C250 210 200 265 140 295 C80 265 30 210 30 145 L30 42 C30 42 140 12 140 12 Z"
              fill="url(#shieldBodyGrad)"
            />

            {/* Inner shine overlay */}
            <path
              d="M140 12 C140 12 240 42 250 42 L250 145 C250 210 200 265 140 295 C80 265 30 210 30 145 L30 42 C30 42 140 12 140 12 Z"
              fill="url(#shieldShine)"
            />

            {/* Rim highlight (inner slightly smaller, lighter) */}
            <path
              d="M140 20 C140 20 236 48 245 48 L245 147 C245 207 197 260 140 288 C83 260 35 207 35 147 L35 48 C35 48 140 20 140 20 Z"
              fill="url(#shieldRimGrad)"
              opacity="0.3"
            />

            {/* Neon outer border - CYAN GLOW */}
            <path
              d="M140 12 C140 12 240 42 250 42 L250 145 C250 210 200 265 140 295 C80 265 30 210 30 145 L30 42 C30 42 140 12 140 12 Z"
              fill="none"
              stroke="url(#neonBorderGrad)"
              strokeWidth="3.5"
              filter="url(#neonGlow)"
            />

            {/* Extra bright inner edge highlight */}
            <path
              d="M140 18 C140 18 237 46 247 46 L247 145 C247 208 198 263 140 292 C82 263 33 208 33 145 L33 46 C33 46 140 18 140 18 Z"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* === Circular Logo (centered on shield) === */}
            {/* Outer glow ring behind circle */}
            <circle cx="140" cy="135" r="52" fill="rgba(59,130,246,0.08)" />

            {/* Logo circle border glow */}
            <circle cx="140" cy="135" r="46"
              fill="#0d1e54"
              stroke="#3b82f6"
              strokeWidth="2.5"
              filter="url(#neonGlow)"
            />

            {/* Inner dark blue circle */}
            <circle cx="140" cy="135" r="44" fill="#0a1840"/>

            {/* "e" letter path - drawn with SVG paths to match the circular e in the design */}
            {/* Horizontal cross bar */}
            <line x1="118" y1="135" x2="162" y2="135" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            {/* Arc forming the "e" */}
            <path
              d="M162 135 A22 22 0 1 0 140 157"
              fill="none"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* "ered bloo" text below the circle */}
            <text
              x="140" y="202"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="1"
            >
              ered bloo
            </text>
          </svg>
        </div>

        {/* ── Pedestal / Platform Base ── */}
        <div className="relative flex flex-col items-center" style={{ marginTop: -18 }}>

          {/* Glow bloom under platform */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            width: 280,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(34,211,238,0.22)',
            filter: 'blur(22px)',
            zIndex: 0
          }} />

          {/* Platform cylinder top (ellipse) - outermost */}
          <svg width="300" height="70" viewBox="0 0 300 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 1, position: 'relative' }}>
            <defs>
              <radialGradient id="platGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#0a1533" stopOpacity="0.9"/>
              </radialGradient>
              <filter id="platformGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Dark cylinder body */}
            <ellipse cx="150" cy="45" rx="130" ry="18" fill="#060e28" />
            <ellipse cx="150" cy="45" rx="130" ry="18" fill="url(#platGrad)" />

            {/* Outermost ring - bright cyan */}
            <ellipse cx="150" cy="42" rx="130" ry="16"
              fill="none" stroke="#22d3ee" strokeWidth="1.5"
              filter="url(#platformGlow)"
              opacity="0.9"
              style={{ animation: 'ringRotate1 8s linear infinite' }}
            />

            {/* Second ring */}
            <ellipse cx="150" cy="40" rx="100" ry="12"
              fill="none" stroke="#3b82f6" strokeWidth="1.2"
              filter="url(#platformGlow)"
              opacity="0.75"
            />

            {/* Third inner ring */}
            <ellipse cx="150" cy="38" rx="68" ry="8"
              fill="none" stroke="#22d3ee" strokeWidth="1"
              filter="url(#platformGlow)"
              opacity="0.6"
            />

            {/* Innermost tiny ring */}
            <ellipse cx="150" cy="36" rx="40" ry="4.5"
              fill="none" stroke="#60a5fa" strokeWidth="0.8"
              opacity="0.5"
            />

            {/* Bright glow line on top of platform surface */}
            <ellipse cx="150" cy="28" rx="130" ry="16"
              fill="none" stroke="#22d3ee" strokeWidth="0.5"
              opacity="0.35"
            />
          </svg>

        </div>
      </div>

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes shieldFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(4px); }
          66% { transform: translateY(6px) translateX(-3px); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          40% { transform: translateY(-12px) translateX(-5px); }
          70% { transform: translateY(5px) translateX(3px); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
