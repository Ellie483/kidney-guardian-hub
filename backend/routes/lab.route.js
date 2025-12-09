
// backend/routes/lab.route.js
const express = require("express");
const router = express.Router();
const labController  = require("../controllers/lab.controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", labController.predictPatientCondition);
router.post("/trainmodel", labController.trainModel);

// Cache management endpoints
router.get('/cache', labController.clearCache);
router.get('/cache-status', labController.getCacheStatus);
router.get("/check-accuracy", labController.checkAccuracy);

module.exports = router;




