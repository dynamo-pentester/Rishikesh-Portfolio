import { motion } from 'framer-motion';
import { useProfile } from '@/contexts/ProfileContext';
import sakuraBranch from '@/assets/sakura-branch.png';

/**
 * Decorative elements for sections — sakura branches in backend mode,
 * red geometric accents in security mode.
 */

export function BranchLeft({ className = '' }: { className?: string }) {
  const { mode } = useProfile();
  const isBackend = mode === 'backend';

  return (
    <motion.div
      className={`absolute pointer-events-none z-[1] ${className}`}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: isBackend ? 0.35 : 0, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    >
      {isBackend && (
        <img
          src={sakuraBranch}
          alt=""
          className="w-[180px] md:w-[260px] h-auto -scale-x-100"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}
    </motion.div>
  );
}

export function BranchRight({ className = '' }: { className?: string }) {
  const { mode } = useProfile();
  const isBackend = mode === 'backend';

  return (
    <motion.div
      className={`absolute pointer-events-none z-[1] ${className}`}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: isBackend ? 0.35 : 0, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    >
      {isBackend && (
        <img
          src={sakuraBranch}
          alt=""
          className="w-[180px] md:w-[260px] h-auto"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}
    </motion.div>
  );
}

export function RedGlowOrb({ className = '' }: { className?: string }) {
  const { mode } = useProfile();
  if (mode !== 'security') return null;

  return (
    <motion.div
      className={`absolute pointer-events-none z-[1] ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2 }}
    >
      <div
        className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 50%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}

export function SectionDivider() {
  const { mode } = useProfile();

  return (
    <div className="relative h-px w-full max-w-4xl mx-auto my-0">
      <div
        className="absolute inset-0"
        style={{
          background: mode === 'backend'
            ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)'
            : 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)',
        }}
      />
    </div>
  );
}
