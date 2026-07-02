import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Cloud9Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        {/* Outer cloud-9 shape background circle for luxury effect */}
        <circle cx="250" cy="250" r="230" fill="#0f172a" className="opacity-10" />
        
        {/* Deep dark background cloud shape */}
        <path
          d="M180 320 C110 320, 80 260, 100 200 C120 140, 180 110, 240 130 C290 100, 360 110, 390 160 C430 220, 410 300, 340 340 L340 390 L260 410 L250 350 L250 320 Z"
          fill="#0c1322"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Deep Blue Arc - represents main outline of the cloud and tail of the 9 */}
        <path
          d="M 235 345 C 170 345, 140 300, 140 250 C 140 190, 190 140, 250 140 C 310 140, 360 190, 360 250 C 360 330, 310 390, 250 410 C 230 416, 220 405, 224 390 C 228 375, 235 365, 250 360 C 290 345, 315 310, 315 250 C 315 210, 285 180, 250 180 C 215 180, 185 210, 185 250 C 185 285, 205 310, 235 310 Z"
          fill="#0284c7"
        />

        {/* Sky Blue Inner Arc - overlapping accent to match logo */}
        <path
          d="M 235 330 C 185 330, 160 295, 160 250 C 160 200, 200 160, 250 160 C 300 160, 340 200, 340 250 C 340 315, 300 365, 250 380 L 260 360 C 290 350, 315 315, 315 250 C 315 210, 285 180, 250 180 C 215 180, 185 210, 185 250 C 185 275, 195 295, 215 305 L 235 330 Z"
          fill="#38bdf8"
        />

        {/* Highlight Accent */}
        <circle cx="310" cy="180" r="12" fill="#e0f2fe" />
      </svg>
      <div>
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Cloud9
        </h1>
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
          Menu AI Platform
        </p>
      </div>
    </div>
  );
}
