import React from 'react';

export default function TorchGlow() {
  return (
    <>
      {/* Corner Glow Filters */}
      <div className="torch-glow-tl" />
      <div className="torch-glow-tr" />

      {/* Viking Wall Sconces in Top Corners */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-85 hidden md:block">
        <svg width="44" height="70" viewBox="0 0 44 70" fill="none">
          {/* Iron wall plate */}
          <rect x="18" y="24" width="8" height="42" rx="2" fill="#3D3025" stroke="#1F1813" strokeWidth="2" />
          <circle cx="22" cy="30" r="2.5" fill="#140E0A" />
          <circle cx="22" cy="60" r="2.5" fill="#140E0A" />
          {/* Sconce bracket */}
          <path d="M18 42C12 42 6 36 6 28V20H14" stroke="#5A4A3C" strokeWidth="3" strokeLinecap="round" />
          {/* Torch cup */}
          <polygon points="2,20 18,20 15,30 5,30" fill="#2E241C" stroke="#5A4A3C" strokeWidth="1.5" />
          {/* Flame */}
          <circle cx="10" cy="14" r="8" fill="#FF7A1A" opacity="0.8" filter="blur(3px)" className="animate-pulse" />
          <circle cx="10" cy="12" r="4" fill="#FFD700" opacity="0.9" filter="blur(1px)" />
        </svg>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-85 hidden md:block">
        <svg width="44" height="70" viewBox="0 0 44 70" fill="none">
          {/* Iron wall plate */}
          <rect x="18" y="24" width="8" height="42" rx="2" fill="#3D3025" stroke="#1F1813" strokeWidth="2" />
          <circle cx="22" cy="30" r="2.5" fill="#140E0A" />
          <circle cx="22" cy="60" r="2.5" fill="#140E0A" />
          {/* Sconce bracket */}
          <path d="M26 42C32 42 38 36 38 28V20H30" stroke="#5A4A3C" strokeWidth="3" strokeLinecap="round" />
          {/* Torch cup */}
          <polygon points="26,20 42,20 39,30 29,30" fill="#2E241C" stroke="#5A4A3C" strokeWidth="1.5" />
          {/* Flame */}
          <circle cx="34" cy="14" r="8" fill="#FF7A1A" opacity="0.8" filter="blur(3px)" className="animate-pulse" />
          <circle cx="34" cy="12" r="4" fill="#FFD700" opacity="0.9" filter="blur(1px)" />
        </svg>
      </div>
    </>
  );
}

