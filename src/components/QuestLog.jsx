import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio';
import { store } from '../world/store';

const pad = (n) => String(n).padStart(2, '0');

// The project list: big names, hover turns the world towards that waypoint, click opens the entry.
export default function QuestLog() {
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);
  const preview = useRef(null);

  useEffect(() => { store.focus = hovered || open; }, [hovered, open]);

  useEffect(() => {
    const el = preview.current;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; el.style.transform = `translate3d(${x}px, ${y}px, 0)`; raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('pointermove', move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); };
  }, []);

  return (
    <section id="quests" data-region className="region">
      <span className="kanji" aria-hidden="true">作品</span>
      <header className="region-head" data-reveal>
        <p className="eyebrow">01 — Quest log · {projects.length} entries</p>
        <h2 className="title-lg">Selected <em>work</em></h2>
      </header>

      <ol className="quests" onPointerLeave={() => setHovered(null)}>
        {projects.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className={`quest${isOpen ? ' is-open' : ''}`} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <button
                type="button" className="quest-head" aria-expanded={isOpen} aria-controls={`quest-${p.id}`}
                onClick={() => setOpen(isOpen ? null : p.id)}
                onPointerEnter={() => setHovered(p.id)} onFocus={() => setHovered(p.id)} onBlur={() => setHovered(null)}
              >
                <span className="quest-num">{pad(i + 1)}</span>
                <span className="quest-title">{p.title}</span>
                <span className="quest-meta">{p.disciplines.join(' / ')}</span>
                <span className="quest-year">{p.year}</span>
                <span className="quest-plus" aria-hidden="true" />
              </button>
              <div className="quest-body" id={`quest-${p.id}`}>
                <div className="quest-inner">
                  <div className="sheet quest-sheet">
                    <img className="sketch" src={p.cover} alt="" loading="lazy" />
                    <div>
                      <p className="quest-sub">{p.subtitle}</p>
                      <p className="quest-role">{p.role}</p>
                      <p className="body">{p.description}</p>
                      <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                      <a className="link" href={p.link} target="_blank" rel="noreferrer" tabIndex={isOpen ? 0 : -1}>View on GitHub</a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={`quest-preview sheet${hovered && hovered !== open ? ' is-on' : ''}`} ref={preview} aria-hidden="true">
        {projects.map((p) => <img key={p.id} className={`sketch${hovered === p.id ? ' is-on' : ''}`} src={p.cover} alt="" />)}
      </div>
    </section>
  );
}
