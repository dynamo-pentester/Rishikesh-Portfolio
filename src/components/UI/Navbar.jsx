import { useEffect, useState } from 'react';
import { navItems, profile } from '../../data/portfolio';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll and allow Escape while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      <header className={`nav glass${scrolled ? ' is-scrolled' : ''}`}>
        <a href="#hero" className="nav-logo" onClick={() => setOpen(false)}>
          <span className="nav-logo-box mono">RR</span>
          <span className="nav-logo-text">
            <span>Rishikesh R</span>
            <span className="mono">SECURITY ENGINEER</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item, idx) => (
            <a key={item.href} href={item.href}>
              <span className="mono">0{idx + 1}</span>{item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer" className="nav-resume mono">RÉSUMÉ</a>
          <button
            type="button"
            className={`nav-burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <div className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <nav className="menu-links" aria-label="Menu">
          {navItems.map((item, idx) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} style={{ '--d': `${idx * 60}ms` }}>
              <span className="mono">0{idx + 1}</span>
              <span className="menu-word">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>{profile.email}</a>
          <div className="menu-social">
            {profile.social.slice(0, 3).map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="mono" tabIndex={open ? 0 : -1}>({s.label})</a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
