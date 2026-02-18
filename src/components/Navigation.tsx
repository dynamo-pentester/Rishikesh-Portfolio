import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, Server } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const navItems = [
  { label: 'About',        href: '#about' },
  { label: 'Skills',       href: '#skills' },
  { label: 'Projects',     href: '#projects' },
  { label: 'Experience',   href: '#experience' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'CTF',          href: '#ctf' },
  { label: 'Contact',      href: '#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { mode, toggleMode } = useProfile();
  const isBackend = mode === 'backend';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileOpen(false);
  };

  /* Navbar background: always slightly opaque for readability */
  const navBg = isScrolled
    ? isBackend
      ? 'rgba(255,246,251,0.82)'
      : 'rgba(5,5,5,0.82)'
    : isBackend
      ? 'rgba(255,246,251,0.5)'
      : 'rgba(5,5,5,0.5)';

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-500"
        style={{
          background: navBg,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid hsl(var(--border) / 0.4)' : 'none',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="section-container h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/0x.svg"
              alt="OxDyn4mo Logo"
              className="h-11 w-auto object-contain"
            />
          </motion.a>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors animated-underline"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Mode toggle + hamburger */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono transition-all duration-300"
              style={{
                background: 'hsl(var(--primary) / 0.08)',
                borderColor: 'hsl(var(--primary) / 0.35)',
                color: 'hsl(var(--primary))',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-cursor-hover
            >
              {isBackend ? (
                <>
                  <Server className="w-4 h-4" />
                  <span className="hidden sm:inline">Backend</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Red Team</span>
                </>
              )}
            </motion.button>

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden flex flex-col"
            style={{
              background: isBackend ? 'rgba(255,246,251,0.97)' : 'rgba(5,5,5,0.97)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close button */}
            <div className="flex justify-end p-5">
              <button onClick={() => setIsMobileOpen(false)} className="text-foreground">
                <X className="w-7 h-7" />
              </button>
            </div>

            <nav className="flex flex-col items-center justify-center flex-1 gap-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-2xl font-display font-medium text-foreground hover:text-primary transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.07 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
