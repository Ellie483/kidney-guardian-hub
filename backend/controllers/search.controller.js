// backend/controllers/search.controller.js
const Patient = require("../models/patient.model");


const cohortSearch = async (req, res) => {
  try {
    const { filters = {}, sampleLimit = 12 } = req.body || {};
    const q = {};

    // ---- filters ----
    // gender
    if (filters.gender && filters.gender !== "all") {
      q.gender = filters.gender;
    }

    // age (accepts either patient.age OR age_of_the_patient)
    if (filters.age && (filters.age.min != null || filters.age.max != null)) {
      const range = {};
      if (filters.age.min != null) range.$gte = Number(filters.age.min);
      if (filters.age.max != null) range.$lte = Number(filters.age.max);

      // query either field if your dataset uses both names
      q.$or = [
        { age: range },
        { age_of_the_patient: range },
      ];
    }

    // smoking / diabetes / hypertension as booleans
    if (typeof filters.smoking === "boolean") {
      q.smoking_status = filters.smoking;
    }
    if (typeof filters.diabetes === "boolean") {
      q.diabetes_mellitus_yesno = filters.diabetes;
    }
    if (typeof filters.hypertension === "boolean") {
      q.hypertension_yesno = filters.hypertension;
    }

    // CKD Stage filtering based on the 'target' attribute
    if (filters.ckd && filters.ckd !== "any") {
      q.target = filters.ckd; // Filtering based on 'target' attribute (e.g., no_disease, low, moderate, high)
    }

    // physical activity (low/moderate/high)
    if (Array.isArray(filters.activity) && filters.activity.length && filters.activity.length < 3) {
      q.physical_activity_level = { $in: filters.activity };
    }

    // ---- counts ----
    const total = await Patient.countDocuments(q);

    // ---- sample (examples) ----
    const docs = await Patient.find(q)
      .limit(Number(sampleLimit) || 12)
      .lean();

    const examples = docs.map((p, i) => ({
      _id: String(p._id),
      name: p.name || `Patient ${i + 1}`,
      age: p.age ?? p.age_of_the_patient ?? null,
      stage: p.stage || p.target, // Use 'target' as the stage
      lifestyle: {
        diabetic: !!p.diabetes_mellitus_yesno,
        highBP: !!p.hypertension_yesno,
        smokes: !!p.smoking_status,
        activityLevel: p.physical_activity_level ?? null,
      },
      vitals: {
        bmi: p.body_mass_index_bmi ?? null,
        egfr: p.estimated_glomerular_filtration_rate_egfr ?? null,
        hemoglobin: p.hemoglobin_level_gms ?? null,
      },

      // 🔴 critical: send the entire document so the modal can show all 31 attributes
      raw: p,
    }));

    // ---- summary KPIs via aggregation (avg/percents) ----
    let summary = {
      avgEgfr: null,
      medBmi: null,          // using avg as a stand‑in; real median needs a different pipeline
      pctSmokers: null,
      pctDiabetes: null,
      pctHyperten: null,
    };

    try {
      const agg = await Patient.aggregate([
        { $match: q },
        {
          $group: {
            _id: null,
            avgEgfr: { $avg: "$estimated_glomerular_filtration_rate_egfr" },
            // NOTE: median is trickier; we keep average BMI to keep it simple
            medBmi: { $avg: "$body_mass_index_bmi" },
            smokers: {
              $avg: { $cond: [{ $eq: ["$smoking_status", true] }, 1, 0] },
            },
            diabetes: {
              $avg: { $cond: [{ $eq: ["$diabetes_mellitus_yesno", true] }, 1, 0] },
            },
            hyperten: {
              $avg: { $cond: [{ $eq: ["$hypertension_yesno", true] }, 1, 0] },
            },
          },
        },
      ]);

      if (agg[0]) {
        summary = {
          avgEgfr: agg[0].avgEgfr != null ? Number(agg[0].avgEgfr.toFixed(1)) : null,
          medBmi: agg[0].medBmi != null ? Number(agg[0].medBmi.toFixed(1)) : null,
          pctSmokers: Math.round((agg[0].smokers ?? 0) * 100),
          pctDiabetes: Math.round((agg[0].diabetes ?? 0) * 100),
          pctHyperten: Math.round((agg[0].hyperten ?? 0) * 100),
        };
      }
    } catch (e) {
      // don’t fail the route over KPI calculation; keep defaults
      console.warn("cohortSearch summary aggregation failed:", e.message);
    }

    return res.json({ total, summary, examples });
  } catch (err) {
    console.error("cohortSearch error:", err);
    return res.status(500).json({ error: "Server error in cohortSearch" });
  }
};


// ⬇️ Export once, after the function (fixes the “Unexpected end of input”)
module.exports = { cohortSearch };
