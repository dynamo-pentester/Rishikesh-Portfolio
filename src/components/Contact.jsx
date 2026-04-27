import React, { useState } from 'react';
import { profile } from '../data/portfolio';
import { ArrowUpRight, Copy, Check } from 'lucide-react';

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {}
  };

  return (
    <section id="contact">
      <div className="section-container">
        <div className="section-label-row">
          <span className="section-label-text">05 — CONTACT</span>
          <div className="hairline" style={{ flex: 1 }} />
          <span className="section-label-text">
            <span className="avail-dot" />
            AVAILABLE
          </span>
        </div>

        <div className="contact-grid">
          <div>
            <h2 className="contact-heading">
              Let's build<br />
              something <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>secure</span><br />
              and <span className="serif" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>resilient.</span>
            </h2>
            <p className="contact-subtext">
              I'm currently open to internship roles and junior security engineer positions.
              If you're building something that matters and want a careful pair of eyes, reach out.
            </p>
          </div>

          <div className="contact-details">
            <div className="contact-field">
              <div className="contact-field-label">EMAIL</div>
              <button className="contact-email-btn" onClick={copyEmail}>
                {profile.email}
                {copied
                  ? <Check size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  : <Copy size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
                }
              </button>
            </div>

            <div className="contact-field">
              <div className="contact-field-label">LOCATION</div>
              <div className="contact-location">{profile.location}</div>
            </div>

            <div className="contact-field">
              <div className="contact-field-label">AVAILABILITY</div>
              <div className="contact-avail">{profile.available}</div>
            </div>

            <div className="contact-social">
              <div className="contact-social-label">ELSEWHERE</div>
              {profile.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-link"
                >
                  <span className="contact-social-name">{s.label}</span>
                  <ArrowUpRight size={16} className="contact-social-arrow" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;