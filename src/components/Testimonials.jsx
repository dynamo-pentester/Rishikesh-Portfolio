import React, { useEffect, useRef, useState } from 'react';
import { testimonials, ctfEvents } from '../data/portfolio';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="testimonials" ref={ref}>
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">04 — RECOGNITION</span>
          <div className="hairline" style={{ flex: 1 }} />
        </div>

        <h2 className="testimonials-heading reveal-in-view">
          What people <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>remember</span> after
          the engagement <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>ends.</span>
        </h2>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card ${inView ? 'reveal-in-view' : ''}`}
              style={{ animationDelay: `${0.15 + i * 0.15}s`, opacity: inView ? undefined : 0 }}
            >
              <Quote size={20} style={{ color: 'rgba(255,255,255,0.25)' }} strokeWidth={1.25} />
              <p className="testimonial-body">"{t.quote}"</p>
              <div className="testimonial-footer">
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-title">{t.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="achievements-strip">
          <div className="achievements-label">ACHIEVEMENTS & CTFS</div>
          <div className="achievements-grid" style={{ gap: '3rem 2rem' }}>
            {ctfEvents.map((a, i) => (
              <div key={a.id} className={`achievement-item ${inView ? 'reveal-in-view' : ''}`} style={{ animationDelay: `${0.1 + (i % 3) * 0.1}s`, opacity: inView ? undefined : 0 }}>
                <div className="achievement-value" style={{ fontSize: '1.1rem' }}>{a.placement}</div>
                <div className="achievement-label">{a.title} — {a.date}</div>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', marginTop: '0.75rem', lineHeight: 1.6, fontWeight: 300 }}>
                  {a.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
