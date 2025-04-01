const db = require('../config/db');

module.exports = {
  create: async ({ username, email, password_hash }) => {
    const result = await db.query(
      'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING user_id',
      [username, email, password_hash]
    );
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
};