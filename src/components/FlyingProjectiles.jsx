import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_TIMINGS } from '../data/gameData';

export default function FlyingProjectiles({
  pendingFireEvents = [],
  onProjectileImpact,
  onStationRecoil,
  onConsumeEvent,
}) {
  const [activeProjectiles, setActiveProjectiles] = useState([]);
  const queueRef = useRef([]);
  const activeCountRef = useRef(0);
  const lastLaunchTimeRef = useRef(0);

  // Keep queueRef updated with incoming pending events, ignoring stale events
  useEffect(() => {
    if (pendingFireEvents.length > 0) {
      const now = Date.now();
      pendingFireEvents.forEach((ev) => {
        // Discard stale events (> 4 seconds old) so they never replay on screen transitions
        if (ev.timestamp && now - ev.timestamp > 4000) return;
        if (!queueRef.current.some((q) => q.id === ev.id)) {
          queueRef.current.push(ev);
        }
      });
    }
  }, [pendingFireEvents]);

  // Queue pump timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLast = now - lastLaunchTimeRef.current;

      if (
        queueRef.current.length > 0 &&
        activeCountRef.current < (ANIMATION_TIMINGS.maxActiveProjectiles || 6) &&
        timeSinceLast >= (ANIMATION_TIMINGS.queueStaggerMs || 200)
      ) {
        // Pop next event from queue
        const nextEvent = queueRef.current.shift();
        if (!nextEvent) return;

        if (onConsumeEvent) {
          onConsumeEvent(nextEvent.id);
        }

        lastLaunchTimeRef.current = now;
        activeCountRef.current += 1;

        // Trigger weapon station recoil immediately upon firing
        if (onStationRecoil) {
          onStationRecoil(nextEvent.weaponKey);
        }

        // Check prefers-reduced-motion
        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          // Immediately trigger impact flash with no flying animation
          activeCountRef.current = Math.max(0, activeCountRef.current - 1);
          if (onProjectileImpact) onProjectileImpact(nextEvent);
          return;
        }

        // Determine coordinates based on weapon type and target zone
        // Station starting points (% of battlefield container)
        const stationStarts = {
          dagger: { x: 28, y: 88 },
          axe: { x: 42, y: 88 },
          catapult: { x: 58, y: 88 },
          ballista: { x: 74, y: 88 },
        };

        // Dragon hit zone impact centers (% of battlefield container)
        const zoneTargets = {
          chest: { x: 51, y: 46 },
          head: { x: 53, y: 26 },
          leftWing: { x: 26, y: 28 },
          rightWing: { x: 74, y: 28 },
        };

        const start = stationStarts[nextEvent.weaponKey] || { x: 50, y: 88 };
        const baseTarget = zoneTargets[nextEvent.targetZone] || { x: 50, y: 46 };

        // Subtle jitter for visual variety
        const jitterX = (Math.random() - 0.5) * 4;
        const jitterY = (Math.random() - 0.5) * 4;
        const target = { x: baseTarget.x + jitterX, y: baseTarget.y + jitterY };

        // Flight duration based on weapon type
        const flightDurationMs =
          nextEvent.weaponKey === 'dagger'
            ? ANIMATION_TIMINGS.daggerFlightMs || 450
            : nextEvent.weaponKey === 'axe'
            ? ANIMATION_TIMINGS.axeFlightMs || 650
            : nextEvent.weaponKey === 'catapult'
            ? ANIMATION_TIMINGS.catapultFlightMs || 900
            : ANIMATION_TIMINGS.ballistaFlightMs || 380;

        const projectileId = `proj-${nextEvent.id}-${Date.now()}`;

        const newProjectile = {
          id: projectileId,
          event: nextEvent,
          weaponKey: nextEvent.weaponKey,
          targetZone: nextEvent.targetZone,
          startX: start.x,
          startY: start.y,
          targetX: target.x,
          targetY: target.y,
          durationSec: flightDurationMs / 1000,
        };

        setActiveProjectiles((prev) => [...prev, newProjectile]);

        // When projectile completes flight, trigger impact callback and remove
        setTimeout(() => {
          activeCountRef.current = Math.max(0, activeCountRef.current - 1);
          setActiveProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
          if (onProjectileImpact) {
            onProjectileImpact(nextEvent, target);
          }
        }, flightDurationMs);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onProjectileImpact, onStationRecoil]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-25">
      <AnimatePresence>
        {activeProjectiles.map((proj) => {
          const { weaponKey, startX, startY, targetX, targetY, durationSec, id } = proj;

          // 1. DAGGER: Fast straight line, spinning, 2-3 small daggers
          if (weaponKey === 'dagger') {
            return (
              <React.Fragment key={id}>
                {[0, 0.05, 0.1].map((delaySec, subIdx) => {
                  const subJitterX = (subIdx - 1) * 1.5;
                  const subJitterY = (subIdx - 1) * 1.5;

                  return (
                    <motion.div
                      key={`${id}-${subIdx}`}
                      initial={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        opacity: 0,
                        rotate: 0,
                        scale: 0.7,
                      }}
                      animate={{
                        left: `${targetX + subJitterX}%`,
                        top: `${targetY + subJitterY}%`,
                        opacity: [0, 1, 1, 0.8],
                        rotate: 1080,
                        scale: [0.7, 1, 0.9],
                      }}
                      transition={{
                        duration: durationSec,
                        delay: delaySec,
                        ease: "easeIn",
                      }}
                      style={{
                        position: 'absolute',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                      }}
                    >
                      <svg width="22" height="12" viewBox="0 0 22 12" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <polygon points="0,6 14,2 22,6 14,10" fill="#E2E8F0" stroke="#FFB347" strokeWidth="0.8" />
                        <rect x="0" y="4.5" width="4" height="3" rx="1" fill="#78350F" />
                        <circle cx="2" cy="6" r="1.5" fill="#FFB347" />
                      </svg>
                    </motion.div>
                  );
                })}
              </React.Fragment>
            );
          }

          // 2. AXE: Medium parabolic arc, rotating end-over-end
          if (weaponKey === 'axe') {
            const midX = (startX + targetX) / 2;
            const midY = Math.min(startX, targetY) - 14;

            return (
              <motion.div
                key={id}
                initial={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                  opacity: 0,
                  rotate: 0,
                  scale: 0.85,
                }}
                animate={{
                  left: [`${startX}%`, `${midX}%`, `${targetX}%`],
                  top: [`${startY}%`, `${midY}%`, `${targetY}%`],
                  opacity: [0, 1, 1, 1],
                  rotate: [0, 360, 720],
                  scale: [0.85, 1.15, 1],
                }}
                transition={{
                  duration: durationSec,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                  {/* Axe shaft */}
                  <line x1="6" y1="22" x2="22" y2="6" stroke="#854D0E" strokeWidth="2.8" strokeLinecap="round" />
                  {/* Heavy double axe blade */}
                  <g transform="translate(18, 10)">
                    <path d="M-6 -8 C-12 -12, -14 -4, -8 0 C-4 2, -2 -2, 0 0 Z" fill="#94A3B8" stroke="#FFB347" strokeWidth="0.8" />
                    <path d="M0 0 C4 -2, 6 2, 10 0 C16 -4, 14 -12, 8 -8 Z" fill="#CBD5E1" stroke="#FFD285" strokeWidth="0.8" />
                    <rect x="-3" y="-3" width="6" height="6" rx="1" fill="#334155" />
                  </g>
                </svg>
              </motion.div>
            );
          }

          // 3. CATAPULT: High arc, flaming boulder with smoke trail particles
          if (weaponKey === 'catapult') {
            const midX = (startX + targetX) / 2;
            const peakY = Math.min(startY, targetY) - 30; // Dramatic high arc

            return (
              <motion.div
                key={id}
                initial={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                  opacity: 0,
                  rotate: 0,
                  scale: 0.8,
                }}
                animate={{
                  left: [`${startX}%`, `${midX}%`, `${targetX}%`],
                  top: [`${startY}%`, `${peakY}%`, `${targetY}%`],
                  opacity: [0, 1, 1, 1],
                  rotate: [0, 270, 540],
                  scale: [0.8, 1.3, 1.1],
                }}
                transition={{
                  duration: durationSec,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                {/* Flaming rock SVG */}
                <div className="relative">
                  {/* Trailing smoke / fire trail aura */}
                  <div className="absolute -inset-2 rounded-full bg-orange-600/40 blur-[5px] animate-pulse pointer-events-none" />
                  
                  <svg width="34" height="34" viewBox="0 0 34 34" className="drop-shadow-[0_0_12px_#FF6A00]">
                    {/* Flame corona */}
                    <circle cx="17" cy="17" r="14" fill="url(#boulderFire)" opacity="0.65" />
                    {/* Jagged rocky core */}
                    <polygon
                      points="17,6 23,9 27,15 25,23 19,27 12,25 8,19 11,11"
                      fill="#37180A"
                      stroke="#FF5500"
                      strokeWidth="1.5"
                    />
                    {/* Molten crack veins */}
                    <path d="M12 12 Q17 17 19 23" fill="none" stroke="#FFD700" strokeWidth="1.8" />
                    <path d="M23 12 Q18 16 14 20" fill="none" stroke="#FF4500" strokeWidth="1.4" />
                    <circle cx="17" cy="17" r="3.5" fill="#FFFBEB" />

                    <defs>
                      <radialGradient id="boulderFire" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#FFAA00" stopOpacity="0.8" />
                        <stop offset="80%" stopColor="#FF2200" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#990000" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            );
          }

          // 4. BALLISTA: Fast flat line, oriented along flight path with light streak trail
          if (weaponKey === 'ballista') {
            const angleDeg =
              (Math.atan2(targetY - startY, targetX - startX) * 180) / Math.PI;

            return (
              <motion.div
                key={id}
                initial={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  left: `${targetX}%`,
                  top: `${targetY}%`,
                  opacity: [0, 1, 1],
                  scale: [0.9, 1.1, 1],
                }}
                transition={{
                  duration: durationSec,
                  ease: "easeIn",
                }}
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                  pointerEvents: 'none',
                }}
              >
                <div className="flex items-center">
                  {/* Glowing light streak trail behind the bolt */}
                  <div
                    className="h-[3px] w-14 rounded-l-full bg-gradient-to-l from-[#FFB347] via-[#FF5500] to-transparent filter drop-shadow-[0_0_6px_#FF7A1A]"
                    style={{ transform: 'translateX(4px)' }}
                  />

                  {/* Heavy piercing iron bolt */}
                  <svg width="48" height="16" viewBox="0 0 48 16" className="drop-shadow-[0_0_10px_#FFAA4A]">
                    {/* Shaft */}
                    <line x1="8" y1="8" x2="40" y2="8" stroke="#1E1E1E" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="7.2" x2="40" y2="7.2" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
                    {/* Barbed point */}
                    <polygon points="48,8 36,3 38,8 36,13" fill="#E2E8F0" stroke="#FF7A1A" strokeWidth="1" />
                    {/* Quad red fletchings */}
                    <polygon points="6,8 0,2 10,8" fill="#B91C1C" />
                    <polygon points="6,8 0,14 10,8" fill="#B91C1C" />
                  </svg>
                </div>
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
}

