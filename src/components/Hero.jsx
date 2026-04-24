import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dot grid array
const dots = Array.from({ length: 36 });

export default function Hero() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const isMobile = window.innerWidth <= 768;

    // ── Initial load: fade in hero ──
    gsap.from(containerRef.current, {
      opacity: 0,
      duration: 1.8,
      ease: 'power2.inOut',
    });

    // Animate brackets and dots in
    gsap.from('.hero-bracket, .hero-dots', {
      opacity: 0,
      duration: 1.2,
      delay: 0.5,
      ease: 'power2.out',
    });

    // ── Pinned scroll: signature cinematic reveal ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=160%',
        pin: true,
        scrub: 1.5,
        anticipatePin: 1,
      },
    });

    // Fade out scroll indicator
    tl.to('.hero-scroll-indicator', {
      opacity: 0,
      y: 15,
      duration: 0.2,
    });

    // Photo scaling and fade
    tl.fromTo('.hero-photo', {
      scale: 1.2,
      filter: 'brightness(0) contrast(2)',
    }, {
      scale: 1,
      filter: 'brightness(0.85) contrast(1.1)',
      duration: 1,
    }, 0);

    // Signature: swoops from large/below to center
    tl.fromTo(
      '.hero-signature',
      { 
        opacity: 0, 
        scale: isMobile ? 2.2 : 3.5, 
        y: isMobile ? 120 : 220, 
        rotate: -6, 
        filter: 'blur(8px)' 
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
      },
      0.1
    );

    // Split words slide outward
    tl.fromTo('.hero-left-word', {
      x: -50,
      opacity: 0,
    }, {
      x: isMobile ? '-15vw' : '-12vw',
      opacity: 0.6,
      duration: 0.8,
    }, 0.5);

    tl.fromTo('.hero-right-word', {
      x: 50,
      opacity: 0,
    }, {
      x: isMobile ? '15vw' : '12vw',
      opacity: 0.6,
      duration: 0.8,
    }, 0.5);

    // Parallax scale on BG
    tl.to('.hero-bg', {
      scale: 1.1,
      duration: 1,
      ease: 'none',
    }, 0);

  }, { scope: containerRef });

  return (
    <section id="hero" ref={containerRef}>
      {/* Background image - keeping the abstract one for atmosphere */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: 'url(/assets/hero_abstract.png)',
          opacity: 0.4
        }}
      />

      {/* Real Photo Layer */}
      <div className="hero-photo-wrap">
        <img src="/assets/me.jpg" alt="Rishikesh R" className="hero-photo" />
        <div className="hero-scanner" />
      </div>

      {/* Decorative corner brackets */}
      <div className="hero-bracket tl desktop-only" />
      <div className="hero-bracket tr desktop-only" />
      <div className="hero-bracket bl desktop-only" />
      <div className="hero-bracket br desktop-only" />

      {/* Dot grid */}
      <div className="hero-dots desktop-only">
        {dots.map((_, i) => (
          <div key={i} className="hero-dot" />
        ))}
      </div>

      {/* Flag progress bar */}
      <div className="hero-progress desktop-only">
        <div className="hero-progress-line" />
        <div className="hero-progress-dot" />
      </div>

      {/* Split identity text */}
      <div className="hero-identity">
        <div className="hero-left-word hero-split-word desktop-only">
          BL<span className="accent-num">4</span>CK
        </div>
        
        <div className="hero-right-word hero-split-word desktop-only">
          H<span className="accent-num">34</span>R<span className="accent-num" style={{ color: 'var(--green)' }}>7</span>
        </div>
      </div>

      {/* Signature */}
      <div className="hero-signature-wrap">
        <img
          src="/assets/signature.png"
          alt="Rishikesh R — Signature"
          className="hero-signature"
          style={{ opacity: 0 }}
        />
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}