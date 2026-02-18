import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  swayAmount: number;
  rotation: number;
  opacity: number;
}

interface FallingParticlesProps {
  imageSrc: string;
  count?: number;
  blendMode?: 'multiply' | 'screen' | 'normal';
}

export default function FallingParticles({ imageSrc, count = 20, blendMode = 'normal' }: FallingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 14,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 10,
      swayAmount: Math.random() * 60 + 20,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <motion.img
          key={p.id}
          src={imageSrc}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: -40,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            mixBlendMode: blendMode,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, p.swayAmount, -p.swayAmount / 2, p.swayAmount / 3, 0],
            rotate: [p.rotation, p.rotation + 360],
          }}
          transition={{
            y: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            },
            x: {
              duration: p.duration * 0.8,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            },
            rotate: {
              duration: p.duration * 1.5,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            },
          }}
        />
      ))}
    </div>
  );
}
