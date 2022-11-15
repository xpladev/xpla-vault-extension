import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Dictionary } from 'ramda';
import { debug } from 'utils/env';

const flatten = (obj: object, initial = {}): Dictionary<string> => {
  return Object.entries(obj).reduce((prev, [key, value]) => {
    if (!value) return prev;
    const next =
      typeof value === 'string' ? { [key]: value } : flatten(value, prev);
    return Object.assign({}, prev, next);
  }, initial);
};

export const Languages = {
  en: { value: 'en', label: 'English', translation: {} },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: Languages,
  debug: !!debug.translation,
});
