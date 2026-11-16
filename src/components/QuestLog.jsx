import { useEffect, useRef } from 'react';
import { projects } from '../data/portfolio';
import { store } from '../world/store';

const NUM = ['壱', '弐', '参', '四', '五', '六'];
const KANJI = { sentinel: '番人', securesplit: '分割', matcare: '母子', 'ale-logs': '記録' };

// Projects as a stack of old case files: each sheet slides over the last as you scroll,
// while the tabs of the files beneath stay readable along the top.
export default function QuestLog() {
  const stack = useRef(null);

  // Whichever file is in view becomes the waypoint the world looks at.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) store.focus = e.target.dataset.id; }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stack.current.querySelectorAll('.file').forEach((el) => io.observe(el));
    return () => { io.disconnect(); store.focus = null; };
  }, []);

  return (
    <section id="quests" data-region className="region">
      <span className="kanji" aria-hidden="true">巻物</span>
      <header className="region-head" data-reveal data-slash>
        <p className="eyebrow">Act I — The scrolls · {projects.length} case files</p>
        <h2 className="title-lg">Selected <em>work</em></h2>
      </header>

      <div className="files" ref={stack} style={{ '--n': projects.length }}>
        {projects.map((p, i) => (
          <article key={p.id} id={`file-${p.id}`} className="file" data-id={p.id} style={{ '--i': i }}>
            <a className="file-tab" href={`#file-${p.id}`}><span aria-hidden="true">{NUM[i]}</span>{p.title}</a>
            <div className="file-sheet">
              <div className="file-spine" aria-hidden="true">
                <span>{KANJI[p.id]}</span><i className="hanko">封</i>
              </div>
              <img className="file-sketch" src={p.cover} alt="" loading="lazy" />
              <div className="file-body">
                <p className="file-meta">File {String(i + 1).padStart(2, '0')} · {p.year} · {p.role}</p>
                <h3>{p.title}</h3>
                <p className="file-sub">{p.subtitle}</p>
                <p className="file-desc">{p.description}</p>
                <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <a className="link" href={p.link} target="_blank" rel="noreferrer">View on GitHub</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
