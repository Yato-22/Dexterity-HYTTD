import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Embers() {
  // Generate a fixed set of floating ember particles
  const emberParticles = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage from left
      startY: 100 + Math.random() * 10,
      size: Math.random() * 4 + 2, // 2px to 6px
      duration: Math.random() * 8 + 6, // 6s to 14s
      delay: Math.random() * 7,
      drift: (Math.random() - 0.5) * 80, // horizontal drift px
      color: i % 3 === 0 ? '#FF7A1A' : i % 3 === 1 ? '#FFB347' : '#FF4500',
      opacity: Math.random() * 0.6 + 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {emberParticles.map((ember) => (
        <motion.div
          key={ember.id}
          initial={{
            left: `${ember.x}%`,
            top: `${ember.startY}%`,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            top: ['105%', '-5%'],
            x: [0, ember.drift, -ember.drift / 2, ember.drift * 0.8],
            opacity: [0, ember.opacity, ember.opacity * 0.8, 0],
            scale: [0.5, 1.2, 0.8, 0.4],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            width: ember.size,
            height: ember.size,
            backgroundColor: ember.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${ember.size * 2.5}px ${ember.color}`,
          }}
        />
      ))}
    </div>
  );
}

