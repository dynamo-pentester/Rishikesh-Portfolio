import React from 'react';
import { navItems, profile } from '../data/portfolio';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <a href="#hero" className="footer-logo">
              <div className="footer-logo-box">
                <span className="footer-logo-initials">RR</span>
              </div>
              <div>
                <div className="footer-logo-name">{profile.name}</div>
                <div className="footer-logo-role">{profile.role.toUpperCase()}</div>
              </div>
            </a>
            <p className="footer-tagline">
              Security-focused engineer. Building at the intersection of offense and architecture.
              Based in {profile.location}.
            </p>
          </div>

          <div>
            <div className="footer-col-label">SITEMAP</div>
            <ul className="footer-links">
              {navItems.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-label">SOCIAL</div>
            <ul className="footer-links">
              {profile.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {year} — RISHIKESH R. ALL RIGHTS RESERVED.
          </div>
          <div className="footer-copy">
            CRAFTED IN TAMIL NADU — v.2025.04
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
