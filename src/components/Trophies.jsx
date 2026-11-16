import { ctfEvents, certificates, research } from '../data/portfolio';

const HEADLINE = [
  { value: 'Top 3%', label: 'TryHackMe — global ranking' },
  { value: '#44', label: 'Apoorv CTF 2026 — worldwide' },
  { value: 'Medallion', label: 'of Excellence — IndiaSkills Southern Regionals 2026' },
];

export default function Trophies() {
  return (
    <section id="trophies" data-region className="region">
      <span className="kanji" aria-hidden="true">功績</span>
      <header className="region-head" data-reveal data-slash>
        <p className="eyebrow">Act IV — War record</p>
        <h2 className="title-lg">Numbers, <em>not adjectives</em></h2>
      </header>

      <div className="sheet headline" data-reveal>
        {HEADLINE.map((h) => (
          <div key={h.value}><strong>{h.value}</strong><span>{h.label}</span></div>
        ))}
      </div>

      <p className="eyebrow ofuda-label" data-reveal>War record — published vulnerability research</p>
      <ul className="ofuda" data-reveal>
        {research.map((r) => (
          <li key={r.id}>
            <a href={r.link} target="_blank" rel="noreferrer">
              <i className="hanko" aria-hidden="true">討</i>
              <strong>{r.target}</strong>
              <span className="ofuda-title">{r.title}</span>
              <span className="ofuda-meta">{r.severity}</span>
              <span className="ofuda-meta">{r.status}</span>
              <span className="ofuda-date">{r.date}</span>
            </a>
          </li>
        ))}
        <li className="is-sealed">
          <div>
            <i className="hanko" aria-hidden="true">封</i>
            <strong>Sealed</strong>
            <span className="ofuda-title">Further reports with Google, Microsoft, n8n and others</span>
            <span className="ofuda-meta">Under coordinated disclosure. Opened when each vendor publishes.</span>
            <span className="ofuda-date">2026</span>
          </div>
        </li>
      </ul>

      <div className="sheet ledger" data-reveal>
        <p className="eyebrow">Competitions</p>
        <ul className="rows">
          {ctfEvents.map((e) => (
            <li key={e.id}>
              <span className="rows-main">{e.title}<small>{e.type}</small></span>
              <span className="rows-place">{e.placement}</span>
              <span className="rows-year">{e.date}</span>
            </li>
          ))}
        </ul>

        <p className="eyebrow ledger-gap">Licences &amp; certifications</p>
        <ul className="rows rows-two">
          {certificates.map((c) => (
            <li key={c.id}>
              <a className="rows-main" href={c.link} target="_blank" rel="noreferrer">{c.title}<small>{c.issuer}</small></a>
              <span className="rows-year">{c.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
