// backend/routes/patient.routes.js
const express = require("express");
const router = express.Router();
const patientCtrl = require("../controllers/patient.controller");

// list (for sanity checks)
router.get("/", patientCtrl.getPatients);

// similarity (actual feature)
router.post("/similar", patientCtrl.findSimilar);

module.exports = router;
