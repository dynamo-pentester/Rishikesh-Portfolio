import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative py-12 border-t border-border overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-glow-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.a href="#" className="font-display text-2xl font-bold gradient-text" whileHover={{ scale: 1.05 }}>
            Rishikesh R
          </motion.a>

          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Rishikesh R. Crafted with passion.
          </p>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ y: -3 }}
          >
            Back to top ↑
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
