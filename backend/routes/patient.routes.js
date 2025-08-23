// backend/routes/patient.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/patient.controller");

router.get("/", ctrl.listPatients);            // GET /patients?limit=6
router.post("/similar", ctrl.getSimilarPatients); // POST /patients/similar

module.exports = router;
