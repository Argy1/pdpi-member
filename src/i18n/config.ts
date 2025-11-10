import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'id',
    lng: 'id', // Set default language explicitly
    defaultNS: 'common',
    ns: ['common'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Set Indonesian as default if no language preference exists
if (!localStorage.getItem('i18nextLng')) {
  i18n.changeLanguage('id');
  localStorage.setItem('i18nextLng', 'id');
}

export default i18n;
