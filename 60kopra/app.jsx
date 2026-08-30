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

    // Ekran po wysłaniu RSVP wypisuje imię gościa krojem display, a podzbiór
    // latin-ext ładuje się dopiero gdy jakiś polski znak faktycznie trafi na
    // stronę. Bez tego „Paweł" mrugnąłby Georgią. Pobieramy z góry.
    if (document.fonts && document.fonts.load) {
      document.fonts.load('400 40px "Bona Nova SC"', 'ąćęłńóśźż').catch(() => {});
    }

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
