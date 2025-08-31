// backend/routes/analysis.routes.js
const express = require("express");
const router = express.Router();
const {
  getAgeGroupDistribution,
  getDiabetesRelatedCKD,
  getHypertensionCKDStats,
  getCKDSummary,
  getLifestyleRiskFactors,
  getCkdFactorPrevalence,
  getAllCKDRiskFactors,
  getSevereCKDPercentage,
    getCkdRiskCombinations,
    getAppetiteAgeTarget


} = require("../controllers/analysis.controller");
const {
  getCustomPivot
} = require("../controllers/cube.controller");
const { runInContext } = require("vm");
const { get } = require("http");

router.get("/age-distribution", getAgeGroupDistribution);
router.get("/ckd-related-to-diabetes", getDiabetesRelatedCKD);
router.get("/ckd-related-to-hypertension", getHypertensionCKDStats);
router.get("/summary", getCKDSummary);
router.get("/lifestyle-risk-factors", getLifestyleRiskFactors);
router.get("/ckd-prevalence-by-factor", getCkdFactorPrevalence);
router.get("/highest-factor", getAllCKDRiskFactors);
router.get("/severe-ckd-percentage",   getSevereCKDPercentage);
router.get("/ckd-risk-combinations",   getCkdRiskCombinations);
router.get("/appetite-age-target", getAppetiteAgeTarget);
router.get("/cube",getCustomPivot);






module.exports = router;


