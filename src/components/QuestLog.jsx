import { useCallback } from 'react';
import { projects } from '../data/portfolio';
import { store } from '../world/store';
import Dossier from './Dossier';

const KANJI = { sentinel: '番人', securesplit: '分割', matcare: '母子', 'ale-logs': '記録' };
const files = projects.map((p) => ({ ...p, kanji: KANJI[p.id] }));

// Act II: the projects, as a deck of case files. The file on top is the shrine stone the world turns towards.
export default function QuestLog() {
  const focus = useCallback((item) => { store.focus = item.id; }, []);
  return (
    <div id="quests" data-region>
      <Dossier id="scrolls" eyebrow={`Act II — The scrolls · ${projects.length} case files`} title={<>Selected <em>work</em></>} items={files} onActive={focus}>
        {(p, i) => (
          <>
            <img className="sheet-sketch" src={p.cover} alt="" loading="lazy" />
            <p className="sheet-meta">File {String(i + 1).padStart(2, '0')} · {p.year} · {p.role}</p>
            <h3>{p.title}</h3>
            <p className="sheet-sub">{p.subtitle}</p>
            <p className="sheet-desc">{p.description}</p>
            <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            <a className="link" href={p.link} target="_blank" rel="noreferrer">View on GitHub</a>
          </>
        )}
      </Dossier>
    </div>
  );
}
