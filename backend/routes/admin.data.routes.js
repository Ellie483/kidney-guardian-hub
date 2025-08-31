// routes/admin.data.routes.js
const express = require("express");
const router = express.Router();
const AdminData = require("../controllers/admin.data.controller");

// JSON-only import (no file upload)
router.post("/data/patients/import-json", AdminData.importPatientsJson);

module.exports = router;
