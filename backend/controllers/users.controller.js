// backend/controllers/users.controller.js
const User = require("../models/users.model");

/* ---------- controllers ---------- */

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const newUser = req.body;

    // Required fields
    if (!newUser.email || !newUser.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // ⚠️ You usually don’t store confirmPassword. 
    // But since it's in your schema, we’ll allow it here.
    if (newUser.password !== newUser.confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: newUser.email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Save user
    const created = await User.create(newUser);
    console.log("✅ Saved user:", created);

    res.status(201).json({
      message: "User stored successfully",
      id: created._id,
      user: created,
    });
  } catch (err) {
    console.error("❌ Error inserting user:", err);
    res.status(500).json({ error: "Failed to store user" });
  }
};

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};