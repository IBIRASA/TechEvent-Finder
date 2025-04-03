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

// export const createEvent = async (req, res) => {
//   const { title, description, longitude, latitude, address, start_time, categories } = req.body;

//   try {
//     const result = await query(
//       `INSERT INTO events(title, description, location, address, start_time, creator_id)
//        VALUES($1, $2, ST_Point($3, $4), $5, $6, $7)
//        RETURNING event_id`,
//       [title, description, longitude, latitude, address, start_time, req.userId]
//     );

//     // Save event categories
//     await saveEventCategories(result.rows[0].event_id, categories);

//     res.status(201).json({ eventId: result.rows[0].event_id });
//   } catch (error) {
//     res.status(500).json({ error: req.t('event_creation_error') });
//   }
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
  const {
    title,
    description,
    longitude,
    latitude,
    address,
    start_time,
    categories,
  } = req.body;

  try {
    // Validate required fields
    if (!title || !longitude || !latitude || !start_time) {
      return res.status(400).json({ error: req.t("missing_required_fields") });
    }

    const result = await query(
      `INSERT INTO events(title, description, location, address, start_time, creator_id)
       VALUES($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7)
       RETURNING event_id, start_time`,
      [title, description, longitude, latitude, address, start_time, req.userId]
    );

    await saveEventCategories(result.rows[0].event_id, categories || []);

    // Schedule notifications for users interested in these categories
    await scheduleEventNotifications(
      result.rows[0].event_id,
      result.rows[0].start_time
    );

    res.status(201).json({ eventId: result.rows[0].event_id });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(500).json({
      error: req.t("event_creation_error"),
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add these new controller methods
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    longitude,
    latitude,
    address,
    start_time,
    categories,
  } = req.body;

  try {
    await query("BEGIN");

    // Update event
    await query(
      `UPDATE events 
       SET title = $1, description = $2, location = ST_SetSRID(ST_MakePoint($3, $4), 
           address = $5, start_time = $6
       WHERE event_id = $7 AND creator_id = $8`,
      [
        title,
        description,
        longitude,
        latitude,
        address,
        start_time,
        id,
        req.userId,
      ]
    );

    // Update categories
    await query("DELETE FROM event_categories WHERE event_id = $1", [id]);
    await saveEventCategories(id, categories || []);

    await query("COMMIT");
    res.json({ success: true });
  } catch (error) {
    await query("ROLLBACK");
    res.status(500).json({ error: req.t("event_update_error") });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await query("DELETE FROM events WHERE event_id = $1 AND creator_id = $2", [
      req.params.id,
      req.userId,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: req.t("event_delete_error") });
  }
};
