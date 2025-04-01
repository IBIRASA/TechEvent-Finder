const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['header', 'querystring'],
      caches: ['cookie']
    }
  });

module.exports = i18nextMiddleware.handle(i18next);