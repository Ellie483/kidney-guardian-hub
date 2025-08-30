const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require('./config/redis'); // Import Redis config to initialize connection

// Import your routes
const patientRoutes = require("./routes/patient.routes");
const labRoutes = require("./routes/lab.route");
const analysisRoutes = require("./routes/analysis.routes");
const searchRoutes  = require("./routes/search.routes");
const userRoutes    = require("./routes/users.routes");
const adminRoutes  = require("./routes/admin.routes"); 
const app = express();

/* ---------- middleware ---------- */
app.use(cors({
  origin: true, // Allows all origins (adjust for production)
  credentials: true // Allow cookies if needed
}));
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

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
app.use("/api/lab", labRoutes);

/* ---------- health check ---------- */
app.get("/health", (_req, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  services: {
    api: "running",
    redis: "connected" // This will show if Redis connection was successful
  }
}));

/* ---------- Redis health check ---------- */
app.get("/redis-health", async (_req, res) => {
  try {
    const redis = require('./config/redis');
    const result = await redis.ping();
    res.json({ 
      redis: result === 'PONG' ? 'connected' : 'error',
      ping: result
    });
  } catch (error) {
    res.status(500).json({ 
      redis: 'disconnected',
      error: error.message 
    });
  }
});
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
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Redis health: http://localhost:${PORT}/redis-health`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });

/* ---------- error handling middleware ---------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/* ---------- 404 handler ---------- */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

module.exports = app; // For testing purposes