import { useRef } from 'react';
import { highlights, stack, certificates } from '../data/portfolio';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WORDMARK = 'Rishikesh R — Security Engineer — Offense × Architecture — ';

export default function Highlights() {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.from('.bento-tile', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.bento', start: 'top 82%' },
    });
  }, { scope: ref });

  return (
    <section id="highlights" ref={ref}>
      {/* Ambient light for the glass to refract */}
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">— AT A GLANCE</span>
          <div className="hairline" style={{ flex: 1 }} />
        </div>

        <h2 className="display-heading display-heading--sm">
          <span className="script display-script">in</span>
          Numbers<span className="serif-i">,</span> not adjectives.
        </h2>

        <div className="bento">
          {highlights.map((h) => (
            <div key={h.id} className={`bento-tile glass bento-${h.size}`}>
              <span className="bento-kicker">{h.kicker}</span>
              <span className="bento-value">{h.value}</span>
              <p className="bento-note">{h.note}</p>
            </div>
          ))}

          <div className="bento-tile glass bento-sm bento-sm-last">
            <span className="bento-kicker">Certifications</span>
            <span className="bento-value">{certificates.length}</span>
            <p className="bento-note">AppSec, network security, Linux and more.</p>
          </div>

          <div className="bento-tile glass bento-wide">
            <span className="bento-kicker">Stack — instruments</span>
            <div className="bento-stack">
              {stack.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="wordmark" aria-hidden="true">
        <div className="wordmark-track">
          <span>{WORDMARK.repeat(2)}</span>
          <span>{WORDMARK.repeat(2)}</span>
        </div>
      </div>
    </section>
  );
}
