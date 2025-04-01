// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const userModel = require('../models/user.model');

// module.exports = {
//   register: async (req, res) => {
//     try {
//       const { username, email, password } = req.body;
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const user = await userModel.create({ username, email, password_hash: hashedPassword });
//       res.status(201).json({ userId: user.user_id });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   login: async (req, res) => {
//     try {
//       const { email, password } = req.body;
//       const user = await userModel.findByEmail(email);
//       if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//       }
//       const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.json({ token, userId: user.user_id });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };
// controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        "INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING user_id",
        [username, email, hashedPassword]
      );
      res.status(201).json({ userId: result.rows[0].user_id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token, userId: user.user_id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
