const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    heightFeet: { type: Number },
    heightInches: { type: Number },
    weight: { type: Number },
    medicalConditions: [{ type: String }],
    bloodType: { type: String },
    familyHistory: { type: String },
    medications: { type: String },
    smokeAlcohol: { type: String, enum: ["Yes", "No"] },
    registeredAt: { type: Date, default: Date.now },
  },
  { collection: "users" } // lowercase!
);

module.exports = mongoose.model("User", userSchema);
