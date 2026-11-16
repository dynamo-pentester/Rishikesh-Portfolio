import { useEffect, useRef } from 'react';

const NUM = ['壱', '弐', '参', '四', '五', '六', '七', '八', '九', '十'];
const pad = (n) => String(n).padStart(2, '0');

// A deck of case files pinned to one side of the screen. Scrolling files the top sheet away
// behind the stack and brings the next one up, so the world stays in view the whole time.
export default function Dossier({ id, eyebrow, title, kanji, items, onActive, children, side = 'left' }) {
  const section = useRef(null), deck = useRef(null), count = useRef(null), index = useRef(null);

  useEffect(() => {
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      const f = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1) * (items.length - 1);
      deck.current.style.setProperty('--f', f.toFixed(4));
      const active = Math.round(f);
      if (active !== last) {
        last = active;
        if (count.current) count.current.textContent = pad(active + 1);
        index.current?.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === active));
        const inView = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
        if (inView) onActive?.(items[active], active);
      }
    };
    const onScroll = () => { raf ||= requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [items, onActive]);

  const jump = (i) => {
    const r = section.current.getBoundingClientRect();
    window.scrollTo({ top: r.top + scrollY + ((r.height - innerHeight) * i) / Math.max(items.length - 1, 1) + 2, behavior: 'smooth' });
  };

  return (
    <section id={id} className={`dossier dossier-${side}`} ref={section} style={{ '--n': items.length }}>
      <div className="dossier-pin">
        <header className="dossier-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="title-md">{title}</h2>
        </header>

        <div className="deck" ref={deck}>
          {items.map((item, i) => (
            <article key={item.id} className="sheet-file" style={{ '--i': i }}>
              <div className="sheet-spine" aria-hidden="true"><span>{item.kanji || kanji}</span><i className="hanko">{NUM[i] || '封'}</i></div>
              <div className="sheet-body">{children(item, i)}</div>
            </article>
          ))}
        </div>

        <nav className="dossier-index" ref={index} aria-label={`${title} — files`}>
          <p className="mono"><span ref={count}>01</span> / {pad(items.length)}</p>
          {items.map((item, i) => (
            <button key={item.id} type="button" onClick={() => jump(i)}>{item.short || item.title || item.target}</button>
          ))}
        </nav>
      </div>
    </section>
  );
}
