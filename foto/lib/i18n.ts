/* Teksty PL/EN — bez zewnętrznej biblioteki, spójne z tonem strony głównej
   (lowercase, sucho, bez wykrzykników). */

export type Lang = 'pl' | 'en';

const STRINGS = {
  pl: {
    meta: {
      title: 'foto — klara & szymon',
      description: 'wrzuć zdjęcia i wideo z wesela',
    },
    gate: {
      kicker: 'foto & wideo · 15.08.2026',
      title: 'ta strona jest <em>tylko</em> dla gości.',
      body: 'wejdź przez link lub kod QR, który dostaliście od nas — albo zapytaj kogoś przy stole.',
    },
    name: {
      kicker: '0¹ — na początek',
      title: 'jak masz <em>na imię</em>?',
      hint: 'podpiszemy nim twoje zdjęcia. można pominąć.',
      placeholder: 'twoje imię',
      submit: 'dalej',
      skip: 'pomiń',
    },
    home: {
      kicker: 'foto & wideo · wasze kadry',
      title: 'wrzuć <em>cokolwiek</em>.',
      subtitle: 'zdjęcia i wideo lądują prosto u nas.',
      freeUpload: 'wrzuć cokolwiek',
      freeUploadSub: 'bez misji · zdjęcia lub wideo',
      missionsKicker: '0² — misje',
      missionsTitle: 'misje <em>specjalne</em>',
      missionsHint: 'traktuj jak podpowiedzi, nie obowiązek.',
      progress: (done: number, total: number) => `${done} z ${total}`,
      greeting: (name: string) => `cześć, ${name}`,
      changeName: 'zmień imię',
      privacy:
        'zdjęcia i filmy zbieramy my — klara i szymon — na nasz prywatny google drive, tylko na pamiątkę z wesela.',
    },
    queue: {
      kicker: 'wysyłka',
      empty: 'nic się jeszcze nie wysyła.',
      total: 'łącznie',
      keepOpen: 'nie zamykaj tej karty do końca wysyłania.',
      offline: 'brak internetu — wysyłka wznowi się automatycznie.',
      done: 'wysłane',
      failed: 'nie udało się',
      retry: 'spróbuj znowu',
      uploading: 'wysyłanie…',
      waiting: 'w kolejce',
      paused: 'wstrzymane',
    },
    errors: {
      badType: 'to nie jest zdjęcie ani wideo.',
      tooBig: 'plik jest większy niż 2 gb.',
      session: 'nie udało się zacząć wysyłki. spróbuj za chwilę.',
    },
  },
  en: {
    meta: {
      title: 'photos — klara & szymon',
      description: 'upload your wedding photos and videos',
    },
    gate: {
      kicker: 'photo & video · 15.08.2026',
      title: 'this page is for <em>guests</em> only.',
      body: 'use the link or QR code we gave you — or ask someone at your table.',
    },
    name: {
      kicker: '0¹ — first things first',
      title: 'what’s your <em>name</em>?',
      hint: 'we’ll tag your photos with it. you can skip this.',
      placeholder: 'your name',
      submit: 'continue',
      skip: 'skip',
    },
    home: {
      kicker: 'photo & video · your shots',
      title: 'upload <em>anything</em>.',
      subtitle: 'photos and videos go straight to us.',
      freeUpload: 'upload anything',
      freeUploadSub: 'no mission · photos or videos',
      missionsKicker: '0² — missions',
      missionsTitle: 'special <em>missions</em>',
      missionsHint: 'treat them as prompts, not homework.',
      progress: (done: number, total: number) => `${done} of ${total}`,
      greeting: (name: string) => `hi, ${name}`,
      changeName: 'change name',
      privacy:
        'photos and videos are collected by us — klara & szymon — to our private google drive, as a keepsake from the wedding.',
    },
    queue: {
      kicker: 'uploads',
      empty: 'nothing is uploading yet.',
      total: 'total',
      keepOpen: 'keep this tab open until uploads finish.',
      offline: 'you’re offline — uploads will resume automatically.',
      done: 'uploaded',
      failed: 'failed',
      retry: 'retry',
      uploading: 'uploading…',
      waiting: 'queued',
      paused: 'paused',
    },
    errors: {
      badType: 'that’s not a photo or a video.',
      tooBig: 'file is larger than 2 gb.',
      session: 'couldn’t start the upload. try again in a moment.',
    },
  },
};

export type Strings = (typeof STRINGS)['pl'];

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}

export const LANGS: Lang[] = ['pl', 'en'];
