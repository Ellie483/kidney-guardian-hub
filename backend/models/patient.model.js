// backend/models/patient.model.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: String, // fill "Patient N" if not present

    // Selected attributes
    age_of_the_patient: Number,
    smoking_status: Number, // 1 yes, 0 no
    diabetes_mellitus_yesno: Number, // 1 yes, 0 no
    hypertension_yesno: Number, // 1 yes, 0 no
    physical_activity_level: String, // "low" | "moderate" | "high"
    family_history_of_chronic_kidney_disease: Number, // 1 yes, 0 no
    body_mass_index_bmi: Number,
    duration_of_diabetes_mellitus_years: Number,
    duration_of_hypertension_years: Number,
    coronary_artery_disease_yesno: Number, // 1 yes, 0 no
    serum_creatinine_mgdl: Number,
    estimated_glomerular_filtration_rate_egfr: Number,
    blood_urea_mgdl: Number,
    sodium_level_meql: Number,
    potassium_level_meql: Number,
    random_blood_glucose_level_mgdl: Number,
    albumin_in_urine: Number, // 0 = none, 1 = trace, 2 = moderate, 3 = high
    appetite_goodpoor: String, // "good" | "poor"
    anemia_yesno: Number, // 1 yes, 0 no

    // Target label
    target: String, // "no_disease" | "low_risk" | "moderate" | "high_risk" | "severe_disease"
  },
  { collection: "Patients" }
);

module.exports = mongoose.model("Patient", patientSchema);
