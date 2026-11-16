import { useEffect, useRef } from 'react';
import { heart } from '../world/sigils';

const d = heart(40).map(([x, y], i) => `${i ? 'L' : 'M'}${(x * 11).toFixed(2)} ${(-y * 11).toFixed(2)}`).join('') + 'Z';

// A small heart that turns in 3D (three crossed outlines) and trails the pointer. Mouse devices only.
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
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
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
      <div className="cursor-spin">
        {[0, 60, 120].map((r) => (
          <svg key={r} viewBox="-13 -13 26 26" style={{ transform: `rotateY(${r}deg)` }}><path d={d} /></svg>
        ))}
      </div>
    </div>
  );
}
