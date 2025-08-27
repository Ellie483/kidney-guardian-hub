const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('./config/redis'); // Import Redis config to initialize connection

// Import your routes
const patientRoutes = require("./routes/patient.routes");
const labRoutes = require("./routes/lab.route");

const app = express();
const PORT = 5000;

/* ---------- middleware ---------- */
app.use(cors({
  origin: true, // Allows all origins (adjust for production)
  credentials: true // Allow cookies if needed
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- routes ---------- */
app.use("/patients", patientRoutes);
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

/* ---------- db connect ---------- */
const mongoUri =
  "mongodb+srv://hannithaw4723:iZxgDpAb0JBz368N@cluster0.wqyif61.mongodb.net/Kidney?retryWrites=true&w=majority&appName=Cluster0";

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