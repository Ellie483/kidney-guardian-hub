// backend/routes/search.routes.js
const router = require("express").Router();
const { cohortSearch } = require("../controllers/search.controller");

// POST /search/cohort
router.post("/cohort", cohortSearch);

module.exports = router;
