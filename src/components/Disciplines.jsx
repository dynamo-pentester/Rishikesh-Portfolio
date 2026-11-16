import { useState } from 'react';
import { services } from '../data/portfolio';
import ActTitle from './ActTitle';

const NUM = ['壱', '弐', '参', '四'];

// Act III: the four disciplines are the leaves of a folding fan. It opens as it comes into view;
// each leaf carries only a name, and choosing one lays its detail out underneath.
export default function Disciplines() {
  const [active, setActive] = useState(0);
  const s = services[active];
  return (
    <div id="disciplines" data-region>
      <ActTitle eyebrow="Act III — The arsenal" kanji="技">Four ways <em>in</em></ActTitle>
      <section className="region region-body arsenal">
        <div className="fan" data-reveal role="tablist" aria-label="Disciplines" style={{ '--n': services.length }}>
          {services.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={i === active} className={`fan-leaf${i === active ? ' is-active' : ''}`}
              style={{ '--a': `${(i - (services.length - 1) / 2) * 34}deg`, '--d': `${i * 90}ms` }} onClick={() => setActive(i)}>
              <span className="fan-num" aria-hidden="true">{NUM[i]}</span>
              <span className="fan-name">{x.title}</span>
            </button>
          ))}
          <i className="fan-pin" aria-hidden="true" />
        </div>

        <div className="sheet fan-detail" data-reveal role="tabpanel" key={s.id}>
          <span className="quest-num">{s.id} / {String(services.length).padStart(2, '0')}</span>
          <h3>{s.title}</h3>
          <p className="body">{s.desc}</p>
          <ul className="tags">{s.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
        </div>
      </section>
    </div>
  );
}
