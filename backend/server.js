// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// import your patients routes
const patientRoutes = require("./routes/patient.routes");
const analysisRoutes = require("./routes/analysis.routes");

const app = express();
const PORT = 5000; // you can change this if needed

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- health check ---------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ---------- routes ---------- */
app.use("/patients", patientRoutes);
app.use("/analysis", analysisRoutes);

/* ---------- db connect ---------- */
// mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const mongoUri =
  "mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/Kidney?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoUri) 
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`✅ Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });
