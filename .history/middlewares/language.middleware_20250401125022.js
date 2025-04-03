export const detectLanguage = (req, res, next) => {
    const supportedLangs = ['en', 'fr', 'es'];
    const lang = req.query.lang || req.acceptsLanguages(supportedLangs) || 'en';
    req.language = supportedLangs.includes(lang) ? lang : 'en';
    next();
  };