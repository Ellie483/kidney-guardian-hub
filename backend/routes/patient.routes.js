// backend/routes/patient.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/patient.controller");

router.get("/", ctrl.listPatients);            // GET /patients?limit=6
router.post("/similar", ctrl.getSimilarPatients); // POST /patients/similar
router.get("/:id", ctrl.getPatientById);          // GET /patients/:id
router.post("/details", ctrl.getPatientsDetails); // POST /patients/details  (batch)
module.exports = router;
