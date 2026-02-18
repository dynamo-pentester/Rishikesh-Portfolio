import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  swayX: number;
  rotation: number;
  opacity: number;
  blur: number;
  z: number;
}

interface FallingParticlesProps {
  imageSrc: string;
  count?: number;
  mode?: 'backend' | 'security';
}

export default function FallingParticles({
  imageSrc,
  count = 12, // 🔥 reduced density
  mode = 'backend',
}: FallingParticlesProps) {

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {

      const depth = Math.random(); // 0 → 1

      return {
        id: i,
        x: Math.random() * 100,
        startY: Math.random() * -120, // start at random heights

        size: 18 + depth * 28, // smaller depth = smaller petal
        duration: 14 + depth * 20, // deep petals fall slower
        delay: Math.random() * 20, // more randomness

        swayX: (Math.random() - 0.5) * 120,
        rotation: Math.random() * 360,

        opacity: 0.4 + depth * 0.5, // layered opacity
        blur: (1 - depth) * 2, // background blur
        z: Math.floor(depth * 10),
      };
    });
  }, [count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 5 }}
    >
      {particles.map((p) => (
        <motion.img
          key={p.id}
          src={imageSrc}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: p.startY,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            zIndex: p.z,
          }}
          animate={{
            y: ['0vh', '120vh'],
            x: [0, p.swayX, -p.swayX * 0.5, 0],
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
              duration: p.duration * 0.6,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            },
            rotate: {
              duration: p.duration * 0.8,
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
