// backend/server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const patientRoutes = require("./routes/patient.routes");
const analysisRoutes = require("./routes/analysis.routes");
const searchRoutes  = require("./routes/search.routes");
const userRoutes    = require("./routes/users.routes");
const adminRoutes  = require("./routes/admin.routes"); 
const mythfactRoutes = require("./routes/mythfact.routes")
const app = express();

// --- core middleware
app.use(express.json());
app.use(cookieParser());

// CORS for Vite @ 8080 → Node @ 5000
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));
app.use((req, res, next) => {
  console.log(`\n${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length) {
    console.log("Body:", req.body);
  }
  res.on("finish", () => {
    console.log("→", res.statusCode, req.method, req.url);
  });
  next();
});

// --- ROUTES *NO /api PREFIX*
app.use("/patients", patientRoutes); // GET /patients, POST /patients/similar
app.use("/search",  searchRoutes);   // POST /search/cohort
app.use("/users",   userRoutes);     // POST /users, POST /users/login, GET /users/me, GET /users
app.use("/admin",   adminRoutes);
app.use("/mythfact", mythfactRoutes)
// health
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
app.use("/analysis", analysisRoutes);

/* ---------- db connect ---------- */
// mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const mongoUri =
  "mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/Kidney?retryWrites=true&w=majority&appName=Cluster0";

// DB
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
