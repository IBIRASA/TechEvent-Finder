// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { query } from "../config/db.js";

// export const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await query(
//       "INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING user_id",
//       [username, email, hashedPassword]
//     );
//     res.status(201).json({ userId: result.rows[0].user_id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const result = await query("SELECT * FROM users WHERE email = $1", [email]);
//     const user = result.rows[0];

//     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     res.json({ token, userId: user.user_id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
