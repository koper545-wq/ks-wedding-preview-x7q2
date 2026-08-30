/* Landing one-pager — bez nawigacji, RSVP na samej górze */

function scrollToId(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: 'start' });
  history.replaceState(null, '', '#' + id);
}

function App() {
  React.useEffect(() => {
    document.title = COPY.meta.title;

    // Wejście z linkiem #sekcja. 'instant' omija globalne scroll-behavior: smooth
    // (animowany skok był przerywany przez przywracanie scrolla przez przeglądarkę),
    // a powtórka po `load` łapie przesunięcie layoutu po doczytaniu fontów.
    const hash = window.location.hash.replace('#', '');
    if (!hash || !document.getElementById(hash)) return;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const jump = () => scrollToId(hash, 'instant');
    jump();
    if (document.readyState === 'complete') return;
    window.addEventListener('load', jump, { once: true });
    return () => window.removeEventListener('load', jump);
  }, []);

  return (
    <>
      <TopRSVP />
      <main>
        <SectionInformacje />
        <SectionTransport />
        <SectionDressCode />
        <SectionKwiaty />
      </main>
      <SiteFooter />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
