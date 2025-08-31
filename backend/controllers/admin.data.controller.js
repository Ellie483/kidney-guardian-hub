// controllers/admin.data.controller.js
const Patient = require("../models/patient.model");

// POST /admin/data/patients/import-json
// Body: [ { ...patientFields }, ... ]
exports.importPatientsJson = async (req, res) => {
  try {
    let rows = req.body;

    // support {records:[...]} or [...] shapes
    if (!Array.isArray(rows) && Array.isArray(req.body?.records)) {
      rows = req.body.records;
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Body must be a non-empty JSON array of patients." });
    }

    // Optional: minimal validation to catch obvious mistakes
    const allowedKeys = new Set([
      "age_of_the_patient",
      "smoking_status",
      "diabetes_mellitus_yesno",
      "hypertension_yesno",
      "physical_activity_level",
      "family_history_of_chronic_kidney_disease",
      "body_mass_index_bmi",
      "duration_of_diabetes_mellitus_years",
      "duration_of_hypertension_years",
      "coronary_artery_disease_yesno",
      "serum_creatinine_mgdl",
      "estimated_glomerular_filtration_rate_egfr",
      "blood_urea_mgdl",
      "sodium_level_meql",
      "potassium_level_meql",
      "random_blood_glucose_level_mgdl",
      "albumin_in_urine",
      "appetite_goodpoor",
      "anemia_yesno",
      "target"
    ]);

    const invalid = [];
    rows.forEach((r, i) => {
      if (typeof r !== "object" || r === null) invalid.push({ index: i, reason: "row is not an object" });
      // (Add deeper checks if you want)
    });
    if (invalid.length) {
      return res.status(400).json({ error: "Some rows are invalid objects", invalid: invalid.slice(0, 20) });
    }

    // Always insert: Mongo will auto-create _id for each row
    const result = await Patient.insertMany(rows, { ordered: false });

    res.json({
      mode: "insert-only",
      received: rows.length,
      insertedCount: result.length
    });
  } catch (e) {
    // When ordered:false, Mongo may throw BulkWriteError; still include partials
    console.error("importPatientsJson error:", e);
    return res.status(500).json({ error: "Import failed", detail: String(e.message || e) });
  }
};
