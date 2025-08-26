const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true },

    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    heightFeet: { type: Number, min: 1, max: 8 },
    heightInches: { type: Number, min: 0, max: 11 },
    weight: { type: Number, min: 30, max: 700 }, // pounds

    medicalConditions: [{ type: String }], // only Hypertension, Diabetes, etc.
    bloodType: { type: String },
    familyHistory: { type: String },

    // replaced medications with physical activity
    physicalActivity: { type: String, enum: ["Low", "Moderate", "High"] },

    // replaced smokeAlcohol with smoke only
    smoke: { type: String, enum: ["Yes", "No"] },

    registeredAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

// helper used by controllers/similarity logic
userSchema.methods.normalizedProfile = function () {
  const ft = Number(this.heightFeet) || 0;
  const inch = Number(this.heightInches) || 0;
  const lb = Number(this.weight) || 0;
  const totalIn = ft * 12 + inch;
  const m = totalIn > 0 ? totalIn * 0.0254 : null;
  const kg = lb > 0 ? lb * 0.45359237 : null;
  const bmi = m && kg ? Number((kg / (m * m)).toFixed(1)) : null;

  const cond = (this.medicalConditions || []).map(String);
  const has = (s) => cond.some((c) => c.toLowerCase() === s);

  return {
    _id: this._id.toString(),
    age: typeof this.age === "number" ? this.age : undefined,
    gender: typeof this.gender === "string" ? this.gender.toLowerCase() : undefined,
    bmi,
    egfr: undefined, // future use
    diabetic: has("diabetes"),
    hypertension: has("hypertension"),
    smokes: String(this.smoke || "").toLowerCase() === "yes",
    activity: this.physicalActivity || undefined,
  };
};

module.exports = mongoose.model("User", userSchema);
