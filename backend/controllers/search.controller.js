// backend/controllers/search.controller.js
const Patient = require("../models/patient.model");

// POST /search/cohort
async function cohortSearch(req, res) {
  try {
    const { filters = {}, sampleLimit = 9 } = req.body || {};
    const where = {};

    // gender
    if (filters.gender && typeof filters.gender === "string" && filters.gender !== "all") {
      where.gender = filters.gender.toLowerCase();
    }

    // age range
    if (filters.age && (filters.age.min != null || filters.age.max != null)) {
      where.age_of_the_patient = {};
      if (filters.age.min != null) where.age_of_the_patient.$gte = Number(filters.age.min);
      if (filters.age.max != null) where.age_of_the_patient.$lte = Number(filters.age.max);
    }

    // booleans -> dataset fields
    if (typeof filters.smoking === "boolean") {
      where.smoking_status = filters.smoking ? 1 : 0;
    }
    if (typeof filters.diabetes === "boolean") {
      where.diabetes_mellitus_yesno = filters.diabetes ? 1 : 0;
    }
    if (typeof filters.hypertension === "boolean") {
      where.hypertension_yesno = filters.hypertension ? 1 : 0;
    }
    if (typeof filters.ckd === "boolean") {
      // ckd yes: eGFR < 60, no: eGFR >= 60
      where.estimated_glomerular_filtration_rate_egfr = filters.ckd ? { $lt: 60 } : { $gte: 60 };
    }

    // activity (array of strings)
    if (Array.isArray(filters.activity) && filters.activity.length > 0) {
      where.physical_activity_level = { $in: filters.activity.map(s => s.toLowerCase()) };
    }

    // total count
    const total = await Patient.countDocuments(where);

    // KPIs (quick & simple)
    const docsForKpi = await Patient.find(where, {
      estimated_glomerular_filtration_rate_egfr: 1,
      body_mass_index_bmi: 1,
      smoking_status: 1,
      diabetes_mellitus_yesno: 1,
      hypertension_yesno: 1
    }).limit(2000).lean();

    const egfrVals = docsForKpi.map(d => Number(d.estimated_glomerular_filtration_rate_egfr)).filter(n => !Number.isNaN(n));
    const bmiVals  = docsForKpi.map(d => Number(d.body_mass_index_bmi)).filter(n => !Number.isNaN(n));
    const avg = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
    const median = (arr) => {
      if (!arr.length) return null;
      const s = [...arr].sort((a,b)=>a-b);
      const m = Math.floor(s.length/2);
      return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
    };
    const pct = (count, total) => total ? Math.round((count/total)*100) : null;

    const summary = {
      avgEgfr: egfrVals.length ? Number(avg(egfrVals).toFixed(1)) : null,
      medBmi:  bmiVals.length  ? Number(median(bmiVals).toFixed(1)) : null,
      pctSmokers: pct(docsForKpi.filter(d => d.smoking_status === 1).length, docsForKpi.length),
      pctDiabetes: pct(docsForKpi.filter(d => d.diabetes_mellitus_yesno === 1).length, docsForKpi.length),
      pctHyperten: pct(docsForKpi.filter(d => d.hypertension_yesno === 1).length, docsForKpi.length),
    };

    // sample examples for cards
    const sampleSize = Math.max(0, Math.min(30, Number(sampleLimit) || 9));
    const examplesRaw = sampleSize
      ? await Patient.aggregate([{ $match: where }, { $sample: { size: sampleSize } }])
      : [];
    const examples = examplesRaw.map((d, i) => {
      const egfr = Number(d.estimated_glomerular_filtration_rate_egfr);
      const stage =
        Number.isFinite(egfr)
          ? egfr >= 90 ? "Stage 1" :
            egfr >= 60 ? "Stage 2" :
            egfr >= 45 ? "Stage 3" :
            egfr >= 30 ? "Stage 4" : "Stage 5"
          : "Unknown";
      return {
        _id: d._id?.toString?.() || d._id,
        name: `Patient ${i + 1}`,
        age: Number(d.age_of_the_patient) || null,
        gender: d.gender || undefined,
        stage,
        lifestyle: {
          diabetic: d.diabetes_mellitus_yesno === 1,
          smokes: d.smoking_status === 1,
          highBP: d.hypertension_yesno === 1,
        },
        vitals: {
          bmi: Number(d.body_mass_index_bmi) || null,
          egfr: Number.isFinite(egfr) ? egfr : null,
          hemoglobin: Number(d.hemoglobin_level_gms) || null,
        },
      };
    });

    res.json({ total, summary, examples });
  } catch (err) {
    console.error("cohortSearch error:", err);
    res.status(500).json({ error: "cohort search failed" });
  }
}

module.exports = { cohortSearch };
