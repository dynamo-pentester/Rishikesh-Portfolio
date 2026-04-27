import React, { useRef } from 'react';
import { projects } from '../data/portfolio';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Reveal text elements smoothly on scroll
    gsap.utils.toArray('.project-article').forEach((article) => {
      const elements = article.querySelectorAll('.project-meta-col > *');
      gsap.from(elements, {
        scrollTrigger: {
          trigger: article,
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });
    });

    // High-end image parallax effect
    gsap.utils.toArray('.project-img-wrap').forEach((wrap) => {
      const img = wrap.querySelector('img');
      
      // Scale image up slightly and shift it up so we have room to parallax symmetrically
      gsap.set(img, { scale: 1.2, yPercent: -10 });
      
      gsap.to(img, {
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5, // 1.5 seconds of smooth interpolation (Awwwards secret)
        },
        yPercent: 10,
        ease: 'none'
      });

      // Also unmask the image wrapper itself
      gsap.from(wrap, {
        scrollTrigger: {
          trigger: wrap,
          start: 'top 85%',
        },
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.5,
        ease: 'power4.inOut'
      });
    });
  }, { scope: containerRef });

  return (
    <section id="work" ref={containerRef}>
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">01 — SELECTED WORK</span>
          <div className="hairline" style={{ flex: 1 }} />
          <span className="section-label-text">2024 — 2025</span>
        </div>

        <h2 className="work-intro-title reveal-in-view">
          A small set of projects where the<br />
          <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>stakes were real</span> and the work{' '}
          <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>mattered.</span>
        </h2>

        <div className="work-articles">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className={`project-article${i % 2 === 1 ? ' reverse' : ''}`}
            >
              <div className="project-img-col project-img-wrap" style={{ overflow: 'hidden' }}>
                <img
                  src={p.image}
                  alt={p.title}
                  className="project-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transformOrigin: 'top' }}
                  loading="lazy"
                />
                <div className="project-img-num">
                  — {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </div>
              </div>

              <div className="project-meta-col">
                <div className="project-year-role">
                  <span>{p.year}</span>
                  <span className="project-divider" />
                  <span>{p.role.toUpperCase()}</span>
                </div>
                <h3 className="project-title">{p.title}</h3>
                <p className="project-subtitle">{p.subtitle}</p>
                <p className="project-desc">{p.description}</p>
                <div className="project-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
                <a href={p.link} target="_blank" rel="noreferrer" className="project-link">
                  VIEW PROJECT
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
