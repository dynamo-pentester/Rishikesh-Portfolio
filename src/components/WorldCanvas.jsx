import { useEffect, useRef } from 'react';

// The 3D world sits behind the page. three.js is loaded on demand so text paints first.
export default function WorldCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    let world, dead = false;
    const onTheme = () => world?.setTheme();
    import('../world/World.js')
      .then(({ World }) => {
        if (dead) return;
        world = new World(ref.current);
        document.documentElement.classList.add('has-world');
        window.addEventListener('themechange', onTheme);
      })
      .catch(() => document.documentElement.classList.add('no-world'));
    return () => { dead = true; window.removeEventListener('themechange', onTheme); world?.dispose(); };
  }, []);

  return <canvas ref={ref} className="world" aria-hidden="true" />;
}
