// import express from "express";
// import {
//   createEvent,
//   getNearbyEvents,
// } from "../controllers/event.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, createEvent);
// router.get("/nearby", getNearbyEvents);

// export default router;
// import express from "express";
// import {
//   createEvent,
//   findEventsNearby, // Import the new function
// } from "../controllers/event.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";

// const router = express.Router();

// // Create event (protected route)
// router.post("/", authMiddleware, createEvent);

// // Nearby events search (public route)
// router.get('/nearby', async (req, res) => {
//   const { longitude, latitude, radius = 5000, categories } = req.query;
  
//   try {
//     // Validate required parameters
//     if (!longitude || !latitude) {
//       return res.status(400).json({ error: 'Longitude and latitude are required' });
//     }

//     const events = await findEventsNearby(
//       parseFloat(longitude),
//       parseFloat(latitude),
//       parseInt(radius),
//       categories?.split(',')
//     );
    
//     res.json(events);
//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({ 
//       error: req.t ? req.t('search_error') : 'Search failed', 
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// export default router;