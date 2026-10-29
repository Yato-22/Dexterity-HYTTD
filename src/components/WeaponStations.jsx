import React from 'react';
import { motion } from 'framer-motion';

// 4 Small Decorative Warriors along the bottom of the arena
export default function WeaponStations({
  recoilingStation = null, // 'dagger' | 'axe' | 'catapult' | 'ballista'
  isDefeated = false,
}) {
  return (
    <div className="relative w-full flex items-end justify-center gap-6 sm:gap-10 2xl:gap-14 px-2 z-20 pointer-events-none select-none">
      {/* 1. DAGGER THROWER */}
      <div className="flex flex-col items-center pointer-events-none">
        <motion.div
          animate={
            isDefeated
              ? { y: [-1, -4, -1], rotate: [-1, 1, -1] }
              : recoilingStation === 'dagger'
              ? { x: [0, 4, -6, 2, 0], y: [0, -3, 2, 0], scale: [1, 1.05, 0.96, 1] }
              : { y: [0, -1.2, 0] }
          }
          transition={
            isDefeated
              ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              : recoilingStation === 'dagger'
              ? { duration: 0.35, ease: "easeOut" }
              : { repeat: Infinity, duration: 3.4, ease: "easeInOut" }
          }
          className="relative h-[6.5vh] max-h-[64px] min-h-[44px] w-auto aspect-[80/88] flex items-end justify-center"
        >
          <svg viewBox="0 0 80 88" className="w-full h-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <defs>
              {/* Sunset warm rim light gradient */}
              <linearGradient id="sunsetRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFAA4A" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FF7A1A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3A2416" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="darkSilhouette" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E2017" />
                <stop offset="100%" stopColor="#140E0A" />
              </linearGradient>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="40" cy="84" rx="22" ry="4" fill="#000000" opacity="0.45" />

            {/* Swaying Fur Cape */}
            <motion.path
              d="M28 32 C22 45, 18 68, 22 80 C32 83, 48 83, 58 80 C62 68, 58 45, 52 32 Z"
              fill="url(#darkSilhouette)"
              stroke="#523927"
              strokeWidth="1.2"
              animate={isDefeated ? { scaleY: 0.95 } : { rotate: [-1.2, 1.2, -1.2] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
              style={{ transformOrigin: "40px 32px" }}
            />

            {/* Viking Body / Tunic */}
            <path
              d="M32 30 C30 45, 30 65, 33 78 L47 78 C50 65, 50 45, 48 30 Z"
              fill="#1F150F"
            />

            {/* Left Arm with Round Viking Shield */}
            <g transform="translate(14, 30)">
              <circle cx="12" cy="18" r="14" fill="#2B1D14" stroke="#FFAA4A" strokeWidth="1" />
              <circle cx="12" cy="18" r="12" fill="#3D291C" stroke="#140E0A" strokeWidth="1.5" />
              {/* Shield Boss */}
              <circle cx="12" cy="18" r="4.5" fill="#5A4A3C" stroke="#FFAA4A" strokeWidth="1" />
              {/* Rim highlight */}
              <path d="M4 10 A12 12 0 0 1 20 10" fill="none" stroke="#FFB347" strokeWidth="1.8" opacity="0.8" />
            </g>

            {/* Right Arm Cocked with Dagger or Raised in Victory */}
            <motion.g
              animate={
                isDefeated
                  ? { rotate: -65, x: 2, y: -8 }
                  : recoilingStation === 'dagger'
                  ? { rotate: [0, -35, 15, 0], x: [0, -4, 4, 0] }
                  : { rotate: [0, 2, 0] }
              }
              transition={{ duration: recoilingStation === 'dagger' ? 0.3 : 2 }}
              style={{ transformOrigin: "52px 34px" }}
            >
              <path d="M50 34 L62 44 L64 36" fill="none" stroke="#2B1D14" strokeWidth="5.5" strokeLinecap="round" />
              {/* Dagger in hand */}
              <g transform="translate(62, 34) rotate(-30)">
                <path d="M0 0 L14 -4 L0 -8 Z" fill="#D8D8D8" stroke="#FFAA4A" strokeWidth="0.8" />
                <rect x="-4" y="-5" width="4" height="2" fill="#8B5A2B" />
                <circle cx="-4" cy="-4" r="1.5" fill="#FFAA4A" />
              </g>
            </motion.g>

            {/* Helmet & Head */}
            <g transform="translate(32, 14)">
              {/* Head shape */}
              <circle cx="8" cy="8" r="7.5" fill="#1F150F" />
              {/* Spangenhelm Dome */}
              <path d="M1 8 C1 1, 15 1, 15 8 Z" fill="#443225" stroke="#FFAA4A" strokeWidth="1" />
              {/* Golden Sunset Rim on Helmet Top */}
              <path d="M3 5 C5 2, 11 2, 13 5" fill="none" stroke="#FFD285" strokeWidth="1.6" />
              {/* Left Horn */}
              <path d="M1 7 C-3 5, -5 0, -2 -3 C-1 2, 2 4, 3 6" fill="#D9C29E" stroke="#5A3E26" strokeWidth="0.8" />
              {/* Right Horn */}
              <path d="M15 7 C19 5, 21 0, 18 -3 C17 2, 14 4, 13 6" fill="#D9C29E" stroke="#5A3E26" strokeWidth="0.8" />
            </g>
          </svg>
        </motion.div>
        <span className="font-heading text-[8.5px] 2xl:text-[10px] font-bold text-[#D8C39F]/80 uppercase tracking-widest mt-0.5">
          DAGGER
        </span>
      </div>

      {/* 2. AXE THROWER */}
      <div className="flex flex-col items-center pointer-events-none">
        <motion.div
          animate={
            isDefeated
              ? { y: [-1, -4, -1], rotate: [1, -1, 1] }
              : recoilingStation === 'axe'
              ? { x: [0, 6, -8, 2, 0], y: [0, -4, 3, 0], scale: [1, 1.06, 0.95, 1] }
              : { y: [0, -1.3, 0] }
          }
          transition={
            isDefeated
              ? { repeat: Infinity, duration: 1.25, delay: 0.1, ease: "easeInOut" }
              : recoilingStation === 'axe'
              ? { duration: 0.45, ease: "easeOut" }
              : { repeat: Infinity, duration: 3.7, delay: 0.4, ease: "easeInOut" }
          }
          className="relative h-[6.5vh] max-h-[64px] min-h-[44px] w-auto aspect-[88/96] flex items-end justify-center"
        >
          <svg viewBox="0 0 88 96" className="w-full h-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <ellipse cx="44" cy="90" rx="24" ry="4.5" fill="#000000" opacity="0.45" />

            {/* Heavy Berserker Cloak */}
            <motion.path
              d="M26 36 C18 52, 14 74, 20 86 C32 89, 56 89, 68 86 C74 74, 70 52, 62 36 Z"
              fill="#241810"
              stroke="#5A3A25"
              strokeWidth="1.2"
              animate={isDefeated ? { scaleY: 0.95 } : { rotate: [1, -1, 1] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              style={{ transformOrigin: "44px 36px" }}
            />

            {/* Broad Back Silhouette */}
            <path d="M30 34 C26 50, 28 72, 32 84 L56 84 C60 72, 62 50, 58 34 Z" fill="#18110C" />

            {/* Left Arm Braced */}
            <path d="M32 38 L20 54 L28 62" fill="none" stroke="#2B1D14" strokeWidth="6" strokeLinecap="round" />

            {/* Right Arm Holding Raised Battleaxe */}
            <motion.g
              animate={
                isDefeated
                  ? { rotate: -70, x: -2, y: -12 }
                  : recoilingStation === 'axe'
                  ? { rotate: [0, -45, 20, 0], x: [0, -6, 6, 0] }
                  : { rotate: [0, -3, 0] }
              }
              transition={{ duration: recoilingStation === 'axe' ? 0.4 : 2.5 }}
              style={{ transformOrigin: "58px 38px" }}
            >
              {/* Arm */}
              <path d="M56 38 L70 48 L68 32" fill="none" stroke="#2B1D14" strokeWidth="6" strokeLinecap="round" />
              {/* Battleaxe */}
              <g transform="translate(68, 28) rotate(-25)">
                {/* Shaft */}
                <line x1="0" y1="20" x2="0" y2="-22" stroke="#68472B" strokeWidth="3" strokeLinecap="round" />
                {/* Double axe blade */}
                <path
                  d="M-1 -12 C-8 -22, -16 -18, -14 -6 C-12 -2, -6 -6, -1 -6 Z"
                  fill="#7A7A7A"
                  stroke="#FFB347"
                  strokeWidth="0.8"
                />
                <path
                  d="M1 -12 C8 -22, 16 -18, 14 -6 C12 -2, 6 -6, 1 -6 Z"
                  fill="#9A9A9A"
                  stroke="#FFD285"
                  strokeWidth="1"
                />
                {/* Iron center wrap */}
                <rect x="-2.5" y="-14" width="5" height="10" fill="#3D3025" />
              </g>
            </motion.g>

            {/* Helmet & Head */}
            <g transform="translate(36, 16)">
              <circle cx="8" cy="8" r="8" fill="#18110C" />
              <path d="M0 9 C0 1, 16 1, 16 9 Z" fill="#3F3024" stroke="#FFAA4A" strokeWidth="1.2" />
              {/* Top crest & rim */}
              <path d="M2 5 C6 1.5, 10 1.5, 14 5" fill="none" stroke="#FFD285" strokeWidth="1.8" />
              <polygon points="8,0 6,4 10,4" fill="#FFAA4A" />
              {/* Big Curved Horns */}
              <path d="M-1 8 C-7 5, -9 -2, -4 -6 C-3 0, 1 3, 2 7" fill="#E8D5B7" stroke="#4A3420" strokeWidth="0.9" />
              <path d="M17 8 C23 5, 25 -2, 20 -6 C19 0, 15 3, 14 7" fill="#E8D5B7" stroke="#4A3420" strokeWidth="0.9" />
            </g>
          </svg>
        </motion.div>
        <span className="font-heading text-[8.5px] 2xl:text-[10px] font-bold text-[#D8C39F]/80 uppercase tracking-widest mt-0.5">
          AXE
        </span>
      </div>

      {/* 3. CATAPULT CREW (Wooden Frame + 2 Humans) */}
      <div className="flex flex-col items-center pointer-events-none">
        <motion.div
          animate={
            isDefeated
              ? { y: [-1, -3, -1] }
              : recoilingStation === 'catapult'
              ? { x: [0, 5, -7, 3, 0], y: [0, 3, -3, 0], scale: [1, 0.97, 1.02, 1] }
              : { y: [0, -1, 0] }
          }
          transition={
            isDefeated
              ? { repeat: Infinity, duration: 1.3, delay: 0.2, ease: "easeInOut" }
              : recoilingStation === 'catapult'
              ? { duration: 0.5, ease: "easeOut" }
              : { repeat: Infinity, duration: 4.0, ease: "easeInOut" }
          }
          className="relative h-[6.5vh] max-h-[64px] min-h-[44px] w-auto aspect-[130/96] flex items-end justify-center"
        >
          <svg viewBox="0 0 130 96" className="w-full h-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {/* Ground shadow */}
            <ellipse cx="65" cy="88" rx="48" ry="6" fill="#000000" opacity="0.45" />

            {/* Crew Member 1: Winch Tensioner / Operator (Left side, crouching) */}
            <motion.g
              animate={
                isDefeated
                  ? { y: -6, rotate: -8 }
                  : recoilingStation === 'catapult'
                  ? { x: [-2, -6, 2, 0], y: [0, 4, 0] }
                  : { y: [0, -1, 0] }
              }
              transition={{ duration: 0.4 }}
              transform="translate(14, 46)"
            >
              {/* Body crouching */}
              <path d="M8 20 C6 30, 4 38, 8 42 L20 42 C22 38, 20 30, 18 20 Z" fill="#1C140E" />
              {/* Cape */}
              <path d="M4 22 C-1 30, -2 40, 2 44 C8 45, 18 45, 22 44" fill="#2E2016" stroke="#4A3423" strokeWidth="1" />
              {/* Head with Round Helmet */}
              <circle cx="13" cy="12" r="6" fill="#140E0A" />
              <path d="M7 12 C7 6, 19 6, 19 12 Z" fill="#443427" stroke="#FFB347" strokeWidth="1" />
              {/* Arms pulling rope cord */}
              <path d="M12 24 L22 28 L30 26" fill="none" stroke="#2B1D14" strokeWidth="4" strokeLinecap="round" />
            </motion.g>

            {/* CATAPULT WOODEN CHASSIS & BEAMS */}
            <g id="catapult-frame">
              {/* Wheels / base stops */}
              <circle cx="42" cy="84" r="8" fill="#2E2016" stroke="#5A4330" strokeWidth="2" />
              <circle cx="42" cy="84" r="3" fill="#140E0A" />
              <circle cx="88" cy="84" r="8" fill="#2E2016" stroke="#5A4330" strokeWidth="2" />
              <circle cx="88" cy="84" r="3" fill="#140E0A" />

              {/* Main horizontal beam */}
              <rect x="30" y="74" width="70" height="7" rx="1.5" fill="#483424" stroke="#24180F" strokeWidth="1.2" />
              {/* Sunset rim on beam */}
              <line x1="30" y1="74" x2="100" y2="74" stroke="#FFAA4A" strokeWidth="1" opacity="0.8" />

              {/* Vertical stanchions / A-frame */}
              <polygon points="60,42 66,42 74,75 66,75" fill="#3D2B1D" stroke="#1F150D" strokeWidth="1" />
              <polygon points="66,42 72,42 62,75 54,75" fill="#4E3827" stroke="#1F150D" strokeWidth="1" />
              {/* Cross buffer crossbeam at top */}
              <rect x="52" y="40" width="28" height="5.5" rx="1" fill="#5A412D" stroke="#24180F" strokeWidth="1" />
              {/* Iron hinge bolt */}
              <circle cx="65" cy="58" r="4.5" fill="#1F1813" stroke="#FFAA4A" strokeWidth="1.2" />
            </g>

            {/* Catapult Throwing Arm (Animates vigorously on fire!) */}
            <motion.g
              animate={
                recoilingStation === 'catapult'
                  ? { rotate: [0, 48, -12, 4, 0] }
                  : { rotate: [0, 1.5, 0] }
              }
              transition={{ duration: recoilingStation === 'catapult' ? 0.6 : 3 }}
              style={{ transformOrigin: "65px 58px" }}
            >
              {/* Timber arm */}
              <line x1="65" y1="58" x2="38" y2="24" stroke="#5A412D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="65" y1="58" x2="38" y2="24" stroke="#FFAA4A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              {/* Spoon cup with glowing boulder */}
              <ellipse cx="36" cy="22" rx="7" ry="5" fill="#382518" stroke="#FFAA4A" strokeWidth="1" />
              {/* Flaming brimstone boulder (hidden briefly after firing) */}
              <motion.circle
                cx="36"
                cy="20"
                r="5"
                fill="#FF6A00"
                stroke="#FFD700"
                strokeWidth="1.2"
                animate={
                  recoilingStation === 'catapult'
                    ? { opacity: [1, 0, 0, 1], scale: [1, 0, 0, 1] }
                    : { scale: [1, 1.08, 1] }
                }
                transition={{ duration: recoilingStation === 'catapult' ? 0.9 : 2, repeat: recoilingStation === 'catapult' ? 0 : Infinity }}
              />
            </motion.g>

            {/* Crew Member 2: Spotter / Commander (Right side, standing) */}
            <motion.g
              animate={
                isDefeated
                  ? { y: -8, rotate: 6 }
                  : recoilingStation === 'catapult'
                  ? { x: [0, 4, -2, 0], y: [0, -2, 0] }
                  : { y: [0, -1.5, 0] }
              }
              transition={{ duration: 0.4 }}
              transform="translate(94, 38)"
            >
              {/* Body */}
              <path d="M10 24 C8 36, 6 50, 10 52 L22 52 C24 50, 22 36, 20 24 Z" fill="#1C140E" />
              {/* Cape */}
              <path d="M6 26 C2 36, 1 48, 6 52 C12 53, 22 53, 26 52" fill="#2E2016" stroke="#4A3423" strokeWidth="1" />
              {/* Head with Horned Helmet */}
              <circle cx="15" cy="14" r="6.5" fill="#140E0A" />
              <path d="M9 14 C9 7, 21 7, 21 14 Z" fill="#443427" stroke="#FFB347" strokeWidth="1" />
              <path d="M8 13 C5 10, 3 6, 6 4 C7 7, 9 10, 10 12" fill="#D9C29E" stroke="#4A3420" strokeWidth="0.7" />
              <path d="M22 13 C25 10, 27 6, 24 4 C23 7, 21 10, 20 12" fill="#D9C29E" stroke="#4A3420" strokeWidth="0.7" />
              {/* Arm pointing forward at dragon or celebrating */}
              <motion.path
                d={isDefeated ? "M14 26 L22 12 L28 8" : "M14 26 L26 22 L34 20"}
                fill="none"
                stroke="#2B1D14"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </motion.g>
          </svg>
        </motion.div>
        <span className="font-heading text-[8.5px] 2xl:text-[10px] font-bold text-[#D8C39F]/80 uppercase tracking-widest mt-0.5">
          CATAPULT
        </span>
      </div>

      {/* 4. BALLISTA CREW (Wooden Frame + 2 Humans) */}
      <div className="flex flex-col items-center pointer-events-none">
        <motion.div
          animate={
            isDefeated
              ? { y: [-1, -3, -1] }
              : recoilingStation === 'ballista'
              ? { x: [0, 8, -6, 2, 0], y: [0, 2, -1, 0], scale: [1, 1.04, 0.97, 1] }
              : { y: [0, -1.2, 0] }
          }
          transition={
            isDefeated
              ? { repeat: Infinity, duration: 1.35, delay: 0.3, ease: "easeInOut" }
              : recoilingStation === 'ballista'
              ? { duration: 0.4, ease: "easeOut" }
              : { repeat: Infinity, duration: 4.2, delay: 0.6, ease: "easeInOut" }
          }
          className="relative h-[6.5vh] max-h-[64px] min-h-[44px] w-auto aspect-[130/96] flex items-end justify-center"
        >
          <svg viewBox="0 0 130 96" className="w-full h-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {/* Ground shadow */}
            <ellipse cx="65" cy="88" rx="46" ry="6" fill="#000000" opacity="0.45" />

            {/* Crew 1: Sighting Gunner (Left side, aiming down the rail) */}
            <motion.g
              animate={
                isDefeated
                  ? { y: -8, rotate: -8 }
                  : recoilingStation === 'ballista'
                  ? { x: [-1, -5, 2, 0], y: [0, 3, 0] }
                  : { y: [0, -1, 0] }
              }
              transition={{ duration: 0.35 }}
              transform="translate(18, 42)"
            >
              {/* Crouching sighting stance */}
              <path d="M10 24 C8 34, 6 44, 10 46 L22 46 C24 44, 22 34, 20 24 Z" fill="#1C140E" />
              {/* Cape */}
              <path d="M6 26 C2 36, 0 44, 4 48 C10 49, 20 49, 24 48" fill="#2A1C12" stroke="#483220" strokeWidth="1" />
              {/* Head leaning forward */}
              <circle cx="15" cy="14" r="6.5" fill="#140E0A" />
              <path d="M9 14 C9 7, 21 7, 21 14 Z" fill="#443427" stroke="#FFAA4A" strokeWidth="1.2" />
              <path d="M7 13 C4 10, 2 6, 5 4 C6 7, 8 10, 9 12" fill="#D9C29E" stroke="#4A3420" strokeWidth="0.7" />
              <path d="M23 13 C26 10, 28 6, 25 4 C24 7, 22 10, 21 12" fill="#D9C29E" stroke="#4A3420" strokeWidth="0.7" />
              {/* Arm on trigger lever */}
              <path d="M16 26 L26 30 L34 28" fill="none" stroke="#2B1D14" strokeWidth="4.5" strokeLinecap="round" />
            </motion.g>

            {/* BALLISTA FRAME & TRIPOD */}
            <g id="ballista-frame">
              {/* Tripod legs */}
              <line x1="65" y1="62" x2="44" y2="86" stroke="#3A271B" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="65" y1="62" x2="86" y2="86" stroke="#3A271B" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="65" y1="62" x2="65" y2="88" stroke="#4A3424" strokeWidth="5" strokeLinecap="round" />
              {/* Iron bracket pivot */}
              <circle cx="65" cy="62" r="5" fill="#1F1813" stroke="#FFAA4A" strokeWidth="1.2" />

              {/* Main arrow guide stock (aiming up-left towards dragon head) */}
              <line x1="42" y1="46" x2="88" y2="68" stroke="#483424" strokeWidth="6.5" strokeLinecap="round" />
              <line x1="42" y1="44.5" x2="88" y2="66.5" stroke="#FFB347" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* Composite Bow Arms & String (Snaps forward violently on fire!) */}
            <motion.g
              animate={
                recoilingStation === 'ballista'
                  ? { scaleX: [1, 0.7, 1.15, 1], scaleY: [1, 1.3, 0.9, 1] }
                  : { scaleX: [1, 1.02, 1] }
              }
              transition={{ duration: recoilingStation === 'ballista' ? 0.35 : 3.5 }}
              style={{ transformOrigin: "52px 51px" }}
            >
              {/* Left bow limb */}
              <path d="M52 51 C46 36, 40 24, 48 18" fill="none" stroke="#68482E" strokeWidth="4" strokeLinecap="round" />
              <path d="M52 51 C46 36, 40 24, 48 18" fill="none" stroke="#FFD285" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
              {/* Right bow limb */}
              <path d="M52 51 C58 66, 64 78, 56 84" fill="none" stroke="#68482E" strokeWidth="4" strokeLinecap="round" />
              {/* Bowstring */}
              <line x1="48" y1="18" x2="82" y2="65" stroke="#E2D4C0" strokeWidth="1.6" />
              <line x1="56" y1="84" x2="82" y2="65" stroke="#E2D4C0" strokeWidth="1.6" />

              {/* Heavy Piercing Bolt (Ready in track, temporarily hides on fire) */}
              <motion.g
                animate={
                  recoilingStation === 'ballista'
                    ? { opacity: [1, 0, 0, 1], x: [0, -30, -30, 0], y: [0, -15, -15, 0] }
                    : { scale: [1, 1, 1] }
                }
                transition={{ duration: recoilingStation === 'ballista' ? 0.5 : 1 }}
              >
                <line x1="38" y1="44" x2="74" y2="61" stroke="#333333" strokeWidth="3" />
                {/* Iron point */}
                <polygon points="34,42 42,42 40,48" fill="#E0E0E0" stroke="#FFB347" strokeWidth="0.8" />
                {/* Fletching */}
                <path d="M70 59 L76 56 L74 63 Z" fill="#8B2500" />
              </motion.g>
            </motion.g>

            {/* Crew 2: Winch Tensioner & Loader (Right side, standing with shield) */}
            <motion.g
              animate={
                isDefeated
                  ? { y: -8, rotate: 6 }
                  : recoilingStation === 'ballista'
                  ? { x: [0, 4, -2, 0], y: [0, -2, 0] }
                  : { y: [0, -1.2, 0] }
              }
              transition={{ duration: 0.35 }}
              transform="translate(94, 38)"
            >
              {/* Body */}
              <path d="M10 24 C8 36, 6 48, 10 52 L22 52 C24 48, 22 36, 20 24 Z" fill="#1C140E" />
              {/* Shield on back */}
              <ellipse cx="8" cy="36" rx="5" ry="12" fill="#2E2016" stroke="#FFB347" strokeWidth="1" />
              {/* Head with Round Spangenhelm */}
              <circle cx="15" cy="14" r="6.5" fill="#140E0A" />
              <path d="M9 14 C9 7, 21 7, 21 14 Z" fill="#443427" stroke="#FFAA4A" strokeWidth="1.2" />
              {/* Arm braced */}
              <path d="M14 26 L6 34 L12 40" fill="none" stroke="#2B1D14" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
          </svg>
        </motion.div>
        <span className="font-heading text-[8.5px] 2xl:text-[10px] font-bold text-[#D8C39F]/80 uppercase tracking-widest mt-0.5">
          BALLISTA
        </span>
      </div>
    </div>
  );
}

