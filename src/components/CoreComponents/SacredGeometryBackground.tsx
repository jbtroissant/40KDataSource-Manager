import React from 'react';
import { useTheme } from '@mui/material/styles';

const N = 12; // nombre de cercles pour la fleur de vie
const R = 120; // rayon des cercles de la fleur de vie
const CENTER = 300;

// Runes magiques unicode (exemple)
const RUNES = [
  '☉', // Soleil
  '☽', // Lune
  '☿', // Mercure
  '♀', // Vénus
  '♂', // Mars
  '♃', // Jupiter
  '♄', // Saturne
  '☉', // Or
  '☽', // Argent
  '☿', // Mercure (élément)
  '⚕', // Caducée
  '⚘', // Rose
  '⚚', // Caducée ailé
];
const NB_RUNES = 35;

const SacredGeometryBackground: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ style, className }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Couleurs selon le mode
  const strokeColor = isDark ? '#FFD700' : '#1976d2';
  const pointColor = isDark ? '#fffbe6' : '#b3e5fc';
  const runeColor = isDark ? 'rgba(255, 238, 0, 0.8)' : 'rgba(0, 178, 223, 0.8)';

  return (
    <svg
      viewBox="0 0 600 600"
      width="100%"
      height="100%"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, filter: 'brightness(0.8) blur(0.3px)', ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6fffe9" stopOpacity="1" />
          <stop offset="60%" stopColor="#0fffc0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <style>
          {`
            @font-face {
              font-family: 'Elvish';
              src: url('/fonts/Elvish.ttf') format('truetype');
              font-display: swap;
            }
            .rune-text {
              font-family: 'Elvish', cursive;
              font-size: 40px;
              opacity: 0.45;
              text-shadow: none;
              pointer-events: none;
              user-select: none;
            }
          `}
        </style>
      </defs>
      {/* Cercles principaux */}
      {[120, 180, 240, 300].map((r, i) => (
        <circle
          key={r}
          cx={CENTER}
          cy={CENTER}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={i === 0 ? 2.5 : 1.2}
          opacity={(0.7 - i * 0.12) * 0.6}
        />
      ))}
      {/* Fleur de Vie : cercles entrecroisés */}
      {[...Array(N)].map((_, i) => {
        const angle = (i * Math.PI * 2) / N;
        const x = CENTER + Math.cos(angle) * R;
        const y = CENTER + Math.sin(angle) * R;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.9"
            opacity={0.45 * 0.6}
          />
        );
      })}
      {/* Petits cercles sur un second anneau */}
      {[...Array(N)].map((_, i) => {
        const angle = (i * Math.PI * 2) / N;
        const x = CENTER + Math.cos(angle) * 180;
        const y = CENTER + Math.sin(angle) * 180;
        return (
          <circle
            key={i + 'petit'}
            cx={x}
            cy={y}
            r="12"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.1"
            opacity={0.6 * 0.6}
          />
        );
      })}
      {/* Rosaces et ellipses supplémentaires */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <ellipse
            key={i + 'ellipse'}
            cx={CENTER}
            cy={CENTER}
            rx={120 + 30 * (i % 3)}
            ry={240 - 20 * (i % 4)}
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.7"
            opacity={0.25 * 0.6}
            transform={`rotate(${(angle * 180) / Math.PI},${CENTER},${CENTER})`}
          />
        );
      })}
      {/* Points lumineux sur intersections de la fleur de vie */}
      {[...Array(N)].map((_, i) => {
        const angle = (i * Math.PI * 2) / N;
        const x = CENTER + Math.cos(angle) * R;
        const y = CENTER + Math.sin(angle) * R;
        return (
          <circle
            key={i + 'pt1'}
            cx={x}
            cy={y}
            r="5.5"
            fill={pointColor}
            filter="url(#blur)"
            opacity={0.85 * 0.6}
          />
        );
      })}
      {/* Points lumineux sur le grand cercle */}
      {[...Array(N)].map((_, i) => {
        const angle = (i * Math.PI * 2) / N;
        const x = CENTER + Math.cos(angle) * 240;
        const y = CENTER + Math.sin(angle) * 240;
        return (
          <circle
            key={i + 'pt2'}
            cx={x}
            cy={y}
            r="4.5"
            fill={pointColor}
            filter="url(#blur)"
            opacity={0.9 * 0.6}
          />
        );
      })}
      {/* Petits points sur les intersections secondaires */}
      {[...Array(N * 2)].map((_, i) => {
        const angle = (i * Math.PI * 2) / (N * 2);
        const x = CENTER + Math.cos(angle) * 150;
        const y = CENTER + Math.sin(angle) * 150;
        return (
          <circle
            key={i + 'pt3'}
            cx={x}
            cy={y}
            r="2.5"
            fill={pointColor}
            filter="url(#blur)"
            opacity={0.7 * 0.6}
          />
        );
      })}
      {/* Couronne de runes magiques à l'intérieur du grand cercle */}
      {[...Array(NB_RUNES)].map((_, i) => {
        const angle = (i * Math.PI * 2) / NB_RUNES - Math.PI / 2;
        const radius = 270; // padding par rapport au second cercle (r=240)
        const x = CENTER + Math.cos(angle) * radius;
        const y = CENTER + Math.sin(angle) * radius;
        return (
          <text
            key={'rune' + i}
            x={x}
            y={y}
            className="rune-text"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${(angle * 180) / Math.PI + 90},${x},${y})`}
            style={{ fill: runeColor, fontSize: '40' }}
          >
            {RUNES[i % RUNES.length]}
          </text>
        );
      })}
      {/* Traits rayonnants */}
      {[...Array(24)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 24;
        const x1 = CENTER + Math.cos(angle) * 80;
        const y1 = CENTER + Math.sin(angle) * 80;
        const x2 = CENTER + Math.cos(angle) * 260;
        const y2 = CENTER + Math.sin(angle) * 260;
        return (
          <line
            key={i + 'ray'}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="1.1"
            opacity={0.35 * 0.6}
          />
        );
      })}
    </svg>
  );
};

export default SacredGeometryBackground; 