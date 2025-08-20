// backend/controllers/patient.controller.js
const Patient = require("../models/patient.model");

/* ---------- helpers ---------- */

function egfrToStage(egfr) {
  if (egfr == null) return "Unknown";
  if (egfr >= 90) return "Stage 1";
  if (egfr >= 60) return "Stage 2";
  if (egfr >= 45) return "Stage 3";
  if (egfr >= 30) return "Stage 4";
  return "Stage 5";
}

function buildDiagnosis(doc) {
  if (doc.target && doc.target !== "no_disease") return doc.target.replace(/_/g, " ");
  return "No CKD";
}

function buildRiskFactors(doc) {
  const list = [];
  if (doc.diabetes_mellitus_yesno === 1) list.push("Diabetes");
  if (doc.hypertension_yesno === 1) list.push("High Blood Pressure");
  if (doc.smoking_status === 1) list.push("Smoking");
  if (doc.family_history_of_chronic_kidney_disease === 1) list.push("Family History");
  if (doc.physical_activity_level) list.push(`Activity: ${doc.physical_activity_level}`);
  return list;
}

function buildLabFlags(doc) {
  const flags = [];
  if (doc.serum_creatinine_mgdl != null && doc.serum_creatinine_mgdl > 1.3) flags.push("High Creatinine");
  if (doc.blood_urea_mgdl != null && doc.blood_urea_mgdl > 100) flags.push("High Urea");
  if (doc.potassium_level_meql != null && doc.potassium_level_meql > 5.0) flags.push("High Potassium");
  if (doc.hemoglobin_level_gms != null && doc.hemoglobin_level_gms < 11) flags.push("Anemia");
  if (doc.pedal_edema_yesno === 1) flags.push("Edema");
  return flags;
}

function mapToCard(doc, idx = 0, matchScore = 70) {
  return {
    _id: String(doc._id),
    name: doc.name || `Patient ${idx + 1}`,
    age: doc.age_of_the_patient ?? null,
    gender: undefined, // not in your dataset
    stage: egfrToStage(doc.estimated_glomerular_filtration_rate_egfr),
    diagnosis: buildDiagnosis(doc),
    story: "Explore lifestyle and lab patterns similar to yours.",
    lifestyle: {
      diabetic: doc.diabetes_mellitus_yesno === 1,
      smokes: doc.smoking_status === 1,
      highBP: doc.hypertension_yesno === 1,
    },
    riskFactors: buildRiskFactors(doc),
    improvements: ["Medication adherence", "Regular monitoring"],
    vitals: {
      bmi: doc.body_mass_index_bmi ?? null,
      egfr: doc.estimated_glomerular_filtration_rate_egfr ?? null,
      hemoglobin: doc.hemoglobin_level_gms ?? null,
    },
    labFlags: buildLabFlags(doc),
    matchScore,
  };
}

/* ---------- similarity ---------- */

const act = (txt) => {
  if (!txt) return 0.5;
  const t = String(txt).toLowerCase();
  if (t.includes("low")) return 0.0;
  if (t.includes("high")) return 1.0;
  return 0.5; // moderate/default
};

function scoreSimilarity(user, p) {
  const W = { age: 0.15, smoke: 0.15, dm: 0.20, htn: 0.15, bmi: 0.15, egfr: 0.15, activity: 0.05 };

  const ageDiff = Math.min(1, Math.abs((user.age - (p.age_of_the_patient ?? user.age)) / 40));
  const bmiDiff = Math.min(1, Math.abs((user.bmi - (p.body_mass_index_bmi ?? user.bmi)) / 15));
  const egfrDiff = Math.min(1, Math.abs((user.egfr - (p.estimated_glomerular_filtration_rate_egfr ?? user.egfr)) / 60));

  const smokeDiff = user.smokes === (p.smoking_status === 1) ? 0 : 1;
  const dmDiff    = user.diabetic === (p.diabetes_mellitus_yesno === 1) ? 0 : 1;
  const htnDiff   = user.hypertension === (p.hypertension_yesno === 1) ? 0 : 1;

  const activityDiff = Math.abs(act(user.activity) - act(p.physical_activity_level));

  const dist =
    W.age * ageDiff +
    W.smoke * smokeDiff +
    W.dm * dmDiff +
    W.htn * htnDiff +
    W.bmi * bmiDiff +
    W.egfr * egfrDiff +
    W.activity * activityDiff;

  return Math.round(Math.max(0, 100 * (1 - dist)));
}

/* ---------- controllers ---------- */

// GET /patients?limit=6
exports.getPatients = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 6));

    const projection = {
      name: 1,
      age_of_the_patient: 1,
      smoking_status: 1,
      diabetes_mellitus_yesno: 1,
      hypertension_yesno: 1,
      physical_activity_level: 1,
      family_history_of_chronic_kidney_disease: 1,
      body_mass_index_bmi: 1,
      estimated_glomerular_filtration_rate_egfr: 1,
      hemoglobin_level_gms: 1,
      blood_urea_mgdl: 1,
      potassium_level_meql: 1,
      serum_creatinine_mgdl: 1,
      pedal_edema_yesno: 1,
      target: 1,
    };

    const docs = await Patient.find({}, projection).limit(limit).lean();
    const cards = docs.map((d, i) => mapToCard(d, i));
    res.json(cards);
  } catch (err) {
    console.error("getPatients error:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

// POST /patients/similar
// body: { age, smokes, diabetic, hypertension, bmi, egfr, activity?, limit? }
exports.findSimilar = async (req, res) => {
  try {
    const {
      age,
      smokes,
      diabetic,
      hypertension,
      bmi,
      egfr,
      activity = "moderate",
      limit = 6,
    } = req.body || {};

    if (
      age == null || smokes == null || diabetic == null ||
      hypertension == null || bmi == null || egfr == null
    ) {
      return res.status(400).json({ error: "Missing required fields: age, smokes, diabetic, hypertension, bmi, egfr" });
    }

    // Coarse candidate filter for speed/quality (tune as you like)
    const query = {
      age_of_the_patient: { $gte: age - 20, $lte: age + 20 },
      body_mass_index_bmi: { $exists: true },
      estimated_glomerular_filtration_rate_egfr: { $exists: true },
    };

    const projection = {
      name: 1,
      age_of_the_patient: 1,
      smoking_status: 1,
      diabetes_mellitus_yesno: 1,
      hypertension_yesno: 1,
      physical_activity_level: 1,
      body_mass_index_bmi: 1,
      estimated_glomerular_filtration_rate_egfr: 1,
      hemoglobin_level_gms: 1,
      blood_urea_mgdl: 1,
      potassium_level_meql: 1,
      serum_creatinine_mgdl: 1,
      pedal_edema_yesno: 1,
      target: 1,
    };

    const candidates = await Patient.find(query, projection).limit(1000).lean();

    const user = { age, smokes, diabetic, hypertension, bmi, egfr, activity };
    const scored = candidates.map((p, i) => ({ p, sim: scoreSimilarity(user, p), idx: i }));
    scored.sort((a, b) => b.sim - a.sim);

    const top = scored
      .slice(0, Math.max(1, Math.min(50, Number(limit) || 6)))
      .map((s, i) => mapToCard(s.p, i, s.sim));

    res.json(top);
  } catch (err) {
    console.error("findSimilar error:", err);
    res.status(500).json({ error: "Failed to compute similar patients" });
  }
};
