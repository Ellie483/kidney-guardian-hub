// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI; // put your full Atlas connection string in .env
const client = new MongoClient(uri);
let patientsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("Kidney"); // ✅ change this to your actual DB name in Atlas
    patientsCollection = db.collection("Patients"); // ✅ change to your collection name
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// Root
app.get("/", (req, res) => {
  res.send("Kidney API is running 🚀");
});

// Patients route (fetch from MongoDB)
// Patients route (fetch from MongoDB and map to UI shape)
app.get("/api/patients", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 6));

    // Pull only the fields we need
    const projection = {
      age_of_the_patient: 1,
      smoking_status: 1,
      diabetes_mellitus_yesno: 1,
      hypertension_yesno: 1,
      physical_activity_level: 1,
      family_history_of_chronic_kidney_disease: 1,
      body_mass_index_bmi: 1,
      serum_creatinine_mgdl: 1,
      estimated_glomerular_filtration_rate_egfr: 1,
      blood_urea_mgdl: 1,
      hemoglobin_level_gms: 1,
      potassium_level_meql: 1,
      sodium_level_meql: 1,
      cholesterol_level: 1,
      pedal_edema_yesno: 1,
      anemia_yesno: 1,
      target: 1
    };

    const docs = await patientsCollection
      .find({}, { projection })
      .limit(limit)
      .toArray();

    // Map to UI-friendly cards
    const cards = docs.map((p, i) => {
      const age = num(p.age_of_the_patient);
      const bmi = num(p.body_mass_index_bmi);
      const egfr = num(p.estimated_glomerular_filtration_rate_egfr);
      const hgb = num(p.hemoglobin_level_gms);
      const scr = num(p.serum_creatinine_mgdl);
      const bun = num(p.blood_urea_mgdl);
      const k = num(p.potassium_level_meql);

      const stage = deriveStage(egfr);
      const diagnosis = p.target
        ? labelTarget(p.target)
        : "Chronic Kidney Disease";

      const riskFactors = [
        p.diabetes_mellitus_yesno === 1 ? "Diabetes" : null,
        p.hypertension_yesno === 1 ? "High Blood Pressure" : null,
        p.smoking_status === 1 ? "Smoking" : null,
        p.family_history_of_chronic_kidney_disease === 1 ? "Family History" : null,
        isLMH(p.physical_activity_level) ? `Activity: ${String(p.physical_activity_level)}` : null,
      ].filter(Boolean);

      const labFlags = [
        k != null && k > 5.5 ? "High Potassium" : null,
        bun != null && bun > 100 ? "High Urea" : null,
        scr != null && scr > 1.5 ? "High Creatinine" : null,
        p.anemia_yesno === 1 ? "Anemia" : null,
        p.pedal_edema_yesno === 1 ? "Edema" : null,
      ].filter(Boolean);

      return {
        id: i, // don’t expose _id
        name: `Patient ${i + 1}`,
        age: age ?? null,
        gender: "—",                           // not in dataset
        stage,                                 // "Stage 1..5" or "Unknown"
        diagnosis,                             // friendly from target
        story:
          "Explore lifestyle and lab patterns similar to yours. Learn how habits relate to kidney health.",
        lifestyle: {
          diabetic: p.diabetes_mellitus_yesno === 1,
          exercise: isLMH(p.physical_activity_level), // presence of LVL
          smokes: p.smoking_status === 1,
          highBP: p.hypertension_yesno === 1,
        },
        riskFactors,
        improvements: ["Medication adherence", "Regular monitoring", "Lifestyle adjustments"],
        vitals: {
          bmi: round1(bmi),
          egfr: round1(egfr),
          hemoglobin: round1(hgb),
        },
        labFlags,
        matchScore: 70, // placeholder; replace with similarity score later
      };
    });

    res.json(cards);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// helpers
function deriveStage(g) {
  if (g == null || !isFinite(+g)) return "Unknown";
  const v = +g;
  if (v >= 90) return "Stage 1";
  if (v >= 60) return "Stage 2";
  if (v >= 45) return "Stage 3";
  if (v >= 30) return "Stage 4";
  return "Stage 5";
}
function labelTarget(t) {
  const s = String(t).toLowerCase();
  if (s.includes("no_disease")) return "No CKD";
  if (s.includes("low")) return "Low CKD Risk";
  if (s.includes("high")) return "High CKD Risk";
  return "Chronic Kidney Disease";
}
function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}
function round1(x) {
  return x == null ? null : Math.round(x * 10) / 10;
}
function isLMH(val) {
  const s = String(val || "").toLowerCase();
  return s === "low" || s === "moderate" || s === "high" || s === "medium";
}


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
