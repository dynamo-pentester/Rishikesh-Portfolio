import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  swayX: number;
  rotation: number;
  opacity: number;
  scale: number;
  filter?: string;
}

interface FallingParticlesProps {
  imageSrc: string;
  count?: number;
  mode?: 'backend' | 'security';
}

export default function FallingParticles({
  imageSrc,
  count = 20,
  mode = 'backend',
}: FallingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 18 + 14,                    // 14–32px
      duration: mode === 'security'
        ? Math.random() * 10 + 12                        // 12–22s slower
        : Math.random() * 10 + 8,                        // 8–18s
      delay: Math.random() * 15,
      swayX: (Math.random() - 0.5) * 100,               // –50 to +50px
      rotation: Math.random() * 360,
      opacity: mode === 'security' ? 0.82 : 0.72,
      scale: Math.random() * 0.6 + 0.6,                 // 0.6–1.2
      filter: mode === 'security'
        ? 'drop-shadow(0 0 4px rgba(255,0,0,0.5))'
        : undefined,
    }));
  }, [count, mode]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 10 }}
    >
      {particles.map((p) => (
        <motion.img
          key={p.id}
          src={imageSrc}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: -50,
            width: p.size * p.scale,
            height: p.size * p.scale,
            opacity: p.opacity,
            filter: p.filter,
          }}
          animate={{
            y: ['0px', '110vh'],
            x: [0, p.swayX, -p.swayX * 0.6, p.swayX * 0.3, 0],
            rotate: [p.rotation, p.rotation + 360],
          }}
          transition={{
            y: {
              duration: p.duration * 2,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            },
            x: {
              duration: p.duration * 0.9,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            },
            rotate: {
              duration: p.duration * 1.4,
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
