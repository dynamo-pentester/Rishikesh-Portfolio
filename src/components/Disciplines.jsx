import { services } from '../data/portfolio';
import ActTitle from './ActTitle';

export default function Disciplines() {
  return (
    <div id="disciplines" data-region>
    <ActTitle eyebrow="Act III — The arsenal" kanji="技">Four ways <em>in</em></ActTitle>
    <section className="region region-body">

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
    </div>
  );
}
