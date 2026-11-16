import { ctfEvents, certificates, research } from '../data/portfolio';
import ActTitle from './ActTitle';

const sealed = { id: 'sealed', target: 'Sealed', title: 'Further reports with Google, Microsoft, n8n and others', severity: 'Under coordinated disclosure', status: 'Opened when each vendor publishes', date: '2026' };
const notices = [...research, sealed];

// the TryHackMe ranking already flies as a banner, so it is not hung a second time
const plaques = ctfEvents.filter((e) => !/tryhackme/i.test(e.title));

const HEADLINE = [
  { value: 'Top 3%', label: 'TryHackMe, global ranking' },
  { value: '#44', label: 'Apoorv CTF 2026, worldwide' },
  { value: 'Medallion', label: 'of Excellence, IndiaSkills Southern Regionals 2026' },
];
const initials = (s) => s.split(/[\s-]+/).filter((w) => /^[A-Z0-9]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

// Act IV: three kinds of record, three forms. Rankings fly as war banners, every contest is a wooden votive plaque hung on the shrine rack, published research is pinned
// to a notice board the way edicts were, and every licence is a red seal.
export default function Trophies() {
  return (
    <div id="trophies" data-region>
      <ActTitle eyebrow="Act IV · War record" kanji="功績">Numbers, <em>not adjectives</em></ActTitle>
      <section className="region region-short region-body">

        <div className="banners" data-reveal>
          {HEADLINE.map((h, i) => (
            <div key={h.value} className="nobori" style={{ '--d': `${i * -1.3}s` }}>
              <i className="nobori-mon" aria-hidden="true">{['壱', '弐', '参'][i]}</i>
              <strong>{h.value}</strong>
              <span>{h.label}</span>
            </div>
          ))}
        </div>

        <header className="sub-head ema-head" data-reveal>
          <p className="eyebrow">Trials by fire · 武勲</p>
          <h2 className="title-md">Hung at the <em>shrine</em></h2>
        </header>
        <ul className="ema-rack">
          {plaques.map((e, i) => (
            <li key={e.id} data-reveal style={{ '--d': `${(i % 4) * 80}ms`, '--tilt': `${[-1.4, 0.9, -0.6, 1.5, -1, 0.5][i % 6]}deg`, '--wind': `${-(i * 0.83) % 5}s`, '--pace': `${4.2 + (i % 4) * 0.55}s` }}>
              <article className="ema">
                <p className="ema-meta">{e.type} · {e.date}</p>
                <h3>{e.title}</h3>
                <p className="ema-place">{e.placement}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="region region-short" id="reports">
        <header className="sub-head" data-reveal>
          <p className="eyebrow">Published vulnerability research · 討伐</p>
          <h2 className="title-md">Heads <em>taken</em></h2>
        </header>
        <div className="board" data-reveal>
          {notices.map((r, i) => (
            <article key={r.id} className={`notice${r.link ? '' : ' notice-sealed'}`} style={{ '--tilt': `${[-1.6, 1.1, -0.7, 1.8, -1.2, 0.8][i % 6]}deg`, '--d': `${i * 90}ms`, '--wind': `${-(i * 1.1) % 6}s` }}>
              <p className="sheet-meta">{r.date} · {r.severity}</p>
              <h3>{r.target}</h3>
              <p className="sheet-sub">{r.title}</p>
              <p className="notice-status">{r.status}</p>
              {r.link ? <a className="link" href={r.link} target="_blank" rel="noreferrer">Read the advisory</a> : <i className="hanko" aria-hidden="true">封</i>}
            </article>
          ))}
        </div>
      </section>

      <section className="region region-short" id="licences">
        <header className="sub-head" data-reveal>
          <p className="eyebrow">Licences &amp; certifications · 免許</p>
          <h2 className="title-md">Under <em>seal</em></h2>
        </header>
        <ul className="seals">
          {certificates.map((c, i) => (
            <li key={c.id} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <a href={c.link} target="_blank" rel="noreferrer">
                <span className="stamp" aria-hidden="true">{initials(c.issuer)}</span>
                <strong>{c.title}</strong>
                <small>{c.issuer} · {c.date}</small>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
