const User = require("../models/users.model");
const Patient = require("../models/patient.model");

// GET /admin/users
exports.listUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "any",           // 'any' | 'admin' | 'user'
      from,                   // ISO date string
      to,                     // ISO date string
      page = 1,
      limit = 10,             // default 10 per page
    } = req.query;

    // Always declare q before using it
    const q = {};

    // Search filter
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      q.$or = [{ name: re }, { email: re }];
    }

    // Role filter
    if (role === "admin") q.isAdmin = true;
    if (role === "user")  q.isAdmin = { $ne: true };

    // Date filter
    const dateField = "registeredAt"; // use createdAt if your schema has timestamps
    if (from || to) {
      q[dateField] = {};
      if (from) q[dateField].$gte = new Date(from);
      if (to)   q[dateField].$lte = new Date(to);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    const [results, total] = await Promise.all([
      User.find(q)
        .sort({ [dateField]: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      User.countDocuments(q),
    ]);

    res.json({ total, page: pageNum, limit: perPage, results });
  } catch (e) {
    console.error("listUsers error:", e);
    res.status(500).json({ error: "Failed to list users" });
  }
};

// GET /admin/users/stats
exports.userStats = async (_req, res) => {
  try {
    const [totalUsers, totalPatients] = await Promise.all([
      User.countDocuments({}),     // not "users"
      Patient.countDocuments({}),  // not "Patients"
    ]);
    res.json({ totalUsers, totalPatients });
  } catch (e) {
    console.error("getStats error:", e);
    res.status(500).json({ error: "Failed to compute stats" });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent admin from deleting themselves
    if (String(req.user?._id) === String(id)) {
      return res.status(400).json({ error: "Admins cannot delete themselves" });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "User not found" });

    res.json({ ok: true, deletedId: id });
  } catch (e) {
    console.error("deleteUser error:", e);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
