const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

// POST /api/users
router.post("/", usersController.createUser);

// GET /api/users
router.get("/", usersController.getUsers);

module.exports = router;
