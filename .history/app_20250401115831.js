const express = require('express');
const cors = require('cors');
const i18nMiddleware = require('./config/i18n');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: req.t('server_error') });
});

module.exports = app;