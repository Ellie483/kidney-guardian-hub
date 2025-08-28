// backend/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const AdminUserController = require("../controllers/admin.user.controller");

// GET /admin/users?search=&role=&from=&to=&page=&limit=
router.get("/users", AdminUserController.listUsers);

// GET /admin/users/stats
router.get("/users/stats", AdminUserController.userStats);

// DELETE /admin/users/:id
router.delete("/users/:id", AdminUserController.deleteUser);

module.exports = router;
