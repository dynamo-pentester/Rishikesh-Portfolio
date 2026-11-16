import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio';
import { ArrowUpRight, Plus } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const pad = (n) => String(n).padStart(2, '0');

/* ── Deck view: full-bleed cards that stack as you scroll ───────────── */
function Deck() {
  const ref = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.deck-card', ref.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        // As the next card slides over, this one recedes into the stack.
        const st = { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true };
        gsap.to(card.querySelector('.deck-card-inner'), {
          scale: 1 - Math.min(cards.length - 1 - i, 3) * 0.035, ease: 'none', scrollTrigger: st,
        });
        gsap.to(card.querySelector('.deck-dim'), { opacity: 0.6, ease: 'none', scrollTrigger: { ...st } });
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <div className="deck" ref={ref}>
      {projects.map((p, i) => (
        <article key={p.id} className="deck-card" style={{ '--i': i, '--accent': p.accent }}>
          <div className="deck-card-inner">
            <img className="deck-cover" src={p.cover} alt="" loading={i ? 'lazy' : 'eager'} />
            <div className="deck-shade" />
            <div className="deck-dim" />

            <div className="deck-top">
              <span>({pad(i + 1)} / {pad(projects.length)})</span>
              <span>{p.year} — {p.role}</span>
            </div>

            <div className="deck-bottom">
              <h3 className="deck-title">{p.title}</h3>
              <div className="deck-panel glass">
                <p className="deck-subtitle">{p.subtitle}</p>
                <p className="deck-desc">{p.description}</p>
                <div className="deck-tags">
                  {p.tags.slice(0, 5).map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
                <a href={p.link} target="_blank" rel="noreferrer" className="deck-link">
                  view project <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── Index view: typographic list, hover preview on desktop, tap to expand ── */
function Index() {
  const previewRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e) => { x(e.clientX); y(e.clientY); };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <div className="index">
      <ol className="index-list" onPointerLeave={() => setHovered(null)}>
        {projects.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className={`index-row${isOpen ? ' is-open' : ''}`} style={{ '--accent': p.accent }}>
              <button
                type="button"
                className="index-head"
                aria-expanded={isOpen}
                aria-controls={`index-body-${p.id}`}
                onClick={() => setOpen(isOpen ? null : p.id)}
                onPointerEnter={() => setHovered(p.id)}
              >
                <span className="index-num">{pad(i + 1)}</span>
                <span className="index-title"><span className="index-line" style={{ animationDelay: `${i * 70}ms` }}>{p.title}</span></span>
                <span className="index-disc">{p.disciplines.join(' / ')}</span>
                <span className="index-year">{p.year}</span>
                <Plus size={18} className="index-plus" aria-hidden="true" />
              </button>
              <div className="index-body" id={`index-body-${p.id}`}>
                <div className="index-body-inner">
                  <img className="index-thumb" src={p.cover} alt="" loading="lazy" />
                  <div>
                    <p className="deck-subtitle">{p.subtitle}</p>
                    <p className="index-desc">{p.description}</p>
                    <div className="deck-tags">
                      {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                    </div>
                    <a href={p.link} target="_blank" rel="noreferrer" className="deck-link" tabIndex={isOpen ? 0 : -1}>
                      view project <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Cursor-following preview (desktop pointers only, hidden via CSS elsewhere) */}
      <div className={`index-preview${hovered && hovered !== open ? ' is-visible' : ''}`} ref={previewRef} aria-hidden="true">
        {projects.map((p) => (
          <img key={p.id} src={p.cover} alt="" className={hovered === p.id ? 'is-active' : ''} />
        ))}
      </div>
    </div>
  );
}

const Work = () => {
  const [view, setView] = useState('deck');

  // Layout height changes when the view switches — let ScrollTrigger re-measure.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [view]);

  return (
    <section id="work">
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">01 — SELECTED WORK</span>
          <div className="hairline" style={{ flex: 1 }} />
          <span className="section-label-text">2024 — 2025</span>
        </div>

        <div className="work-head">
          <h2 className="display-heading">
            <span className="script display-script">selected</span>
            The Work
          </h2>

          <div className="work-head-side">
            <p className="work-lede">
              A small set of projects where the <span className="serif-i">stakes were real</span> and
              the work <span className="serif-i">mattered.</span>
            </p>
            <div className="view-toggle glass" role="group" aria-label="Project view">
              {[['deck', '(deck view)'], ['index', '(list view)']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={view === key ? 'is-active' : ''}
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'deck' ? <Deck /> : <Index />}
      </div>
    </section>
  );
};

export default Work;
