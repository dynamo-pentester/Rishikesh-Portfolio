import { useState } from 'react';
import { profile } from '../data/portfolio';

export default function Campfire() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = `mailto:${profile.email}`; }
  };

  return (
    <section id="campfire" data-region className="region campfire">
      <span className="kanji" aria-hidden="true">狼煙</span>
      <p className="eyebrow" data-reveal>Finale — Signal fire · {profile.available}</p>

      <h2 className="verbs" aria-label="Let's probe, harden, ship — together." data-reveal>
        <span aria-hidden="true">let&rsquo;s</span>
        {['probe', 'harden', 'ship'].map((w) => <span key={w} aria-hidden="true">{w}</span>)}
        <em aria-hidden="true">together.</em>
      </h2>

      <div className="sheet contact" data-reveal>
        <button type="button" className="contact-mail" onClick={copy}>
          {profile.email}<small aria-live="polite">{copied ? 'Copied' : 'Copy address'}</small>
        </button>
        <ul className="contact-links">
          {profile.social.map((s) => (
            <li key={s.label}><a className="link" href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
          ))}
        </ul>
      </div>

      <footer className="colophon">
        <img src="/assets/signature.png" alt="Rishikesh R — signature" loading="lazy" />
        <span>© {new Date().getFullYear()} Rishikesh R — terrain, trees and sketches are generated in code.</span>
        <a className="link" href="#spawn">Back to spawn</a>
      </footer>
    </section>
  );
}
