/**
 * Blurred backdrop pinned to the viewport, so it stays put while the page scrolls.
 * The image bleeds past the edges (`-inset-6`) so the blur never fades to transparent at the borders.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-paper">
      <div className="absolute -inset-6 bg-[url(/background.jpg)] bg-cover bg-center blur-[8px]" />
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
