// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// import your patients routes
const patientRoutes = require("./routes/patient.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();
const PORT = 5000; // you can change this if needed

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- health check ---------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ---------- routes ---------- */

app.use("/api/users", usersRoutes);
app.use("/api/patients", patientRoutes);

/* ---------- db connect ---------- */
const mongoUri =
  "mongodb+srv://mptmayphyothu78:CZEoFA6D2BFrRE54@cluster0.wqyif61.mongodb.net/Kidney?retryWrites=true&w=majority&appName=Cluster0";
// const mongoUri =
//   "mongodb+srv://hannithaw4723:iZxgDpAb0JBz368N@cluster0.wqyif61.mongodb.net/Kidney?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoUri, {dbName: "Kidney"}) 
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
