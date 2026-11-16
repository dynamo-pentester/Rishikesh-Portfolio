import { useEffect } from 'react';
import WorldCanvas from './components/WorldCanvas';
import Hud from './components/Hud';
import Cursor from './components/Cursor';
import Spawn from './components/Spawn';
import QuestLog from './components/QuestLog';
import Character from './components/Character';
import Disciplines from './components/Disciplines';
import Trophies from './components/Trophies';
import Campfire from './components/Campfire';

function App() {
  // Reveal-on-scroll for anything marked data-reveal (a data attribute, so React re-renders never undo it).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.dataset.reveal = 'in'; io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#quests">Skip to projects</a>
      <WorldCanvas />
      <div className="veil" aria-hidden="true" />
      <Hud />
      <Cursor />
      <main>
        <Spawn />
        <QuestLog />
        <Character />
        <Disciplines />
        <Trophies />
        <Campfire />
      </main>
    </>
  );
}

export default App;
