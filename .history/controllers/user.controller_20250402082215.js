import { query } from "../config/db.js";

export const getUserPreferences = async (req, res) => {
  try {
    const user = await query(
      `SELECT 
         preferred_language, 
         ST_X(location::geometry) as longitude, 
         ST_Y(location::geometry) as latitude 
       FROM users WHERE user_id = $1`,
      [req.userId]
    );
    
    const categories = await query(
      "SELECT category_id FROM user_categories WHERE user_id = $1",
      [req.userId]
    );
    
    res.json({
      language: user.rows[0].preferred_language,
      location: {
        longitude: user.rows[0].longitude,
        latitude: user.rows[0].latitude
      },
      categories: categories.rows.map(c => c.category_id)
    });
  } catch (error) {
    res.status(500).json({ error: req.t('preferences_error') });
  }
};

export const updatePreferences = async (req, res) => {
  const { language, latitude, longitude, categories } = req.body;
  
  try {
    await query('BEGIN');
    
    // Update user preferences
    await query(
      `UPDATE users 
       SET preferred_language = $1, 
           location = ST_SetSRID(ST_MakePoint($2, $3), 4326)
       WHERE user_id = $4`,
      [language, longitude, latitude, req.userId]
    );
    
    // Update categories
    await query("DELETE FROM user_categories WHERE user_id = $1", [req.userId]);
    
    if (categories && categories.length) {
      for (const categoryId of categories) {
        await query(
          "INSERT INTO user_categories(user_id, category_id) VALUES($1, $2)",
          [req.userId, categoryId]
        );
      }
    }
    
    await query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    res.status(500).json({ error: req.t('preferences_update_error') });
  }
};