// // import bcrypt from "bcrypt";
// // import jwt from "jsonwebtoken";
// // import { query } from "../config/db.js";

// // export const register = async (req, res) => {
// //   try {
// //     const { username, email, password } = req.body;
// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const result = await query(
// //       "INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING user_id",
// //       [username, email, hashedPassword]
// //     );
// //     res.status(201).json({ userId: result.rows[0].user_id });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// // export const login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const result = await query("SELECT * FROM users WHERE email = $1", [email]);
// //     const user = result.rows[0];

// //     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
// //       return res.status(401).json({ error: "Invalid credentials" });
// //     }

// //     const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
// //       expiresIn: "1h",
// //     });
// //     res.json({ token, userId: user.user_id });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { query } from "../config/db.js";

// export const register = async (req, res) => {
//   const {
//     username,
//     email,
//     password,
//     language = "en",
//     latitude,
//     longitude,
//     categories,
//   } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await query(
//       `INSERT INTO users(username, email, password_hash, preferred_language, location)
//        VALUES($1, $2, $3, $4, ST_Point($5, $6))
//        RETURNING user_id`,
//       [username, email, hashedPassword, language, longitude, latitude]
//     );

//     // Save user categories
//     await saveUserCategories(result.rows[0].user_id, categories);

//     res.status(201).json({ userId: result.rows[0].user_id });
//   } catch (error) {
//     res.status(500).json({ error: req.t("register_error") });
//   }
// };
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

// Helper function to save user categories
async function saveUserCategories(userId, categories) {
  if (!categories || !categories.length) return;

  for (const categoryId of categories) {
    await query(
      "INSERT INTO user_categories(user_id, category_id) VALUES($1, $2)",
      [userId, categoryId]
    );
  }
}

export const register = async (req, res) => {
  const {
    username,
    email,
    password,
    language = "en",
    latitude,
    longitude,
    categories,
  } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userCheck = await query(
      "SELECT username, email FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      const errors = {};
      if (userCheck.rows.some((u) => u.username === username)) {
        errors.username = "Username already taken";
      }
      if (userCheck.rows.some((u) => u.email === email)) {
        errors.email = "Email already registered";
      }
      return res.status(409).json({ errors });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users(username, email, password_hash, preferred_language, location) 
       VALUES($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)) 
       RETURNING user_id`,
      [username, email, hashedPassword, language, longitude, latitude]
    );

    await saveUserCategories(result.rows[0].user_id, categories || []);

    res.status(201).json({ userId: result.rows[0].user_id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: req.t ? req.t("register_error") : "Registration failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res
        .status(401)
        .json({
          error: req.t ? req.t("invalid_credentials") : "Invalid credentials",
        });
    }

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      userId: user.user_id,
      preferredLanguage: user.preferred_language,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: req.t ? req.t("login_error") : "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
