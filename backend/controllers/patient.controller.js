// backend/controllers/patient.controller.js
const crypto = require("crypto");
const Patient = require("../models/patient.model");     // patient docs collection
const User = require("../models/users.model");          // your users collection
const SimilarCache = require("../models/similarCache.model"); // optional cache
const { gowerSim, val } = require("../utils/gower");

// ----------------------- feature config -----------------------
const FEATURE_VERSION = "gower.v1";
// keys use dot-paths that `val(obj, path)` can resolve
const FEATURES_TEMPLATE = [
  { type: "num", key: "age",         min: 18, max: 90,  w: 0.8 },
  { type: "num", key: "vitals.bmi",  min: 12, max: 60,  w: 0.7 },
  { type: "num", key: "vitals.egfr", min: 5,  max: 130, w: 1.0 },
  { type: "bin", key: "lifestyle.diabetic", w: 1.8 },
  { type: "bin", key: "lifestyle.highBP",   w: 1.2 },
  { type: "bin", key: "lifestyle.smokes",   w: 1.2 },
  { type: "cat", key: "gender",             w: 0.4 },
];

// ----------------------- helpers -----------------------
const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v == null) return undefined;
  if (typeof v === "number") return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (["1","true","t","yes","y"].includes(s)) return true;
  if (["0","false","f","no","n"].includes(s)) return false;
  return undefined;
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function stageFromEgfr(egfr) {
  if (!Number.isFinite(egfr)) return "Unknown";
  if (egfr >= 90) return "Stage 1";
  if (egfr >= 60) return "Stage 2";
  if (egfr >= 45) return "Stage 3a";
  if (egfr >= 30) return "Stage 3b";
  if (egfr >= 15) return "Stage 4";
  return "Stage 5";
}

/**
 * Normalize a patient document into unified fields used by UI + Gower.
 * Works for:
 *  - already-normalized doc (with vitals/lifestyle)
 *  - raw dataset fields (body_mass_index_bmi, ..._egfr, ..._gms, diabetes_mellitus_yesno, etc.)
 */
function normalizePatientDoc(p, index = 0) {
  const age =
    toNum(p.age) ??
    toNum(p.age_of_the_patient);

  const gender = (p.gender || p.sex || "").toString().toLowerCase() || null;

  const bmi =
    toNum(p?.vitals?.bmi) ??
    toNum(p.body_mass_index_bmi);

  const egfr =
    toNum(p?.vitals?.egfr) ??
    toNum(p.estimated_glomerular_filtration_rate_egfr);

  const hemoglobin =
    toNum(p?.vitals?.hemoglobin) ??
    toNum(p.hemoglobin_level_gms);

  const diabetic =
    toBool(p?.lifestyle?.diabetic) ??
    toBool(p.diabetes_mellitus_yesno);

  const highBP =
    toBool(p?.lifestyle?.highBP) ??
    toBool(p.hypertension_yesno);

  const smokes =
    toBool(p?.lifestyle?.smokes) ??
    toBool(p.smoking_status);

  const vitals = {
    bmi: Number.isFinite(bmi) ? bmi : null,
    egfr: Number.isFinite(egfr) ? egfr : null,
    hemoglobin: Number.isFinite(hemoglobin) ? hemoglobin : null,
  };

  const lifestyle = {
    diabetic: typeof diabetic === "boolean" ? diabetic : null,
    highBP: typeof highBP === "boolean" ? highBP : null,
    smokes: typeof smokes === "boolean" ? smokes : null,
  };

  const stage = p.stage || stageFromEgfr(vitals.egfr);

  const riskFactors = [
    lifestyle.diabetic ? "Diabetes" : null,
    lifestyle.highBP ? "High Blood Pressure" : null,
    lifestyle.smokes ? "Smoking" : null,
  ].filter(Boolean);

  return {
    _id: String(p._id || index),
    name: p.name || p.fullName || `Patient`,
    age: Number.isFinite(age) ? age : null,
    gender,
    stage,
    diagnosis: p.diagnosis || p.target || "—",
    story: p.story || "Explore lifestyle and lab patterns similar to yours.",
    lifestyle,
    vitals,
    riskFactors,
    improvements: Array.isArray(p.improvements) ? p.improvements : [],
    labFlags: Array.isArray(p.labFlags) ? p.labFlags : [],
    // raw for scoring (retain original fields too)
    __raw: p,
  };
}

// optional: hard rules based on the signup user
function buildHardFilterFromUser(u) {
  const filt = {};
  // prefer non-CKD when user likely has no CKD
  if (!u?.vitals?.egfr || u.vitals.egfr >= 60) {
    // don't hard filter eGFR here; leave it soft. But you can uncomment:
    // filt["vitals.egfr"] = { $gte: 30 }; // example soft-ish hard filter
  }
  if (u?.smoke === "No") filt["lifestyle.smokes"] = { $in: [false, null] };

  const hasDiab = (u?.medicalConditions || []).includes("Diabetes");
  if (!hasDiab) filt["lifestyle.diabetic"] = { $in: [false, null] };

  const hasHTN = (u?.medicalConditions || []).includes("Hypertension");
  if (!hasHTN) filt["lifestyle.highBP"] = { $in: [false, null] };

  return filt;
}

function makeSignature(payload) {
  const str = JSON.stringify(payload);
  return `${FEATURE_VERSION}:${crypto
    .createHash("sha1")
    .update(str)
    .digest("hex")}`;
}

// Keep only the 31 UI fields the modal needs (names match your frontend)
// Keep only the 31 UI fields the modal needs (names match your frontend)
function pack31(p) {
  // IMPORTANT: prefer the original mongo doc if present
  const src = p?.__raw ? p.__raw : p;

  return {
    age_of_the_patient: src.age_of_the_patient ?? src.age ?? p.age ?? null,
    smoking_status: src.smoking_status ?? p?.lifestyle?.smokes ?? null,
    diabetes_mellitus_yesno: src.diabetes_mellitus_yesno ?? p?.lifestyle?.diabetic ?? null,
    hypertension_yesno: src.hypertension_yesno ?? p?.lifestyle?.highBP ?? null,
    physical_activity_level: src.physical_activity_level ?? p?.lifestyle?.activityLevel ?? null,
    family_history_of_chronic_kidney_disease: src.family_history_of_chronic_kidney_disease,
    body_mass_index_bmi: src.body_mass_index_bmi ?? p?.vitals?.bmi ?? null,
    duration_of_diabetes_mellitus_years: src.duration_of_diabetes_mellitus_years,
    duration_of_hypertension_years: src.duration_of_hypertension_years,
    coronary_artery_disease_yesno: src.coronary_artery_disease_yesno,
    serum_creatinine_mgdl: src.serum_creatinine_mgdl,
    estimated_glomerular_filtration_rate_egfr:
      src.estimated_glomerular_filtration_rate_egfr ?? p?.vitals?.egfr ?? null,
    blood_urea_mgdl: src.blood_urea_mgdl,
    hemoglobin_level_gms: src.hemoglobin_level_gms ?? p?.vitals?.hemoglobin ?? null,
    sodium_level_meql: src.sodium_level_meql,
    potassium_level_meql: src.potassium_level_meql,
    serum_albumin_level: src.serum_albumin_level,
    cholesterol_level: src.cholesterol_level,
    random_blood_glucose_level_mgdl: src.random_blood_glucose_level_mgdl,
    cystatin_c_level: src.cystatin_c_level,
    albumin_in_urine: src.albumin_in_urine,
    urine_proteintocreatinine_ratio: src.urine_proteintocreatinine_ratio,
    specific_gravity_of_urine: src.specific_gravity_of_urine,
    red_blood_cells_in_urine: src.red_blood_cells_in_urine,
    pus_cells_in_urine: src.pus_cells_in_urine,
    bacteria_in_urine: src.bacteria_in_urine,
    blood_pressure_mmhg: src.blood_pressure_mmhg,
    appetite_goodpoor: src.appetite_goodpoor,
    pedal_edema_yesno: src.pedal_edema_yesno,
    anemia_yesno: src.anemia_yesno,
    target: src.target ?? p.diagnosis,
  };
}


// ----------------------- controllers -----------------------
// GET /patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Patient.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ patient: doc });
  } catch (e) {
    res.status(500).json({ error: "Failed to get patient" });
  }
};

// POST /patients/details  { ids: [...] }  (optional batch)
exports.getPatientsDetails = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.json({ results: [] });
    const docs = await Patient.find({ _id: { $in: ids } }).lean();
    res.json({ results: docs });
  } catch (e) {
    res.status(500).json({ error: "Failed to get details" });
  }
};

// GET /patients  (debug: list a few raw docs)
exports.listPatients = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
    const docs = await Patient.find({}, null, { limit }).lean();
    res.json(docs);
  } catch (e) {
    console.error("listPatients error:", e);
    res.status(500).json({ error: "Failed to list patients" });
  }
};

// POST /patients/similar
// body: { userId?: string, profile?: object, limit?: number }
exports.getSimilarPatients = async (req, res) => {
  try {
    const { userId, profile, limit = 12 } = req.body || {};

    // 1) resolve a user profile
    let user = profile;
    if (!user && userId) {
      user = await User.findById(userId).lean();
      if (!user) return res.status(404).json({ error: "User not found" });
    }
    if (!user) return res.status(400).json({ error: "userId or profile required" });

    // normalize a "user-like" object into same shape as patient for Gower
    const normUser = {
      age: toNum(user.age) ?? null,
      gender: (user.gender || "").toString().toLowerCase() || null,
      lifestyle: {
        diabetic: (user.medicalConditions || []).includes("Diabetes"),
        highBP: (user.medicalConditions || []).includes("Hypertension"),
        smokes: user.smoke === "Yes",
      },
      vitals: {
        egfr: toNum(user?.vitals?.egfr) ?? null,
        bmi:  toNum(user?.vitals?.bmi)  ?? null,
      },
      medicalConditions: user.medicalConditions || [],
      smoke: user.smoke,
    };

    // 2) candidate pool
    const hard = buildHardFilterFromUser(normUser);
    let candidates = await Patient.find(hard).lean();
    if (!candidates.length) {
      // fall back to entire pool if hard filter was too strict
      candidates = await Patient.find().lean();
    }
    if (!candidates.length) {
      return res.json({ results: [], signature: "empty:candidates" });
    }

    // 3) normalize candidates (so all scoring uses same fields)
    const normalized = candidates.map(normalizePatientDoc);

    // 4) compute numeric feature ranges from candidates for fair scaling
    const features = FEATURES_TEMPLATE.map(f => ({ ...f }));
    for (const f of features) {
      if (f.type !== "num") continue;
      let mn = Infinity, mx = -Infinity;
      for (const p of normalized) {
        const v = val(p, f.key);
        if (v == null) continue;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      if (Number.isFinite(mn) && Number.isFinite(mx) && mx > mn) {
        f.min = mn; f.max = mx;
      }
    }

    // 5) score with Gower + optional soft penalties
    const scored = normalized.map((p) => {
      let s = gowerSim(normUser, p, features); // 0..1

      // Example soft penalty: push down CKD mismatch
      const userNoCKD = !normUser?.vitals?.egfr || normUser?.vitals?.egfr >= 60;
      const patCKD = Number.isFinite(p?.vitals?.egfr) && p.vitals.egfr < 60;
      if (userNoCKD && patCKD) s -= 0.25;

      s = Math.max(0, Math.min(1, s));
      return { p, score: Math.round(s * 100) };
    });

    // 6) deterministic sort & top N
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.p._id).localeCompare(String(b.p._id));
    });

    const top = scored.slice(0, Math.min(12, Math.max(1, Number(limit) || 12)));

    // 7) cards for frontend (fully populated)
    const cards = top.map(({ p, score }) => ({
      _id: p._id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      stage: p.stage,
      diagnosis: p.diagnosis,
      story: p.story,
      lifestyle: p.lifestyle,
      riskFactors: p.riskFactors,
      improvements: p.improvements,
      vitals: p.vitals,
      labFlags: p.labFlags,
      matchScore: score,
      raw: pack31(p),          
    }));
    

    // quick debug — you should see real numbers now
    console.log("Similar top3 preview:",
      cards.slice(0, 3).map(c => ({
        _id: c._id,
        bmi: c?.vitals?.bmi,
        egfr: c?.vitals?.egfr,
        hgb: c?.vitals?.hemoglobin,
        score: c.matchScore
      }))
    );

    // 8) cache by signature (optional)
    const sigPayload = {
      normUser,
      features: features.map(f => ({ key: f.key, w: f.w, type: f.type, min: f.min, max: f.max })),
      limit: Number(limit) || 12,
    };
    const signature = makeSignature(sigPayload);

    if (SimilarCache && SimilarCache.findOneAndUpdate) {
      await SimilarCache.findOneAndUpdate(
        { userId: String(userId || "profile"), signature },
        {
          $set: {
            userId: String(userId || "profile"),
            signature,
            results: top.map(({ p, score }) => ({ patientId: String(p._id), score })),
            cards,
          },
        },
        { upsert: true }
      );
    }

    res.json({ results: cards, signature });
  } catch (e) {
    console.error("getSimilarPatients error:", e);
    res.status(500).json({ error: "Failed to compute similar patients" });
  }
};
