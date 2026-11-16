import { useEffect, useRef, useState } from 'react';
import { navItems, profile, projects } from '../data/portfolio';
import { store, REGIONS } from '../world/store';

const pad = (n) => String(n).padStart(2, '0');
const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const DEG = 3; // px per degree on the compass strip
const LABELS = { spawn: 'Spawn', campfire: 'Campfire', ...Object.fromEntries(projects.map((p) => [p.id, p.title])) };
const TRAVEL = [
  { href: '#spawn', label: 'Spawn point' },
  { href: '#quests', label: 'Quest log' },
  { href: '#character', label: 'Character' },
  { href: '#disciplines', label: 'Disciplines' },
  { href: '#trophies', label: 'Trophies' },
  { href: '#campfire', label: 'Campfire' },
];

export default function Hud() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'day');
  const strip = useRef(null), coords = useRef(null), region = useRef(null), labels = useRef(null), bar = useRef(null);

  // One rAF loop writes the live readouts straight to the DOM.
  useEffect(() => {
    let raf, last = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!store.ready) return;
      if (strip.current) strip.current.style.transform = `translateX(${-(store.heading + 360) * DEG}px)`;
      if (coords.current) coords.current.textContent = `X ${store.coords.x.toFixed(1)}  Y ${store.coords.y.toFixed(1)}  ALT ${store.coords.alt.toFixed(0)}m`;
      if (store.region !== last && region.current) { last = store.region; region.current.textContent = `${pad(last)} / ${REGIONS[last]}`; }
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      if (labels.current) {
        for (const l of store.labels) {
          const el = labels.current.querySelector(`[data-id="${l.id}"]`);
          if (!el) continue;
          el.style.opacity = l.visible ? '' : '0';
          el.style.transform = `translate3d(${l.x}px, ${l.y}px, 0) translate(-50%, -100%)`;
          el.classList.toggle('is-focus', store.focus === l.id);
        }
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  // M opens the map, Escape closes it; the page does not scroll underneath.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      else if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) setOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const toggleTheme = () => {
    const next = theme === 'day' ? 'night' : 'day';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('atlas-theme', next); } catch { /* private mode */ }
    setTheme(next);
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <>
      <div className="hud-labels" ref={labels} aria-hidden="true">
        {Object.entries(LABELS).map(([id, text]) => <span key={id} data-id={id}>{text}</span>)}
      </div>

      <header className="hud hud-top">
        <a href="#spawn" className="hud-brand">
          <span className="seal">RR</span>
          <span className="hud-brand-name">Rishikesh R<small>Security engineer</small></span>
        </a>

        <div className="compass" aria-hidden="true">
          <div className="compass-strip" ref={strip}>
            {[0, 1, 2].flatMap((k) => POINTS.map((p, i) => (
              <span key={`${k}${p}`} style={{ left: (k * 360 + i * 45) * DEG }} className={p.length === 1 ? 'is-card' : ''}>{p}</span>
            )))}
          </div>
          <i className="compass-needle" />
        </div>

        <nav className="hud-actions" aria-label="Primary">
          <a className="hud-btn hud-wide" href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer">Résumé</a>
          <button type="button" className="hud-btn hud-icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'}`}>
            <span className={`orb-icon ${theme}`} />
          </button>
          <button type="button" className="hud-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="map">
            {open ? 'Close' : 'Map'}<kbd>M</kbd>
          </button>
        </nav>
      </header>

      <footer className="hud hud-bottom" aria-hidden="true">
        <span ref={coords} className="hud-coords">X 0.0  Y 0.0  ALT 0m</span>
        <span ref={region}>00 / Spawn point</span>
        <i className="hud-progress" ref={bar} />
      </footer>

      <div id="map" className={`map${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <p className="eyebrow">Fast travel</p>
        <nav className="map-list" aria-label="Fast travel">
          {TRAVEL.map((t, i) => (
            <a key={t.href} href={t.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} style={{ '--d': `${i * 50}ms` }}>
              <span className="mono">{pad(i)}</span><span className="map-word">{t.label}</span>
            </a>
          ))}
        </nav>
        <div className="map-foot">
          <a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>{profile.email}</a>
          <span>
            {profile.social.slice(0, 3).map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>{s.label}</a>
            ))}
            {navItems.length > 0 && <a href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Résumé</a>}
          </span>
        </div>
      </div>
    </>
  );
}
