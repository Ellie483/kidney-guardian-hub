// backend/routes/users.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/users.controller");

// signup, login, me, list
router.post("/", ctrl.createUser);
router.post("/login", ctrl.login);
router.get("/me", ctrl.me);
router.get("/", ctrl.getUsers);
router.put("/:id", ctrl.updateUser);


module.exports = router;
