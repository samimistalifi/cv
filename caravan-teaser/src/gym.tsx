import React from 'react';
import {accent, accentDeep} from './theme';

/** Side-view barbell silhouette with an accent rim light. viewBox 1600 x 420. */
export const Barbell: React.FC<{width: number; glow?: number}> = ({width, glow = 1}) => {
  const plates = [
    {w: 58, h: 400},
    {w: 50, h: 340},
    {w: 42, h: 270},
  ];
  const side = (dir: 1 | -1) => {
    let x = dir === 1 ? 1600 - 250 : 250;
    return plates.map((p, i) => {
      const px = dir === 1 ? x : x - p.w;
      x += dir * (p.w + 6);
      return (
        <g key={`${dir}${i}`}>
          <rect x={px} y={210 - p.h / 2} width={p.w} height={p.h} rx={10} fill="url(#plateFill)" stroke={accent} strokeOpacity={0.85 * glow} strokeWidth={3} />
          <rect x={px + p.w * 0.35} y={210 - p.h / 2 + 14} width={p.w * 0.12} height={p.h - 28} rx={3} fill="#ffffff" opacity={0.08} />
        </g>
      );
    });
  };
  return (
    <svg width={width} height={(width * 420) / 1600} viewBox="0 0 1600 420" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${24 * glow}px ${accent}aa)`}}>
      <defs>
        <linearGradient id="plateFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4249" />
          <stop offset="0.5" stopColor="#15191d" />
          <stop offset="1" stopColor="#0c0f12" />
        </linearGradient>
        <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8dee4" />
          <stop offset="0.5" stopColor="#6b747c" />
          <stop offset="1" stopColor="#2a3036" />
        </linearGradient>
        <pattern id="knurl" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8 L8 0 M-2 2 L2 -2 M6 10 L10 6" stroke="#000" strokeOpacity="0.35" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect x={0} y={198} width={1600} height={24} rx={8} fill="url(#barFill)" />
      <rect x={430} y={198} width={740} height={24} fill="url(#knurl)" />
      <rect x={180} y={186} width={70} height={48} rx={8} fill="url(#barFill)" />
      <rect x={1350} y={186} width={70} height={48} rx={8} fill="url(#barFill)" />
      {side(-1)}
      {side(1)}
    </svg>
  );
};

/** Front view of a weight plate. */
export const Plate: React.FC<{size: number; rotation: number; glow?: number}> = ({size, rotation, glow = 1}) => (
  <svg width={size} height={size} viewBox="-500 -500 1000 1000" style={{filter: `drop-shadow(0 0 ${40 * glow}px ${accent}88)`}}>
    <defs>
      <radialGradient id="plateFace" cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#3b434b" />
        <stop offset="0.6" stopColor="#16191d" />
        <stop offset="1" stopColor="#090b0d" />
      </radialGradient>
      <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={accent} />
        <stop offset="1" stopColor={accentDeep} />
      </linearGradient>
    </defs>
    <circle r={490} fill="url(#plateFace)" stroke="url(#rim)" strokeWidth={12} />
    <g transform={`rotate(${rotation})`}>
      <circle r={430} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={4} />
      <circle r={330} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={22} />
      <circle r={330} fill="none" stroke={accent} strokeOpacity={0.35 * glow} strokeWidth={3} />
      {new Array(3).fill(0).map((_, i) => (
        <path
          key={i}
          d="M -60 -270 A 280 280 0 0 1 60 -270 L 50 -210 A 220 220 0 0 0 -50 -210 Z"
          transform={`rotate(${i * 120})`}
          fill="#05070a"
          stroke={accent}
          strokeOpacity={0.4}
          strokeWidth={2}
        />
      ))}
      {new Array(8).fill(0).map((_, i) => (
        <circle key={i} cx={0} cy={-150} r={9} transform={`rotate(${i * 45})`} fill="#5c656d" />
      ))}
      <path d="M -420 0 A 420 420 0 0 1 0 -420" fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={10} strokeLinecap="round" />
    </g>
    <circle r={110} fill="#20262c" stroke="#8a939b" strokeWidth={6} />
    <circle r={48} fill="#050607" />
  </svg>
);
