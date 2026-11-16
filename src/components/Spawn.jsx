import { profile } from '../data/portfolio';

export default function Spawn() {
  return (
    <section id="spawn" data-region className="region spawn">
      <span className="kanji" aria-hidden="true">旅</span>
      <p className="eyebrow">Field atlas — {profile.location}</p>
      <h1 className="title-xl">
        <em>Rishikesh</em> R
      </h1>
      <p className="lede">
        {profile.role}. I work where offense meets architecture — kernel internals, offensive testing
        and the detection systems that catch what gets through.
      </p>
      <div className="cta-row">
        <a className="btn btn-solid" href="#quests">Open quest log</a>
        <a className="btn" href="/Rishikesh-R.pdf" target="_blank" rel="noreferrer">Résumé</a>
      </div>
      <p className="hint"><span>Scroll to travel</span><span className="hint-key">Press <kbd>M</kbd> for the map</span></p>
    </section>
  );
}
