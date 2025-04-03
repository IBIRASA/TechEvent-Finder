import { query } from "../config/db.js";

export const createUser = async ({
  username,
  email,
  password_hash,
  latitude,
,longitude,}) => {
  const result = await query(
    "INSERT INTO users(username, email, password_hash,latitude,longitude) VALUES($1, $2, $3) RETURNING user_id",
    [username, email, password_hash, latitude, longitude]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

// Default export if preferred
export default {
  createUser,
  findUserByEmail,
};
