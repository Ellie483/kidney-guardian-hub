// backend/models/patient.model.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: String, // fill "Patient N" if not present
    age_of_the_patient: Number,
    smoking_status: Number, // 1 yes, 0 no
    diabetes_mellitus_yesno: Number, // 1 yes
    hypertension_yesno: Number, // 1 yes
    physical_activity_level: String, // "low" | "moderate" | "high"
    family_history_of_chronic_kidney_disease: Number,
    body_mass_index_bmi: Number,
    duration_of_diabetes_mellitus_years: Number,
    duration_of_hypertension_years: Number,
    coronary_artery_disease_yesno: Number,
    serum_creatinine_mgdl: Number,
    estimated_glomerular_filtration_rate_egfr: Number,
    blood_urea_mgdl: Number,
    hemoglobin_level_gms: Number,
    sodium_level_meql: Number,
    potassium_level_meql: Number,
    serum_albumin_level: Number,
    cholesterol_level: Number,
    random_blood_glucose_level_mgdl: Number,
    cystatin_c_level: Number,
    albumin_in_urine: Number,
    urine_proteintocreatinine_ratio: Number,
    specific_gravity_of_urine: Number,
    red_blood_cells_in_urine: String,
    pus_cells_in_urine: String,
    bacteria_in_urine: String,
    blood_pressure_mmhg: Number,
    appetite_goodpoor: String,
    pedal_edema_yesno: Number,
    anemia_yesno: Number,
    target: String, // e.g. "no_disease" | "low_risk" ...
  },
  { collection: "Patients" }
);

module.exports = mongoose.model("Patient", patientSchema);
