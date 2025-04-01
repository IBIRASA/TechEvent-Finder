const db = require('../config/db');

module.exports = {
  create: async (eventData) => {
    const { title, description, longitude, latitude, address, start_time, creator_id } = eventData;
    const result = await db.query(
      `INSERT INTO events(title, description, location, address, start_time, creator_id)
       VALUES($1, $2, ST_GeographyFromText($3), $4, $5, $6) RETURNING event_id`,
      [title, description, `POINT(${longitude} ${latitude})`, address, start_time, creator_id]
    );
    return result.rows[0];
  },

  findNearby: async ({ longitude, latitude, radius }) => {
    const result = await db.query(
      `SELECT * FROM events 
       WHERE ST_DWithin(location, ST_GeographyFromText($1), $2)`,
      [`POINT(${longitude} ${latitude})`, radius]
    );
    return result.rows;
  }
};