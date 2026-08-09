/* Stan gościa w localStorage — imię, język, kod, wykonane misje. */

import type { Lang } from './i18n';

const KEYS = {
  name: 'ksfoto_name',
  lang: 'ksfoto_lang',
  code: 'ksfoto_code',
  missions: 'ksfoto_missions_done',
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export const local = {
  getName: () => read(KEYS.name),
  setName: (name: string) => write(KEYS.name, name),

  getLang: (): Lang => (read(KEYS.lang) === 'en' ? 'en' : 'pl'),
  setLang: (lang: Lang) => write(KEYS.lang, lang),

  getCode: () => read(KEYS.code),
  setCode: (code: string) => write(KEYS.code, code),

  getDoneMissions: (): string[] => {
    try {
      const raw = read(KEYS.missions);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  markMissionDone: (id: string): string[] => {
    const done = local.getDoneMissions();
    if (!done.includes(id)) done.push(id);
    write(KEYS.missions, JSON.stringify(done));
    return done;
  },
};
