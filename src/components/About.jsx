import React, { useRef } from 'react';
import { profile, stats, stack, aboutImage, certificates } from '../data/portfolio';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Reveal text sections smoothly
    const textElements = containerRef.current.querySelectorAll('.about-heading, .about-body, .about-certs');
    gsap.from(textElements, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Stagger stats
    gsap.from('.about-stats > div', {
      scrollTrigger: {
        trigger: '.about-stats',
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // Image Parallax
    const wrap = containerRef.current.querySelector('.about-img-wrap');
    const img = wrap.querySelector('img');
    
    gsap.set(img, { scale: 1.2, yPercent: -10 });
    
    gsap.to(img, {
      scrollTrigger: {
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5, // Butter smooth interpolation
      },
      yPercent: 10,
      ease: 'none'
    });

    gsap.from(wrap, {
      scrollTrigger: {
        trigger: wrap,
        start: 'top 85%',
      },
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.5,
      ease: 'power4.inOut'
    });
  }, { scope: containerRef });

  return (
    <section id="about" ref={containerRef}>
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">02 — ABOUT</span>
          <div className="hairline" style={{ flex: 1 }} />
        </div>

        <div className="about-grid">
          {/* Image */}
          <div className="about-img-wrap" style={{ overflow: 'hidden' }}>
            <img src={aboutImage} alt="Rishikesh R" style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: 'top' }} />
            <div className="about-img-overlay" />
            <div className="about-img-label">FIELD NOTES — Tamil Nadu, India</div>
          </div>

          {/* Text */}
          <div>
            <p className="about-tagline reveal-in-view">— {profile.tagline.toUpperCase()}</p>
            <h2 className="about-heading">
              I work where <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>precision</span> meets
              paranoia — building the quiet machinery that keeps{' '}
              <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>good systems good</span>.
            </h2>
            <div className="about-body">
              <p>
                Security-focused CSE student with strengths in offensive testing, system internals,
                and low-level analysis — building detection systems and secure backend pipelines.
              </p>
              <p>
                My approach is part adversary, part architect. I read code the way a climber reads
                rock: slowly, looking for the lines others miss. From kernel rootkit detection to
                blockchain-anchored forensics — I build systems that defend at depth.
              </p>
              <p className="about-body-dim">
                Currently based in {profile.location}. Open to internships and junior roles globally.
              </p>
            </div>

            {/* Stats */}
            <div className="about-stats">
              {stats.map((s, i) => (
                <div key={s.label}>
                  <div className="about-stat-value">{s.value}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="about-certs">
              <div className="about-certs-label">CERTIFICATIONS</div>
              {certificates.map((cert) => (
                <div key={cert.id} className="about-cert-item">
                  <span className="about-cert-dash">—</span>
                  <a href={cert.link} target="_blank" rel="noreferrer" className="about-cert-text hover:text-white transition-colors" style={{ textDecoration: 'none' }}>
                    {cert.title} <span style={{ opacity: 0.5 }}>({cert.issuer})</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="about-stack">
          <div className="about-stack-label">STACK — INSTRUMENTS</div>
          <div className="marquee-track">
            {[...stack, ...stack].map((s, i) => (
              <span key={i} className="marquee-item">
                {s} <span className="marquee-sep">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;