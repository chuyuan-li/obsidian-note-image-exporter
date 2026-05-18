import {type Locales} from './i18n/i18n-types';
import {baseLocale, i18n, locales} from './i18n/i18n-util';
import {loadAllLocales} from './i18n/i18n-util.sync';

loadAllLocales();

let locale: Locales = 'en';
try {
  const language = (window as Window & {
    i18next?: { language?: unknown };
  }).i18next?.language;
  const detectedLocale = typeof language === 'string' ? language : '';
  if (detectedLocale.startsWith('zh')) {
    locale = 'zh';
  } else if (locales.includes(detectedLocale as Locales)) {
    locale = detectedLocale as Locales;
  }

  if (!locales.includes(locale)) {
    locale = baseLocale;
  }
} catch {
  /* empty */
}

 
const L = i18n()[locale];

export default L;
