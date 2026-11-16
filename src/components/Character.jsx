import { profile, skillTree, campaigns } from '../data/portfolio';
import ActTitle from './ActTitle';

// Act I: who he is, what he carries, and where he has served — the service record is a hand scroll that unrolls sideways.
export default function Character() {
  return (
    <div id="character" data-region>
      <ActTitle eyebrow="Act I — The warrior" kanji="人物">Part adversary, <em>part architect</em></ActTitle>
      <section className="region region-body">

        <div className="character">
          <aside className="sheet card" data-reveal>
            <dl className="facts">
              <div><dt>Class</dt><dd>{profile.role}</dd></div>
              <div><dt>Origin</dt><dd>{profile.location}</dd></div>
              <div><dt>Guild</dt><dd>Ramco Institute of Technology — B.E. CSE, 2023–2027</dd></div>
              <div><dt>Current post</dt><dd>Cynox Security LLP — Trainee Cyber Security Analyst</dd></div>
              <div><dt>Status</dt><dd>{profile.available}</dd></div>
            </dl>
          </aside>

          <div>
            <div className="prose" data-reveal>
              <p>
                I read code the way a climber reads rock: slowly, looking for the lines others miss.
                From kernel rootkit detection to blockchain-anchored forensics, I build systems that defend at depth.
              </p>
              <p>{profile.intro}</p>
            </div>

            <div className="tree" data-reveal>
              <p className="eyebrow">Skill tree</p>
              {skillTree.map((b) => (
                <div className="branch" key={b.branch}>
                  <h3>{b.branch}</h3>
                  <ul className="tags">{b.skills.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="region region-short" id="campaigns">
        <header className="sub-head" data-reveal>
          <p className="eyebrow">Service record · 戦歴</p>
          <h2 className="title-md">Where I have <em>served</em></h2>
        </header>
        <div className="emaki" data-reveal>
          <i className="emaki-rod" aria-hidden="true" />
          <div className="emaki-paper">
            {campaigns.map((c, i) => (
              <article key={c.id} className="emaki-panel">
                <span className="emaki-mark" aria-hidden="true">{['壱', '弐', '参', '四'][i]}</span>
                <p className="sheet-meta">{c.date} · {c.role}</p>
                <h3>{c.title}</h3>
                <ul className="sheet-points">{c.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
              </article>
            ))}
          </div>
          <i className="emaki-rod" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
