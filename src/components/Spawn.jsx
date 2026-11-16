import { useEffect, useRef } from 'react';
import { profile } from '../data/portfolio';
import { sound } from '../world/audio';
import { store } from '../world/store';

function Scene({ live }) {
  return (
    <div className="hero-scene">
      <div className="hero-copy">
        <p className="eyebrow">{profile.location} · field atlas</p>
        <h1 className="title-xl"><em>Rishikesh</em> R</h1>
        <p className="lede">
          {profile.role}. I work where offense meets architecture: kernel internals, offensive testing
          and the detection systems that catch what gets through.
        </p>
        <div className="cta-row">
          <a className="btn btn-solid" href="#character" tabIndex={live ? 0 : -1}>Enter the gate</a>
          <a className="btn" href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer" tabIndex={live ? 0 : -1}>Résumé</a>
        </div>
        <p className="hint"><span>Scroll. The blade does the rest</span></p>
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
    const setCut = (on) => {
      if (on === cut) return;
      cut = on; pin.current.classList.toggle('is-cut', on);
      if (on) sound.cut();
      update();
    };
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1);
      store.hero.p = p;
      // the world calls the cut when the blade lands; without it (no WebGL, model still loading) the scroll does
      if (!cut && p > 0.62) setCut(true);
      if (cut && p < 0.3) setCut(false);
      const q = cut ? Math.min(Math.max((p - 0.46) / 0.54, 0), 1) : 0;
      pin.current.style.setProperty('--q', q.toFixed(4));
      store.hero.q = q;
    };
    const onScroll = () => { raf ||= requestAnimationFrame(update); };
    store.hero.onCut = setCut;
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { store.hero.onCut = null; window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
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
