import { profile, skillTree } from '../data/portfolio';

export default function Character() {
  return (
    <section id="character" data-region className="region">
      <span className="kanji" aria-hidden="true">人物</span>
      <header className="region-head" data-reveal data-slash>
        <p className="eyebrow">Act II — The warrior</p>
        <h2 className="title-lg">Part adversary, <em>part architect</em></h2>
      </header>

      <div className="character">
        <aside className="sheet card" data-reveal>
          <dl className="facts">
            <div><dt>Class</dt><dd>{profile.role}</dd></div>
            <div><dt>Origin</dt><dd>{profile.location}</dd></div>
            <div><dt>Guild</dt><dd>Ramco Institute of Technology — B.E. CSE, 2023–2027</dd></div>
            <div><dt>Last campaign</dt><dd>Alcatel-Lucent Enterprise — Software Development Intern, 2025</dd></div>
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
  );
}
