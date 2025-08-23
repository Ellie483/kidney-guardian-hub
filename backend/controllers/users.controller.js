// backend/controllers/users.controller.js
const User = require("../models/users.model");

// minimal sanitizer
function safeUser(u) {
  const obj = u.toObject ? u.toObject() : u;
  delete obj.password;
  delete obj.confirmPassword;
  return obj;
}

// POST /api/users   (signup)
exports.createUser = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.email || !body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (body.password !== body.confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const exists = await User.findOne({ email: body.email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const created = await User.create(body);

    // set a simple cookie (httpOnly so JS can’t read it; frontend can still keep localStorage if you prefer)
    res
      .cookie("uid", created._id.toString(), {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true when you have https
        maxAge: 30 * 24 * 3600 * 1000,
      })
      .status(201)
      .json({
        message: "User stored successfully",
        id: created._id,
        user: safeUser(created),
      });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ error: "Failed to store user" });
  }
};

// POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res
      .cookie("uid", user._id.toString(), {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 24 * 3600 * 1000,
      })
      .json({ ok: true, id: user._id, user: safeUser(user) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// GET /api/users/me
exports.me = async (req, res) => {
  try {
    const uid = req.cookies?.uid || req.query.userId || req.headers["x-user-id"];
    if (!uid) return res.status(401).json({ error: "Not signed in" });
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(safeUser(user));
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Failed to resolve user" });
  }
};

// GET /api/users
exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users.map(safeUser));
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
