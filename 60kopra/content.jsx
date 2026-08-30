/* ─────────────────────────────────────────────────────────────────────────
   TREŚĆ STRONY — wszystko do edycji jest tutaj.
   Dane pochodzą z zaproszenia (Figma „Zaproszenie 60 urodziny", 2008:539).
   Pola oznaczone TODO to rzeczy, których nie było na zaproszeniu.
   ───────────────────────────────────────────────────────────────────────── */

const EVENT = {
  dateISO:   '2026-11-07T18:00:00+01:00',
  dateShort: '07/11/26, 18:00',            /* zapis jak na zaproszeniu */
  dateLabel: '7 listopada 2026',
  dayLabel:  'sobota',
  timeLabel: '18:00',

  venue:     'Wrocław Golf Club',
  address:   'Golfowa 2, 55-114 Kryniczno',
  mapsUrl:   'https://www.google.com/maps/search/?api=1&query=Wroc%C5%82aw+Golf+Club%2C+Golfowa+2%2C+55-114+Kryniczno',

  contactEmail: 'kontakt@60kopra.pl',
};

const COPY = {
  meta: {
    title:       '60 urodziny — 07.11.2026',
    description: '60 urodziny — Wrocław Golf Club, 7 listopada 2026.',
  },

  /* Góra strony: nagłówek + od razu formularz RSVP. Bez nawigacji. */
  top: {
    title:   '60 URODZINY',
    logoAlt: 'Wrocław Golf Club',
    /* trzy hasła z dołu zaproszenia — [tekst pogrubiony, reszta] */
    badges: [
      ['Elegancki', 'dress code'],
      ['', 'Bez kwiatów'],
      ['Bezpłatny transport', 'powrotny'],
    ],
    countdownLabel: 'zostało:',
  },

  informacje: {
    kicker: '02',
    title:  'kiedy i gdzie',
    intro:  'Wszystko, co trzeba wiedzieć przed sobotą.',
    /* Pokazujemy wyłącznie to, co wiemy z zaproszenia.
       TODO: godzina kolacji i koniec imprezy — dopisać jako kolejne wiersze. */
    facts: [
      ['data',     null,    null],          /* uzupełniane z EVENT */
      ['początek', null,    null],          /* uzupełniane z EVENT */
      ['miejsce',  null,    null],          /* uzupełniane z EVENT */
    ],
    mapsLink: 'zobacz na mapie →',
  },

  transport: {
    kicker: '03',
    title:  'transport',
    body:   'Zapewniamy bezpłatny transport powrotny z Wrocław Golf Club do centrum. Nie musisz się martwić o powrót.',
    /* TODO: godziny kursów i przystanek — dopóki lista jest pusta,
       strona pokazuje samą notkę poniżej. */
    runs: [],
    pending: 'Dokładne godziny kursów podamy bliżej terminu.',
    note:    'Na miejscu jest bezpłatny parking, jeśli wolisz przyjechać autem.',
  },

  dresscode: {
    kicker: '04',
    title:  'dress code',
    headline: 'elegancki',
    body:  'Listopadowy wieczór w klubie golfowym — marynarka, sukienka, coś, w czym czujesz się dobrze i wyglądasz szykownie.',
    /* TODO: doprecyzować, jeśli tata ma konkretne życzenia (kolory, krawaty). */
    points: [],
  },

  kwiaty: {
    kicker: '05',
    title:  'bez kwiatów',
    body:   'Bardzo prosimy o nieprzynoszenie kwiatów. Najważniejsza jest Wasza obecność — to w zupełności wystarczy.',
  },

  rsvp: {
    kicker: '01',
    title:  'rsvp',
    body:   'Daj znać, czy będziesz. Nic więcej nie musisz wypełniać.',
    deadline: 'Prosimy o potwierdzenie do 17 października.',

    fields: {
      name: {
        label: 'imię i nazwisko',
        hint:  'Żebyśmy wiedzieli, kto się odezwał.',
        placeholder: 'Jan Kowalski',
      },
      attending: {
        label: 'będziesz?',
        hint:  '',
        options: {
          yes: ['tak, będę', ''],
          no:  ['nie dam rady', ''],
        },
      },
      email: {
        label: 'email',
        hint:  'Opcjonalnie — wyślemy potwierdzenie i ewentualne zmiany.',
        placeholder: 'jan@example.com',
      },
    },

    submit:      'wyślij',
    submitting:  'wysyłanie…',
    submitError: 'Coś poszło nie tak. Spróbuj jeszcze raz.',

    errors: {
      nameRequired: 'wpisz imię i nazwisko.',
      nameShort:    'trochę za krótko.',
      attending:    'zaznacz jedną z opcji.',
      email:        'sprawdź pisownię — to nie wygląda na email.',
    },

    success: {
      kicker:     'zapisane',
      yesTitle:   'dzięki, <em>{name}</em>.<br/>do zobaczenia.',
      noTitle:    '<em>szkoda</em>.<br/>dzięki za odpowiedź.',
      yesBody:    'Zapisaliśmy Twoją odpowiedź. Gdyby coś się zmieniło, wypełnij formularz jeszcze raz — nadpiszemy.',
      noBody:     'Zapisaliśmy Twoją odpowiedź. Gdyby coś się zmieniło, wypełnij formularz jeszcze raz — nadpiszemy.',
      reset:      'wypełnij jeszcze raz',
    },
  },

  footer: {
    line:    '60 urodziny · 07.11.2026',
    contact: 'kontakt',
  },
};

Object.assign(window, { EVENT, COPY });
