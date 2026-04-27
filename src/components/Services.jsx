import React, { useEffect, useRef, useState } from 'react';
import { services } from '../data/portfolio';
import { ArrowUpRight } from 'lucide-react';

const Services = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" ref={ref}>
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">03 — CAPABILITIES</span>
          <div className="hairline" style={{ flex: 1 }} />
        </div>

        <div className="services-intro-grid">
          <h2 className="services-heading">
            Four <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>disciplines.</span><br />
            One quiet <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>obsession.</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <p className="services-desc">
              From kernel-level rootkit detection to secure backend pipelines — every engagement
              is calibrated to the threat surface, not the checklist.
            </p>
          </div>
        </div>

        <div className="services-grid">
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`service-card ${inView ? 'reveal-in-view' : ''}`}
              style={{ animationDelay: `${0.1 + i * 0.12}s`, opacity: inView ? undefined : 0 }}
            >
              <div className="service-card-top">
                <span className="service-id">{s.id}</span>
                <ArrowUpRight size={20} className="service-arrow" />
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <div className="service-keywords">
                {s.keywords.map((k) => (
                  <span key={k} className="service-kw">{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
