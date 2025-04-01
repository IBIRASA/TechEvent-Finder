import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";

i18next.init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        welcome: "Welcome",
        server_error: "Something went wrong",
      },
    },
  },
});

export default i18nextMiddleware.handle(i18next);
