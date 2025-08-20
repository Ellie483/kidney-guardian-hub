// backend/controllers/search.controller.js
const Patient = require("../models/patient.model");

function boolChoice(v) {
  if (v === true || v === false) return v;
  return undefined;
}

exports.cohortSearch = async (req, res) => {
  try {
    const { filters = {}, sampleLimit = 9 } = req.body || {};

    const {
      gender,                // "male" | "female"
      age,                   // { min, max }
      smoking,               // true | false | undefined
      diabetes,              // true | false | undefined
      hypertension,          // true | false | undefined
      ckd,                   // true | false | undefined (egfr < 60)
      activity               // array of ["low","moderate","high"]
    } = filters;

    const where = {};

    // Gender (if your data has it)
    if (gender && gender !== "all") where.gender = gender;

    // Age range
    if (age?.min != null || age?.max != null) {
      where.age_of_the_patient = {};
      if (age.min != null) where.age_of_the_patient.$gte = Number(age.min);
      if (age.max != null) where.age_of_the_patient.$lte = Number(age.max);
    }

    // Boolean-ish flags stored as 1/0
    const smokingB = boolChoice(smoking);
    if (smokingB !== undefined) where.smoking_status = smokingB ? 1 : 0;

    const diabetesB = boolChoice(diabetes);
    if (diabetesB !== undefined) where.diabetes_mellitus_yesno = diabetesB ? 1 : 0;

    const hyperB = boolChoice(hypertension);
    if (hyperB !== undefined) where.hypertension_yesno = hyperB ? 1 : 0;

    // CKD by eGFR threshold
    const CKD_THRESHOLD = 60;
    if (ckd === true) {
      where.estimated_glomerular_filtration_rate_egfr = { $lt: CKD_THRESHOLD };
    } else if (ckd === false) {
      where.estimated_glomerular_filtration_rate_egfr = { $gte: CKD_THRESHOLD };
    }

    // Activity multiselect
    if (Array.isArray(activity) && activity.length > 0) {
      where.physical_activity_level = { $in: activity };
    }

    // total count
    const total = await Patient.countDocuments(where);

    // tiny summary
    const sampleForSummary = await Patient
      .find(where, {
        estimated_glomerular_filtration_rate_egfr: 1,
        body_mass_index_bmi: 1,
        smoking_status: 1,
        diabetes_mellitus_yesno: 1,
        hypertension_yesno: 1,
      })
      .limit(1000); // cap for perf

    const avg = (arr) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null);
    const median = (arr) => {
      if (!arr.length) return null;
      const s = [...arr].sort((a,b)=>a-b);
      const mid = Math.floor(s.length/2);
      return s.length%2 ? s[mid] : (s[mid-1]+s[mid])/2;
    };

    const egfrs = sampleForSummary
      .map(d => d.estimated_glomerular_filtration_rate_egfr)
      .filter(n => typeof n === "number");
    const bmis  = sampleForSummary
      .map(d => d.body_mass_index_bmi)
      .filter(n => typeof n === "number");
    const smokers = sampleForSummary.filter(d => d.smoking_status === 1).length;
    const diabet  = sampleForSummary.filter(d => d.diabetes_mellitus_yesno === 1).length;
    const hyper   = sampleForSummary.filter(d => d.hypertension_yesno === 1).length;
    const denom   = sampleForSummary.length || 1;

    const summary = {
      avgEgfr: egfrs.length ? Number(avg(egfrs).toFixed(1)) : null,
      medBmi:  bmis.length  ? Number(median(bmis).toFixed(1)) : null,
      pctSmokers: Math.round((smokers/denom)*100),
      pctDiabetes: Math.round((diabet/denom)*100),
      pctHyperten: Math.round((hyper/denom)*100),
    };

    // examples for cards
    const rows = await Patient.find(where)
      .limit(Math.max(1, Math.min(30, Number(sampleLimit) || 9)));

    const stageFromEgfr = (egfr) => {
      if (egfr == null) return "Unknown";
      if (egfr >= 90) return "Stage 1";
      if (egfr >= 60) return "Stage 2";
      if (egfr >= 45) return "Stage 3";
      if (egfr >= 30) return "Stage 4";
      return "Stage 5";
    };

    const examples = rows.map((d, i) => ({
      _id: d._id,
      name: `Patient ${i+1}`,
      age: d.age_of_the_patient ?? null,
      stage: stageFromEgfr(d.estimated_glomerular_filtration_rate_egfr),
      diagnosis: (d.estimated_glomerular_filtration_rate_egfr ?? 100) < CKD_THRESHOLD
        ? "CKD"
        : "No CKD",
      story: "Explore lifestyle and lab patterns similar to yours.",
      lifestyle: {
        diabetic: d.diabetes_mellitus_yesno === 1,
        smokes:   d.smoking_status === 1,
        highBP:   d.hypertension_yesno === 1,
      },
      riskFactors: [
        d.diabetes_mellitus_yesno === 1 ? "Diabetes" : null,
        d.hypertension_yesno === 1 ? "High Blood Pressure" : null,
        d.smoking_status === 1 ? "Smoking" : null
      ].filter(Boolean),
      improvements: ["Medication adherence","Regular monitoring"],
      vitals: {
        bmi: d.body_mass_index_bmi ?? null,
        egfr: d.estimated_glomerular_filtration_rate_egfr ?? null,
        hemoglobin: d.hemoglobin_level_gms ?? null
      },
      labFlags: [],             // fill if you want flags
      matchScore: undefined,    // not used in cohort search
    }));

    res.json({ total, summary, examples });
  } catch (err) {
    console.error("cohortSearch error:", err);
    res.status(500).json({ error: "cohort search failed" });
  }
};
