import React from 'react';

/**
 * Twisted Hemp Knot SVG with frayed fibers
 */
export function RopeKnot({ className = "", size = "md" }) {
  const scale = size === "lg" ? 1.3 : size === "sm" ? 0.75 : 1.0;
  const width = 28 * scale;
  const height = 18 * scale;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 28 18"
        fill="none"
        className="filter drop-shadow-[2px_2px_2px_rgba(0,0,0,0.7)]"
      >
        {/* Shadow base */}
        <ellipse cx="14" cy="9" rx="12" ry="7" fill="#1c130b" opacity="0.6" />
        
        {/* Main knot body */}
        <path
          d="M3 9C3 5 7 2 14 2C21 2 25 5 25 9C25 13 21 16 14 16C7 16 3 13 3 9Z"
          fill="#785736"
          stroke="#3d2714"
          strokeWidth="1.5"
        />
        
        {/* Crossed rope fibers */}
        <path
          d="M5 12C9 7 19 3 23 8"
          stroke="#9e754a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M5 6C9 11 19 15 23 10"
          stroke="#5c3f24"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 9C12 9 16 9 20 9"
          stroke="#c29462"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Small frayed fibers */}
        <line x1="2" y1="9" x2="0" y2="10" stroke="#a17a50" strokeWidth="1" />
        <line x1="3" y1="12" x2="1" y2="14" stroke="#a17a50" strokeWidth="1" />
        <line x1="26" y1="9" x2="28" y2="7" stroke="#a17a50" strokeWidth="1" />
        <line x1="25" y1="12" x2="27" y2="15" stroke="#a17a50" strokeWidth="1" />
      </svg>
    </div>
  );
}

/**
 * Big terminal knot with frayed tassel end for bottom of rope
 */
export function TerminalRopeKnot({ className = "" }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <RopeKnot size="lg" />
      {/* Frayed tassel fibers hanging down */}
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="-mt-1">
        <path d="M12 0L8 18" stroke="#8c653d" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 0L12 19" stroke="#b08453" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 0L16 17" stroke="#6d4c2b" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 0L5 15" stroke="#7d5833" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 0L19 16" stroke="#a67b4b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Continuous thick twisted hemp rope SVG strip
 */
export function RopeSegment({ height = "100%", width = 12, className = "" }) {
  return (
    <div className={`relative ${className}`} style={{ width: `${width}px`, height }}>
      <svg
        width={width}
        height="100%"
        preserveAspectRatio="none"
        className="filter drop-shadow-[2px_2px_3px_rgba(0,0,0,0.7)]"
      >
        <defs>
          <pattern id="rope-twist-pattern" width={width} height="16" patternUnits="userSpaceOnUse">
            {/* Base rope core */}
            <rect width={width} height="16" fill="#694a2c" />
            {/* Twisted diagonal fiber highlights */}
            <path d={`M0 0 L${width} 8 M0 8 L${width} 16`} stroke="#a67c4e" strokeWidth="2.5" />
            <path d={`M0 4 L${width} 12`} stroke="#d4a36a" strokeWidth="1.5" opacity="0.6" />
            <path d={`M0 2 L${width} 10 M0 10 L${width} 18`} stroke="#402b17" strokeWidth="2" />
          </pattern>
        </defs>
        {/* Rope body with dark borders */}
        <rect
          x="1"
          y="0"
          width={width - 2}
          height="100%"
          fill="url(#rope-twist-pattern)"
          stroke="#26170a"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

