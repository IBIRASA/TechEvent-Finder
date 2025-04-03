// import eventModel from "../models/event.model.js";

// export const createEvent = async (req, res) => {
//   try {
//     const event = await eventModel.create({
//       ...req.body,
//       creator_id: req.userId,
//     });
//     res.status(201).json(event);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getNearbyEvents = async (req, res) => {
//   try {
//     const { longitude, latitude, radius = 10000 } = req.query;
//     const events = await eventModel.findNearby({ longitude, latitude, radius });
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// sh;
// export default {
//   createEvent,
//   getNearbyEvents,
// };


import { query } from "../config/db.js";
import { scheduleNotification } from "../services/notification.service.js";

// Helper function to save event categories
async function saveEventCategories(eventId, categories) {
  if (!categories || !categories.length) return;
  
  for (const categoryId of categories) {
    await query(
      "INSERT INTO event_categories(event_id, category_id) VALUES($1, $2)",
      [eventId, categoryId]
    );
  }
}


export const createEvent = async (req, res) => {
  const { title, description, longitude, latitude, address, start_time, categories } = req.body;
  
  try {
    const result = await query(
      `INSERT INTO events(title, description, location, address, start_time, creator_id)
       VALUES($1, $2, ST_Point($3, $4), $5, $6, $7)
       RETURNING event_id`,
      [title, description, longitude, latitude, address, start_time, req.userId]
    );
    
    // Save event categories
    await saveEventCategories(result.rows[0].event_id, categories);
    
    res.status(201).json({ eventId: result.rows[0].event_id });
  } catch (error) {
    res.status(500).json({ error: req.t('event_creation_error') });
  }
};