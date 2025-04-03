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