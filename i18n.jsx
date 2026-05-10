/* i18n — language strings and lang context */

const STRINGS = {
  /* ────────────────────────────────────────────────────────────────── */
  /* POLISH                                                              */
  /* ────────────────────────────────────────────────────────────────── */
  pl: {
    nav: {
      list:       'list',
      informacje: 'informacje',
      rsvp:       'rsvp',
      dresscode:  'dress code',
      plandnia:   'plan dnia',
      menu:       'menu',
      home:       'strona główna',
      open:       'otwórz menu',
      close:      'zamknij menu',
    },
    hero: {
      vol:        'vol. 01 — wrocław',
      kicker:     'k & s · cocktail · ślub',
      summer:     'summer mmxxvi',
      caption:    'pl. 01 — long table, evening',
      filmStamp:  'shot on film · 2024',
      partyMeta:  'ślub & cocktail party',
      coupleSurname: 'Koprowscy',
      venue:      '15 sierpnia 2026 · wrocław golf club',
      countdownLabel: 'widzimy się za:',
      countdownTo: 'do 15.08.2026',
      d: 'dni', h: 'godz', m: 'min', s: 'sek',
    },
    informacje: {
      kicker: '01',
      title: 'sobota,<br><em>15</em> sierpnia',
      facts: {
        date:      ['data',      '15.08.2026', 'sobota'],
        start:     ['początek',  '15:00', 'cocktail hour · spokojne zbieranie gości'],
        ceremony:  ['ceremonia', '16:00', 'ceremonia wśród zieleni · more info na miejscu'],
        end:       ['koniec',    '~04:00', 'świętujemy do rana'],
        venue:     ['miejsce',   'Wrocław Golf Club', 'Kryniczno, ul. Golfowa 1'],
        directions:['dojazd',    'ok. 25 min od centrum', 'własny transport · parking na miejscu'],
      },
      mapBadge: 'dojazd',
      mapPoints: [
        'na miejscu znajduje się duży parking',
        'dla chętnych będą dostępne taksówki',
        'więcej szczegółów soon',
      ],
      mapsLink: 'google maps →',
    },
    soon: {
      kicker: '0¹ – list do gości',
      annot:  'a note · §01',
      title:  'do zobaczenia <em>już</em> niedługo.',
      body1:  'specjalnie dla Was stworzyliśmy dedykowaną stronę z ważnymi informacjami. mamy nadzieję, że odpowiemy tu na wszystkie Wasze pytania.',
      body2:  'na początku bardzo prosimy o wypełnienie RSVP wraz z mailem, na który będziemy wysyłać wszelkie aktualizacje. już nie możemy się doczekać wspólnego świętowania!',
      sign:   'k & s',
    },
    format: {
      kicker: '0² – format wesela',
      annot:  'how it goes · §02',
      title:  'letnie, polskie wesele – <em>cocktail</em> party na tarasie.',
      cols: {
        food: {
          name:    'jedzenie <em>&amp;</em> bar',
          tagline: 'lekka formuła',
          body:    'zamiast kolacji – bufet, pizza z pieca i grill.<br>bar z naszymi fav koktajlami,<br>stół z polskimi winami i polską wódką.',
        },
        outdoor: {
          name:    'outdoor',
          tagline: 'popołudnie i wczesny wieczór',
          body:    'ceremonia i pierwsza część odbędzie się na zewnątrz. muzyka na żywo, pierwszy taniec, rozmowy i gry.',
        },
        late: {
          name:    'late <em>night</em>',
          tagline: 'po 22:00',
          time:    '',
          body:    'przenosimy się do środka i zaczynamy tańce!',
        },
      },
      outro: 'dokładny plan ceremonii soon',
    },
    rsvpTeaser: {
      kicker: '0³ – rsvp',
      annot:  'please reply · §03',
      title:  'dajcie znać<br>czy będziecie.',
      body:   'formularz rsvp z preferencjami żywieniowymi, zajmie Wam dwie minuty. prosimy o wypełnienie maksymalnie do końca czerwca!',
      cta:    'wypełnij rsvp',
      ctaSub: 'dwie minuty',
    },
    footer: {
      contact: 'kontakt',
      contactValue: 'kontakt@klaraiszymon.pl',
      copyright: '© mmxxvi · klara & szymon koprowscy',
      madeBy: 'made by',
    },
    dresscode: {
      kicker: '04 – dress code',
      annot:  'what to wear · §04',
      title:  'ubierzcie się <em>elegancko</em>,<br>jak na letnie <em>cocktail</em> party.',
      sub:    'outdoor po południu, indoor wieczorem.',
      rule1: {
        label:    'tkaniny',
        headline: 'lekkie <em>i</em> zwiewne.',
        body:     'polecamy oddychające materiały. unikajcie ciężkich syntetyków, satyny do podłogi, sztywnych konstrukcji. to będzie letnie wesele! 🍓',
      },
      rule2: {
        label:    'kolory sukienek',
        headline: 'girls, <em>nie</em> mamy bardzo sztywnych zasad, ale…',
        bodyParas: [
          'unikajcie bardzo mocnych kolorów, takich jak np. krwista czerwień czy neony.',
          'czerń jest ok, ale stawiajcie na kolory – to jest letnie wesele! naturalnie biel, ecru, kość słoniowa zarezerwowane są dla panny młodej.',
          'wzory czy kwieciste kreacje są jak najbardziej okej.',
        ],
      },
      rule3: {
        label:    'dla panów',
        headline: 'guys, <em>nie</em> akceptujemy t-shirtów – koszule only!',
        body:     'stawiajcie na elegancki look. uprzedzając pytania – lniany garnitur też jest ok.',
      },
      outroKicker: 'jeśli macie wątpliwości',
      outro:       'piszcie, <em>postaramy się</em> doradzić i odpowiedzieć na wszystkie Wasze pytania!',
      contact:     'kontakt@klaraiszymon.pl',
      back:        'powrót na cover',
      pageMeta:    '§04 · dress code · k&s mmxxvi',
    },
    plandnia: {
      kicker: '05 – plan dnia',
      annot:  'timeline · §05',
      title:  '<em>more info</em><br>na miejscu',
      darkKicker: 'najważniejsza informacja na ten moment',
      darkTitle:  '<em>16:00</em> zaczynamy zaślubiny,<br>kończymy <em>około 4:00</em>.',
      darkSub:    'be there or be square &lt;3',
      back:       'powrót na cover',
      pageMeta:   '§05 · plan dnia · k&s mmxxvi',
    },
    rsvp: {
      coverKicker: '0⁴ — rsvp',
      coverAnnot:  'krok po kroku · §04',
      coverAnnotLong: 'jeden ekran · §04',
      coverTitle:  'dajcie <em>znać</em><br>czy <em>będziecie</em>.',
      coverBody:   'sześć krótkich pytań, dwie minuty. odpowiedzi zapisują się lokalnie, więc możecie wrócić i edytować, jeśli coś się zmieni.',
      progress:    'postęp',
      previous:    'poprzednie',
      next:        'dalej',
      submit:      'wyślij rsvp',
      submitting:  'wysyłam…',
      questionPrefix: 'pytanie',
      back:        'powrót na cover',
      pageMeta:    '§04 · rsvp · k&s mmxxvi',
      steps: {
        name: {
          kicker: 'pytanie 01',
          label:  'imię <em>i</em> nazwisko',
          hint:   '',
          placeholder: 'np. Anna Kowalska i Jan Kowalski',
        },
        attending: {
          kicker: 'pytanie 02',
          label:  'będziecie <em>na</em> naszym weselu 15.08?',
          hint:   'odpowiedzcie jak najszybciej, najpóźniej do końca czerwca.',
          options: {
            yes:   ['tak', ''],
            no:    ['nie', ''],
          },
        },
        plus_one: {
          kicker: 'pytanie 03',
          label:  'osoba <em>towarzysząca</em>?',
          hint:   'jeśli nie było jej na zaproszeniu – podajcie imię i nazwisko.',
          yes:    'tak, przyjdę z kimś',
          no:     'przyjdę solo',
          nameLabel: 'imię i nazwisko osoby towarzyszącej',
          namePlaceholder: 'np. piotr nowak',
        },
        diet: {
          kicker: 'pytanie 04',
          label:  'dieta <em>albo</em> alergie?',
          hint:   'na przyjęciu będzie bufet, znajdziecie w nim dania wegetariańskie jak i mięsne, ale w razie mocniejszych alergii lub diety wegańskiej postaramy się przygotować coś osobno.',
          placeholder: 'jem wszystko…',
        },
        drinks: {
          kicker: 'pytanie 05',
          label:  'co <em>do</em> baru?',
          hint:   'chcemy zamówić odpowiednie ilości.',
          options: {
            alko:     ['alkohol',  'wino · cocktails · wódka'],
            non_alko: ['non-alco', 'mocktails'],
          },
        },
        email: {
          kicker: 'pytanie 06',
          label:  'jaki <em>e-mail</em>?',
          hint:   'na ten adres dosypiemy szczegóły bliżej daty.',
          placeholder: 'imie@domena.pl',
        },
      },
      validation: {
        choice:        'wybierzcie jedną z opcji.',
        plusOneName:   'imię osoby towarzyszącej.',
        emailRequired: 'email jest potrzebny.',
        emailInvalid:  'sprawdźcie pisownię — to nie wygląda na email.',
        phoneRequired: 'telefon jest potrzebny.',
        phoneShort:    'telefon wygląda na za krótki.',
        phoneLong:     'telefon wygląda na za długi.',
        textRequired:  'to pole jest potrzebne.',
        textShort:     'trochę za krótko.',
      },
      success: {
        kicker:    'rsvp · zapisane',
        comingTitle:  'dzięki, <em>{name}</em>.<br><em>do</em> zobaczenia 15 sierpnia.',
        notTitle:     '<em>żałujemy</em>, ale rozumiemy.<br>dzięki za odpowiedź.',
        maybeTitle:   '<em>zapisane</em>.<br>czekamy <em>na</em> ostateczną decyzję.',
        comingBody:   'wszystkie szczegóły — dokładny adres, parking, shuttle, mapa — wyślemy mailem na początku lipca. jeśli coś się zmieni, dajcie znać.',
        notBody:      'jeśli coś się zmieni — wystarczy wrócić tutaj i wypełnić formularz jeszcze raz. nadpiszemy odpowiedź.',
        backCover:    '← powrót na cover',
        editAnswers:  'edytuj odpowiedzi',
      },
      submitError: 'nie udało się wysłać — sprawdź połączenie i spróbuj jeszcze raz',
      defaultName: 'kochani',
    },
    countdownLabel: 'odliczanie',
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* ENGLISH                                                             */
  /* ────────────────────────────────────────────────────────────────── */
  en: {
    nav: {
      list:       'letter',
      informacje: 'info',
      rsvp:       'rsvp',
      dresscode:  'dress code',
      plandnia:   'day plan',
      menu:       'menu',
      home:       'home',
      open:       'open menu',
      close:      'close menu',
    },
    hero: {
      vol:        'vol. 01 — wrocław',
      kicker:     'k & s · cocktail · wedding',
      summer:     'summer mmxxvi',
      caption:    'pl. 01 — long table, evening',
      filmStamp:  'shot on film · 2024',
      partyMeta:  'wedding & cocktail party',
      coupleSurname: 'Koprowscy',
      venue:      'August 15, 2026 · Wrocław Golf Club',
      countdownLabel: 'we meet in:',
      countdownTo: 'until 08.15.2026',
      d: 'days', h: 'hrs', m: 'min', s: 'sec',
    },
    informacje: {
      kicker: '01',
      title: 'Saturday,<br>August <em>15</em>',
      facts: {
        date:      ['date',         '08.15.2026', 'Saturday'],
        start:     ['start',        '3:00 PM',    'cocktail hour · easy gathering'],
        ceremony:  ['ceremony',     '4:00 PM',    'outdoor ceremony · more info on the day'],
        end:       ['end',          '~4:00 AM',   'we celebrate till morning'],
        venue:     ['venue',        'Wrocław Golf Club', 'Kryniczno, Golfowa 1'],
        directions:['directions',   'ca. 25 min from centre', 'own transport · parking on site'],
      },
      mapBadge: 'directions',
      mapPoints: [
        'large parking on site',
        'taxis available on request',
        'more details soon',
      ],
      mapsLink: 'google maps →',
    },
    soon: {
      kicker: '0¹ – a letter',
      annot:  'a note · §01',
      title:  'see you <em>very</em> soon.',
      body1:  'we made this site just for you, with all the important info. we hope you find here every answer you need.',
      body2:  'first, please fill out the RSVP with your email — we will be sending updates there. we can\'t wait to celebrate with you!',
      sign:   'k & s',
    },
    format: {
      kicker: '0² – wedding format',
      annot:  'how it goes · §02',
      title:  'a summer Polish wedding – <em>cocktail</em> party on the terrace.',
      cols: {
        food: {
          name:    'food <em>&amp;</em> bar',
          tagline: 'a light formula',
          body:    'no sit-down dinner – buffet, pizza from a wood oven, grill.<br>a bar with our fav cocktails,<br>a table with Polish wines and Polish vodka.',
        },
        outdoor: {
          name:    'outdoor',
          tagline: 'afternoon & early evening',
          body:    'ceremony and the first part outside. live music, first dance, conversations and games.',
        },
        late: {
          name:    'late <em>night</em>',
          tagline: 'after 10 PM',
          time:    '',
          body:    'we move inside and the dancing begins!',
        },
      },
      outro: 'detailed timeline coming soon',
    },
    rsvpTeaser: {
      kicker: '0³ – rsvp',
      annot:  'please reply · §03',
      title:  'let us know<br>if you\'re coming.',
      body:   'a quick rsvp form with dietary preferences — takes two minutes. please reply by end of June at the latest!',
      cta:    'fill out rsvp',
      ctaSub: 'two minutes',
    },
    footer: {
      contact: 'contact',
      contactValue: 'kontakt@klaraiszymon.pl',
      copyright: '© mmxxvi · klara & szymon koprowscy',
      madeBy: 'made by',
    },
    dresscode: {
      kicker: '04 – dress code',
      annot:  'what to wear · §04',
      title:  'dress <em>elegantly</em>,<br>like for a summer <em>cocktail</em> party.',
      sub:    'outdoor in the afternoon, indoor in the evening.',
      rule1: {
        label:    'fabrics',
        headline: 'light <em>and</em> airy.',
        body:     'we recommend breathable materials. avoid heavy synthetics, full-length satin, stiff constructions. it\'s a summer wedding! 🍓',
      },
      rule2: {
        label:    'dress colors',
        headline: 'girls, we <em>don\'t</em> have super strict rules, but…',
        bodyParas: [
          'avoid very bold colors like blood-red or neons.',
          'black is fine, but lean into colors – it\'s a summer wedding! and naturally white, ecru, ivory are reserved for the bride.',
          'patterns and floral pieces are absolutely welcome.',
        ],
      },
      rule3: {
        label:    'for guys',
        headline: 'guys, <em>no</em> t-shirts – shirts only!',
        body:     'go for an elegant look. answering the obvious – a linen suit is also ok.',
      },
      outroKicker: 'if you have any doubts',
      outro:       'write to us — <em>we\'ll do our best</em> to advise and answer all your questions!',
      contact:     'kontakt@klaraiszymon.pl',
      back:        'back to cover',
      pageMeta:    '§04 · dress code · k&s mmxxvi',
    },
    plandnia: {
      kicker: '05 – day plan',
      annot:  'timeline · §05',
      title:  '<em>more info</em><br>on the day',
      darkKicker: 'most important info for now',
      darkTitle:  'we begin <em>at 4 PM</em>,<br>we end <em>around 4 AM</em>.',
      darkSub:    'be there or be square &lt;3',
      back:       'back to cover',
      pageMeta:   '§05 · day plan · k&s mmxxvi',
    },
    rsvp: {
      coverKicker: '0⁴ — rsvp',
      coverAnnot:  'step by step · §04',
      coverAnnotLong: 'one screen · §04',
      coverTitle:  'tell us if<br>you\'re <em>coming</em>.',
      coverBody:   'six short questions, two minutes. answers save locally, so you can come back and edit if anything changes.',
      progress:    'progress',
      previous:    'previous',
      next:        'next',
      submit:      'send rsvp',
      submitting:  'sending…',
      questionPrefix: 'question',
      back:        'back to cover',
      pageMeta:    '§04 · rsvp · k&s mmxxvi',
      steps: {
        name: {
          kicker: 'question 01',
          label:  'first <em>and</em> last name',
          hint:   '',
          placeholder: 'e.g. Anna Kowalska & Jan Kowalski',
        },
        attending: {
          kicker: 'question 02',
          label:  'will you be at <em>our wedding</em> on Aug 15?',
          hint:   'please reply as soon as possible, no later than end of June.',
          options: {
            yes:   ['yes', ''],
            no:    ['no',  ''],
          },
        },
        plus_one: {
          kicker: 'question 03',
          label:  'a <em>plus one</em>?',
          hint:   'if not on the invitation — please give us their full name.',
          yes:    'yes, bringing someone',
          no:     'coming solo',
          nameLabel: 'plus one — full name',
          namePlaceholder: 'e.g. piotr nowak',
        },
        diet: {
          kicker: 'question 04',
          label:  'diet <em>or</em> allergies?',
          hint:   'we\'ll have a buffet with both vegetarian and meat dishes. for serious allergies or vegan diet, we\'ll prepare something separately.',
          placeholder: 'i eat everything…',
        },
        drinks: {
          kicker: 'question 05',
          label:  'what <em>about</em> the bar?',
          hint:   'we want to order the right amounts.',
          options: {
            alko:     ['alcohol',  'wine · cocktails · vodka'],
            non_alko: ['non-alc',  'mocktails'],
          },
        },
        email: {
          kicker: 'question 06',
          label:  'what <em>e-mail</em>?',
          hint:   'we\'ll send details closer to the date.',
          placeholder: 'name@domain.com',
        },
      },
      validation: {
        choice:        'pick one option.',
        plusOneName:   'name of your plus one.',
        emailRequired: 'email is required.',
        emailInvalid:  'check the spelling — that doesn\'t look like an email.',
        phoneRequired: 'phone is required.',
        phoneShort:    'phone looks too short.',
        phoneLong:     'phone looks too long.',
        textRequired:  'this field is required.',
        textShort:     'a bit too short.',
      },
      success: {
        kicker:    'rsvp · saved',
        comingTitle:  'thanks, <em>{name}</em>.<br>see you on <em>august</em> 15.',
        notTitle:     '<em>we\'re sad</em>, but we get it.<br>thanks for letting us know.',
        maybeTitle:   '<em>saved</em>.<br>waiting <em>for</em> the final answer.',
        comingBody:   'all the details — exact address, parking, shuttle, map — will arrive by email in early july. let us know if anything changes.',
        notBody:      'if things change — just come back and fill the form again. we\'ll overwrite your answer.',
        backCover:    '← back to cover',
        editAnswers:  'edit my answers',
      },
      submitError: 'failed to send — check your connection and try again',
      defaultName: 'friends',
    },
    countdownLabel: 'countdown',
  },
};

const LangContext = React.createContext({ lang: 'pl', setLang: () => {} });

function getInitialLang() {
  try {
    const saved = localStorage.getItem('ks2026_lang');
    if (saved === 'pl' || saved === 'en') return saved;
  } catch {}
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.startsWith('pl') ? 'pl' : 'en';
  }
  return 'pl';
}

function useLang() {
  return React.useContext(LangContext);
}

function useT() {
  const { lang } = useLang();
  return React.useMemo(() => {
    return (key) => {
      const parts = key.split('.');
      let v = STRINGS[lang];
      for (const p of parts) v = (v == null) ? null : v[p];
      if (v == null) {
        v = STRINGS.pl;
        for (const p of parts) v = (v == null) ? null : v[p];
      }
      return v == null ? key : v;
    };
  }, [lang]);
}

Object.assign(window, { LangContext, useLang, useT, STRINGS, getInitialLang });
