
// backend/routes/lab.route.js
const express = require("express");
const router = express.Router();
const labController  = require("../controllers/lab.controller");

router.post("/", labController.predictPatientCondition);

// Cache management endpoints
router.get('/cache', labController.clearCache);
router.get('/cache-status', labController.getCacheStatus);

module.exports = router;
