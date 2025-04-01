const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware, eventController.createEvent);
router.get('/nearby', eventController.getNearbyEvents);

module.exports = router;