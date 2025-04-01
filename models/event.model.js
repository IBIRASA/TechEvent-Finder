import { query } from '../config/db.js';

export const create = async (eventData) => {
  const { 
    title, 
    description, 
    longitude, 
    latitude, 
    address, 
    start_time, 
    creator_id 
  } = eventData;
  
  const result = await query(
    `INSERT INTO events(title, description, location, address, start_time, creator_id)
     VALUES($1, $2, ST_GeographyFromText($3), $4, $5, $6) RETURNING event_id`,
    [title, description, `POINT(${longitude} ${latitude})`, address, start_time, creator_id]
  );
  
  return result.rows[0];
};

export const findNearby = async ({ longitude, latitude, radius }) => {
  const result = await query(
    `SELECT * FROM events 
     WHERE ST_DWithin(location, ST_GeographyFromText($1), $2)`,
    [`POINT(${longitude} ${latitude})`, radius]
  );
  
  return result.rows;
};

// Default export if you prefer
export default {
  create,
  findNearby
};