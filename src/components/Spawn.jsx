import { useEffect, useRef } from 'react';
import { profile } from '../data/portfolio';
import { sound } from '../world/audio';
import { store } from '../world/store';

function Scene({ live }) {
  return (
    <div className="hero-scene">
      <div className="hero-copy">
        <p className="eyebrow">{profile.location} — field atlas</p>
        <h1 className="title-xl"><em>Rishikesh</em> R</h1>
        <p className="lede">
          {profile.role}. I work where offense meets architecture — kernel internals, offensive testing
          and the detection systems that catch what gets through.
        </p>
        <div className="cta-row">
          <a className="btn btn-solid" href="#quests" tabIndex={live ? 0 : -1}>Open the scrolls</a>
          <a className="btn" href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer" tabIndex={live ? 0 : -1}>Résumé</a>
        </div>
        <p className="hint"><span>Scroll — the blade does the rest</span><span className="hint-key">Turn sound on for the cut</span></p>
      </div>
    </div>
  );
}

// The opening shot. The scene is rendered twice, one copy per side of the cut;
// scrolling triggers the strike, then the two halves slide apart along the blade's path.
export default function Spawn() {
  const section = useRef(null), pin = useRef(null);

  useEffect(() => {
    let cut = false, raf = 0;
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1);
      const q = Math.min(Math.max((p - 0.14) / 0.86, 0), 1);
      pin.current.style.setProperty('--q', q.toFixed(4));
      store.hero.q = q;
      if (!cut && p > 0.14) { cut = true; store.hero.cut = true; pin.current.classList.add('is-cut'); sound.slash(1); }
      else if (cut && p < 0.05) { cut = false; store.hero.cut = false; pin.current.classList.remove('is-cut'); }
    };
    const onScroll = () => { raf ||= requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="spawn" data-region className="hero" ref={section}>
      <div className="hero-pin" ref={pin}>
        <span className="kanji" aria-hidden="true">血月</span>
        <div className="cut cut-a"><Scene live /></div>
        <div className="cut cut-b" aria-hidden="true"><Scene /></div>
        <span className="zan" aria-hidden="true">斬</span>
        <svg className="slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="-4" y1="48.7" x2="104" y2="83.3" pathLength="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </section>
  );
}
