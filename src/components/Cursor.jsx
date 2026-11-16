import { useEffect, useRef } from 'react';

// A small katana whose point is the pointer: the blade catches red and tilts into a cut over anything clickable. Mouse devices only.
export default function Cursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; el.classList.add('is-on'); };
    const over = (e) => el.classList.toggle('is-active', !!e.target.closest?.('a, button, [data-cursor]'));
    const leave = () => el.classList.remove('is-on');
    const tick = () => {
      x += (tx - x) * 0.45; y += (ty - y) * 0.45;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <svg className="cursor-blade" viewBox="0 0 46 46" width="46" height="46">
        <path className="cb-steel" d="M1 1 C9 6 19 15 28.6 26.4 L26.4 28.6 C16 18 7.5 9 1 1Z" />
        <path className="cb-edge" d="M1 1 C9 6 19 15 28.6 26.4" />
        <ellipse className="cb-guard" cx="28.4" cy="28.4" rx="4.6" ry="1.7" transform="rotate(-45 28.4 28.4)" />
        <path className="cb-grip" d="M29.6 29.6 L41 41" />
        <path className="cb-wrap" d="M32 32 l1.6 1.6 M35 35 l1.6 1.6 M38 38 l1.6 1.6" />
      </svg>
    </div>
  );
}
