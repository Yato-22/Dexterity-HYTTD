import React from 'react';

export default function BrokenPlankPanel({
  children,
  className = "",
  clipVariant = 1,
  plankCount = 3,
  hasDualRopeHoles = false,
  ropeHoles = [{ top: "8px", left: "22px" }, { top: "8px", right: "22px" }],
  isHit = false,
  rotation = 0,
}) {
  const clipClass =
    clipVariant === 1
      ? "clip-broken-plank-1"
      : clipVariant === 2
      ? "clip-broken-plank-2"
      : "clip-broken-plank-3";

  return (
    <div
      className={`relative broken-plank-shadow transition-transform duration-300 ${
        isHit ? 'plank-hit-shake' : ''
      } ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className={`relative ${clipClass} border-[3px] border-[#4A3A2C] overflow-hidden`}>
        {/* Horizontal Planks Background */}
        <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
          {plankCount === 2 ? (
            <>
              <div className="h-[48%] plank-row-top w-full">
                <div className="wood-crack-line top-[35%] left-[10%] w-[45%]" />
              </div>
              <div className="h-[52%] plank-row-bottom w-full">
                <div className="wood-crack-line top-[50%] right-[15%] w-[35%]" />
              </div>
            </>
          ) : (
            <>
              <div className="h-[32%] plank-row-top w-full">
                <div className="wood-crack-line top-[40%] left-[8%] w-[40%]" />
              </div>
              <div className="h-[36%] plank-row-mid w-full">
                <div className="wood-crack-line top-[30%] right-[12%] w-[50%]" />
              </div>
              <div className="h-[32%] plank-row-bottom w-full">
                <div className="wood-crack-line top-[60%] left-[15%] w-[35%]" />
              </div>
            </>
          )}
          <div className="absolute inset-0 wood-grain-overlay opacity-30" />
        </div>

        {/* Corner Nails & Missing Holes */}
        <div className="compact-nail top-2 left-2 pointer-events-none" />
        <div className="compact-nail top-2 right-2 pointer-events-none" />
        <div className="compact-nail bottom-2 left-2 pointer-events-none" />
        <div className="compact-nail bottom-2 right-2 pointer-events-none" />
        <div className="missing-nail-hole absolute top-[48%] right-2.5 pointer-events-none" />

        {/* Dual Drilled Holes for Left & Right Rope Strands */}
        {hasDualRopeHoles &&
          ropeHoles.map((pos, idx) => (
            <div
              key={idx}
              className="drilled-hole absolute z-20 pointer-events-none shadow-md"
              style={{
                top: pos.top || "8px",
                left: pos.left,
                right: pos.right,
              }}
            />
          ))}

        {/* Splinters on hit */}
        {isHit && (
          <>
            <div className="splinter-particle absolute top-1 left-6 w-1.5 h-1 bg-[#8f6a43] rounded-xs pointer-events-none z-30" />
            <div
              className="splinter-particle absolute top-3 right-8 w-1 h-1.5 bg-[#4a3828] rounded-xs pointer-events-none z-30"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="splinter-particle absolute bottom-2 left-12 w-2 h-1 bg-[#d8c39f] rounded-xs pointer-events-none z-30"
              style={{ animationDelay: '0.05s' }}
            />
          </>
        )}

        {/* Inner Content Area */}
        <div className="relative z-10 p-2.5 2xl:p-3">
          {children}
        </div>
      </div>
    </div>
  );
}
