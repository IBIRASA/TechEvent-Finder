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
export const getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
         e.*,
         u.username as creator_name,
         ST_X(e.location::geometry) as longitude,
         ST_Y(e.location::geometry) as latitude
       FROM events e
       JOIN users u ON e.creator_id = u.user_id
       WHERE e.event_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: req.t("event_not_found") });
    }

    // Get categories for this event
    const categories = await query(
      "SELECT c.category_id, c.name FROM event_categories ec JOIN categories c ON ec.category_id = c.category_id WHERE ec.event_id = $1",
      [id]
    );

    res.json({
      ...result.rows[0],
      categories: categories.rows,
    });
  } catch (error) {
    console.error("Event details error:", error);
    res.status(500).json({
      error: req.t("event_details_error"),
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
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

export const getUserEvents = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         e.*,
         ST_X(e.location::geometry) as longitude,
         ST_Y(e.location::geometry) as latitude
       FROM events e
       WHERE e.creator_id = $1
       ORDER BY e.start_time DESC`,
      [req.userId]
    );

    // Get categories for each event
    const eventsWithCategories = await Promise.all(
      result.rows.map(async (event) => {
        const categories = await query(
          `SELECT c.category_id, c.name 
           FROM event_categories ec
           JOIN categories c ON ec.category_id = c.category_id
           WHERE ec.event_id = $1`,
          [event.event_id]
        );
        return { ...event, categories: categories.rows };
      })
    );

    res.json(eventsWithCategories);
  } catch (error) {
    console.error("Get user events error:", error);
    res.status(500).json({
      error: req.t("user_events_error"),
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
export const findEventsNearby = async (
  longitude,
  latitude,
  radius,
  categories
) => {
  try {
    const events = await query(
      `SELECT * FROM events 
       WHERE ST_DWithin(
         location, 
         ST_GeographyFromText($1), 
         $2
       )`,
      [`POINT(${longitude} ${latitude})`, radius]
    );
    return events.rows;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error(req.t ? req.t("search_error") : "Search failed");
  }
};

// Make sure this is at the bottom of the file:
export default {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventDetails,
  getUserEvents,
  findEventsNearby, // Add this to your exports
};
