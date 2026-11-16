import { services } from '../data/portfolio';

export default function Disciplines() {
  return (
    <section id="disciplines" data-region className="region">
      <span className="kanji" aria-hidden="true">技</span>
      <header className="region-head" data-reveal data-slash>
        <p className="eyebrow">Act III — The arsenal</p>
        <h2 className="title-lg">Four ways <em>in</em></h2>
      </header>

      <ol className="disciplines">
        {services.map((s, i) => (
          <li key={s.id} className="sheet" data-reveal style={{ '--d': `${i * 80}ms` }}>
            <span className="quest-num">{s.id}</span>
            <h3>{s.title}</h3>
            <p className="body">{s.desc}</p>
            <ul className="tags">{s.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
