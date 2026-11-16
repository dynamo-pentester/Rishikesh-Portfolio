// The opening frame of an act: the screen holds on the world with only the act's title, bottom left, and its kanji.
export default function ActTitle({ eyebrow, kanji, children }) {
  return (
    <header className="act">
      <div className="act-pin">
        <div className="region-head" data-reveal data-slash>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="title-lg">{children}</h2>
        </div>
        <span className="kanji" aria-hidden="true">{kanji}</span>
      </div>
    </header>
  );
}
