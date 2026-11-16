import { useState } from 'react';
import { services } from '../data/portfolio';
import ActTitle from './ActTitle';

const NUM = ['壱', '弐', '参', '四'];

// Act III: the four disciplines are the leaves of a folding fan. It lies closed until it is clicked,
// then spreads; each leaf carries only a name, and choosing one lays its detail out underneath.
export default function Disciplines() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const s = active === null ? null : services[active];
  return (
    <div id="disciplines" data-region>
      <ActTitle eyebrow="Act III — The arsenal" kanji="技">Four ways <em>in</em></ActTitle>
      <section className="region region-body arsenal">
        <div className={`fan${open ? ' is-open' : ''}${s ? ' has-active' : ''}`} data-reveal role="tablist" aria-label="Disciplines">
          {services.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={i === active} className={`fan-leaf${i === active ? ' is-active' : ''}`}
              style={{ '--a': `${(i - (services.length - 1) / 2) * 34}deg`, '--d': `${i * 90}ms` }} onClick={() => (open ? setActive(i) : setOpen(true))} aria-label={open ? x.title : 'Open the fan'}>
              <span className="fan-num" aria-hidden="true">{NUM[i]}</span>
              <span className="fan-name">{x.title}</span>
            </button>
          ))}
          <i className="fan-pin" aria-hidden="true" />
        </div>

        {s ? (
          <div className="sheet fan-detail" role="tabpanel" key={s.id}>
            <span className="quest-num">{s.id} / {String(services.length).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p className="body">{s.desc}</p>
            <ul className="tags">{s.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
        ) : (
          <p className="fan-cue">{open ? 'Choose a leaf' : 'Open the fan'}</p>
        )}
      </section>
    </div>
  );
}
