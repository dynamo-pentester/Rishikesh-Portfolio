import { ctfEvents, certificates } from '../data/portfolio';

const HEADLINE = [
  { value: 'Top 5%', label: 'TryHackMe — global ranking' },
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

      <div className="headline" data-reveal>
        {HEADLINE.map((h) => (
          <div key={h.value}><strong>{h.value}</strong><span>{h.label}</span></div>
        ))}
      </div>

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
