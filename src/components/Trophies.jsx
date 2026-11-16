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
      <header className="region-head" data-reveal>
        <p className="eyebrow">04 — Trophies</p>
        <h2 className="title-lg">Numbers, <em>not adjectives</em></h2>
      </header>

      <div className="sheet headline" data-reveal>
        {HEADLINE.map((h) => (
          <div key={h.value}><strong>{h.value}</strong><span>{h.label}</span></div>
        ))}
      </div>

      <div className="sheet ledger" data-reveal>
        <p className="eyebrow">Field reports — vulnerability research</p>
        <ul className="rows">
          {research.map((r) => (
            <li key={r.id}>
              <a className="rows-main" href={r.link} target="_blank" rel="noreferrer">{r.target} — {r.title}<small>{r.severity}</small></a>
              <span className="rows-place">{r.status}</span>
              <span className="rows-year">{r.date}</span>
            </li>
          ))}
          <li className="rows-sealed">
            <span className="rows-main">Further reports<small>Google · Microsoft · n8n and others</small></span>
            <span className="rows-place">Sealed</span>
            <span className="rows-year">2026</span>
            <p className="rows-note">Under coordinated disclosure. Details stay sealed until each vendor publishes.</p>
          </li>
        </ul>

        <p className="eyebrow ledger-gap">Competitions</p>
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
