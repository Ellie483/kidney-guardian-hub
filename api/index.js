// api/index.js
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI; // from .env file
const client = new MongoClient(uri);

app.get("/", (req, res) => {
  res.send("Kidney API is running 🚀");
});

// Example: get patients
app.get("/patients", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("Kidney");
    const collection = db.collection("clean_out");

    const patients = await collection.find({}).limit(10).toArray();
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    await client.close();
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
