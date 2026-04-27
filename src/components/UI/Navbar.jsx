import React, { useEffect, useState } from 'react';
import { navItems } from '../../data/portfolio';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      transition: 'all 0.5s ease',
      background: scrolled ? 'rgba(10,10,10,0.75)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1.25rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span className="mono" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.8)' }}>RR</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.9)' }}>Rishikesh R</span>
            <span className="mono" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>SECURITY ENGINEER</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontSize: '13px',
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'white'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>0{idx + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="/Rishikesh-R.pdf"
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              padding: '0.6rem 1.25rem',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              transition: 'all 0.4s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#0a0a0a';
              e.currentTarget.style.borderColor = 'white';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            RÉSUMÉ
          </a>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="mobile-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.8)',
              padding: '4px',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '1.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>0{idx + 1}</span>
              {item.label}
            </a>
          ))}
          <a
            href="/Rishikesh-R.pdf"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mono"
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              marginTop: '0.75rem',
              padding: '0.75rem 1.25rem',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
            }}
          >
            RÉSUMÉ
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;