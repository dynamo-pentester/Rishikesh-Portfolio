import { ctfEvents, certificates, research } from '../data/portfolio';
import Dossier from './Dossier';

const sealed = { id: 'sealed', target: 'Sealed', short: 'Sealed', kanji: '封印', title: 'Further reports with Google, Microsoft, n8n and others', severity: 'Under coordinated disclosure', status: 'Opened when each vendor publishes', date: '2026' };
const reports = [...research.map((r) => ({ ...r, short: r.target })), sealed];
const contests = ctfEvents.map((e) => ({ ...e, short: e.title }));

const HEADLINE = [
  { value: 'Top 3%', label: 'TryHackMe — global ranking' },
  { value: '#44', label: 'Apoorv CTF 2026 — worldwide' },
  { value: 'Medallion', label: 'of Excellence — IndiaSkills Southern Regionals 2026' },
];

export default function Trophies() {
  return (
    <div id="trophies" data-region>
    <section className="region region-short">
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

    </section>

    <Dossier id="reports" eyebrow="Published vulnerability research" title={<>Heads <em>taken</em></>} kanji="討伐" items={reports}>
      {(r) => (
        <>
          <p className="sheet-meta">{r.date} · {r.severity}</p>
          <h3>{r.target}</h3>
          <p className="sheet-sub">{r.title}</p>
          <p className="sheet-desc">{r.status}</p>
          {r.link && <a className="link" href={r.link} target="_blank" rel="noreferrer">Read the advisory</a>}
        </>
      )}
    </Dossier>

    <Dossier id="contests" side="right" eyebrow="Competitions" title={<>Trials <em>by fire</em></>} kanji="武勲" items={contests}>
      {(e) => (
        <>
          <p className="sheet-meta">{e.date} · {e.type}</p>
          <h3>{e.title}</h3>
          <p className="sheet-sub">{e.placement}</p>
          <p className="sheet-desc">{e.description}</p>
        </>
      )}
    </Dossier>

    <section className="region region-short">
      <div className="sheet ledger" data-reveal>
        <p className="eyebrow">Licences &amp; certifications · 免許</p>
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
    </div>
  );
}
