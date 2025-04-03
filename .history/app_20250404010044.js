require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const Backend = require("i18next-fs-backend");
const { Sequelize } = require("sequelize");
const path = require("path");

// Initialize Express app first
const app = express();

// Initialize i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, "locales/{{lng}}/translation.json"),
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    preload: ["en", "fr"],
    saveMissing: true,
    detection: {
      order: ["header", "cookie", "session", "querystring"],
      caches: ["cookie"],
      lookupCookie: "i18next",
      lookupSession: "i18next",
      lookupQuerystring: "lng",
      lookupHeader: "accept-language",
    },
  });

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// i18next middleware
const i18nMiddleware = i18nextMiddleware.handle(i18next);
app.use(i18nMiddleware);

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Routes
app.use("/api/language", require("./routes/language"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/events", require("./routes/events"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: req.t ? req.t("server_error") : "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: req.t ? req.t("not_found") : "Endpoint not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
