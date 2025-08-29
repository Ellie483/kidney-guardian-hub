const Patient = require("../models/patient.model");

// Age group bucket mapping
const ageGroupLabels = [
  { min: 0, max: 30, label: "0–30" },
  { min: 31, max: 45, label: "31–45" },
  { min: 46, max: 60, label: "46–60" },
  { min: 61, max: 75, label: "61–75" },
  { min: 76, max: 100, label: "76+" },
];

// Helper: convert exact age to group label
function getAgeGroupLabel(age) {
  const group = ageGroupLabels.find((g) => age >= g.min && age <= g.max);
  return group ? group.label : "Unknown";
}

// 1. CKD cases grouped by age bucket
const getAgeGroupDistribution = async (req, res) => {
  try {
    const ageGroupLabels = [
      { label: "18-30", min: 18, max: 30 },
      { label: "31-45", min: 31, max: 45 },
      { label: "46-60", min: 46, max: 60 },
      { label: "61-75", min: 61, max: 75 },
      { label: "75+", min: 76, max: 120 },
    ];

    const pipeline = [
      { $match: { target: { $ne: "no_disease" } } },
      {
        $project: {
          age_group: {
            $switch: {
              branches: ageGroupLabels.map((g) => ({
                case: { $and: [{ $gte: ["$age_of_the_patient", g.min] }, { $lte: ["$age_of_the_patient", g.max] }] },
                then: g.label,
              })),
              default: "Unknown",
            },
          },
          diabetes: "$diabetes_mellitus_yesno",
          hypertension: "$hypertension_yesno",
          smoking: "$smoking_status",
          low_activity: { $cond: [{ $eq: ["$physical_activity_level", "low"] }, 1, 0] },
          anemia: "$anemia_yesno",
          cad: "$coronary_artery_disease_yesno",
          obesity: { $cond: [{ $gt: ["$body_mass_index_bmi", 30] }, 1, 0] },
        },
      },
      {
        $group: {
          _id: "$age_group",
          total: { $sum: 1 },
          diabetes: { $sum: "$diabetes" },
          hypertension: { $sum: "$hypertension" },
          smoking: { $sum: "$smoking" },
          low_activity: { $sum: "$low_activity" },
          anemia: { $sum: "$anemia" },
          cad: { $sum: "$cad" },
          obesity: { $sum: "$obesity" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await Patient.aggregate(pipeline);

    // remove "Unknown" and calculate grand total
    const filtered = result.filter((g) => g._id !== "Unknown");
    const grandTotal = filtered.reduce((sum, g) => sum + g.total, 0);

    // format with percentages
    const formatted = filtered.map((g) => ({
      age_group: g._id,
      age_pct: ((g.total / grandTotal) * 100).toFixed(2), // % of CKD patients in this age group
      diabetes_pct: ((g.diabetes / g.total) * 100).toFixed(2),
      hypertension_pct: ((g.hypertension / g.total) * 100).toFixed(2),
      smoking_pct: ((g.smoking / g.total) * 100).toFixed(2),
      low_activity_pct: ((g.low_activity / g.total) * 100).toFixed(2),
      anemia_pct: ((g.anemia / g.total) * 100).toFixed(2),
      cad_pct: ((g.cad / g.total) * 100).toFixed(2),
      obesity_pct: ((g.obesity / g.total) * 100).toFixed(2),
    }));

    // find most affected group
    const highestGroup = formatted.reduce(
      (max, g) => (parseFloat(g.age_pct) > parseFloat(max.age_pct) ? g : max),
      formatted[0]
    ).age_group;

    res.json({ highest_age_group: highestGroup, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// 2. CKD + Diabetes grouped by age group
const getDiabetesRelatedCKD = async (req, res) => {
  try {
    const patients = await Patient.find({
      diabetes_mellitus_yesno: 1,
      target: { $ne: "no_disease" },
    });

    const ageBuckets = {};

    patients.forEach((p) => {
      const label = getAgeGroupLabel(p.age_of_the_patient);
      ageBuckets[label] = (ageBuckets[label] || 0) + 1;
    });

    const result = Object.entries(ageBuckets).map(([label, count]) => ({
      age_group: label,
      count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. CKD + Hypertension grouped by age group
const getHypertensionCKDStats = async (req, res) => {
  try {
    const patients = await Patient.find({
      hypertension_yesno: 1,
      target: { $ne: "no_disease" },
    });

    const ageBuckets = {};

    patients.forEach((p) => {
      const label = getAgeGroupLabel(p.age_of_the_patient);
      ageBuckets[label] = (ageBuckets[label] || 0) + 1;
    });

    const result = Object.entries(ageBuckets).map(([label, count]) => ({
      age_group: label,
      count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCKDSummary = async (req, res) => {
  try {
    // Step 1: Get only CKD patients
    const allCKD = await Patient.find({ target: { $ne: "no_disease" } });

    // Step 2: Group CKD patients into age brackets
    const ageGroups = {
      "0-15": [],
      "16-30": [],
      "31-45": [],
      "46-60": [],
      "61-75": [],
      "76+": [],
    };

    allCKD.forEach((p) => {
      const age = p.age_of_the_patient;
      if (age <= 15) ageGroups["0-15"].push(p);
      else if (age <= 30) ageGroups["16-30"].push(p);
      else if (age <= 45) ageGroups["31-45"].push(p);
      else if (age <= 60) ageGroups["46-60"].push(p);
      else if (age <= 75) ageGroups["61-75"].push(p);
      else ageGroups["76+"].push(p);
    });

    // Step 3: Find the peak age group (with most CKD patients)
    const peakAgeGroup = Object.entries(ageGroups).sort((a, b) => b[1].length - a[1].length)[0][0];
    const peakGroupPatients = ageGroups[peakAgeGroup];

    // Step 4: Count causes only in the peak age group
    const causes = {
      diabetes: 0,
      hypertension: 0,
      smoking: 0,
      low_physical_activity: 0,
      anemia: 0,
      coronary_artery_disease: 0,
    };

    peakGroupPatients.forEach((p) => {
      if (p.diabetes_mellitus_yesno === 1) causes.diabetes++;
      if (p.hypertension_yesno === 1) causes.hypertension++;
      if (p.smoking_status === 1) causes.smoking++;
      if (p.physical_activity_level === "low") causes.low_physical_activity++;
      if (p.anemia_yesno === 1) causes.anemia++;
      if (p.coronary_artery_disease_yesno === 1) causes.coronary_artery_disease++;
    });

    const topCause = Object.entries(causes).sort((a, b) => b[1] - a[1])[0];

    res.json({
      peak_age_group: peakAgeGroup,
      top_cause_key: topCause[0],
      top_cause_count: topCause[1],
      insight: `CKD peaks in the ${peakAgeGroup} age group, likely due to ${topCause[0].replace(/_/g, " ")}.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getLifestyleRiskFactors = async (req, res) => {
  try {
    const lifestyleFactors = [
      { field: "smoking_status", label: "Smoking" },
      { field: "diabetes_mellitus_yesno", label: "Diabetes" },
      { field: "hypertension_yesno", label: "Hypertension" },
      { field: "physical_activity_level", label: "Low Physical Activity", value: "low" },
      { field: "family_history_of_chronic_kidney_disease", label: "Family History" }
      // Removed "obesity_yesno"
    ];

    const results = [];

    for (const factor of lifestyleFactors) {
      const condition = factor.value
        ? { [factor.field]: factor.value }
        : { [factor.field]: 1 };

      const [ckdCount, nonCkdCount, totalCkd, totalNonCkd] = await Promise.all([
        Patient.countDocuments({ target: { $ne: "no_disease" }, ...condition }),
        Patient.countDocuments({ target: "no_disease", ...condition }),
        Patient.countDocuments({ target: { $ne: "no_disease" } }),
        Patient.countDocuments({ target: "no_disease" })
      ]);

      const ckdRate = totalCkd > 0 ? (ckdCount / totalCkd) : 0;
      const nonCkdRate = totalNonCkd > 0 ? (nonCkdCount / totalNonCkd) : 0;

      const relativeRisk = nonCkdRate > 0 ? (ckdRate / nonCkdRate) : 0;
      const relativeRiskPercent = (relativeRisk - 1) * 100;

      results.push({
        factor: factor.label,
        ckd_percentage: +(ckdRate * 100).toFixed(2),
        non_ckd_percentage: +(nonCkdRate * 100).toFixed(2),
        relative_risk: +relativeRiskPercent.toFixed(2)
      });
    }

    // Sort by relative risk descending
    results.sort((a, b) => b.relative_risk - a.relative_risk);

    res.json(results);
  } catch (err) {
    console.error("Error calculating lifestyle risk:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCkdFactorPrevalence = async (req, res) => {
  try {
    const lifestyleFactors = [
      { field: "smoking_status", factor: "smoking" },
      { field: "diabetes_mellitus_yesno", factor: "diabetes" },
      { field: "hypertension_yesno", factor: "hypertension" },
      { field: "physical_activity_level", factor: "low_activity", matchValue: "low" },
      { field: "family_history_of_chronic_kidney_disease", factor: "family_history" },
    ];

    const totalCKD = await Patient.countDocuments({ target: { $ne: "no_disease" } });

    const results = [];

    for (const { field, factor, matchValue = 1 } of lifestyleFactors) {
      const withFactor = await Patient.countDocuments({
        [field]: matchValue,
        target: { $ne: "no_disease" },
      });

      const percentage = totalCKD > 0 ? (withFactor / totalCKD) * 100 : 0;

      results.push({
        factor,
        percentage: Number(percentage.toFixed(1)), // CKD patients with this factor
      });
    }

    // Sort by prevalence if you want
    results.sort((a, b) => b.percentage - a.percentage);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCKDRiskFactors = async (req, res) => {
  try {
    const factors = [
      { key: "diabetes_mellitus_yesno", label: "Diabetes", isTruthy: true },
      { key: "hypertension_yesno", label: "Hypertension", isTruthy: true },
      { key: "smoking_status", label: "Smoker", isTruthy: 1 },
      { key: "physical_activity_level", label: "Low Physical Activity", isTruthy: "low" },
      { key: "anemia_yesno", label: "Anemia", isTruthy: true },
      { key: "coronary_artery_disease", label: "Coronary Artery Disease", isTruthy: true },
      {
        key: "body_mass_index_bmi",
        label: "Obesity (BMI > 30)",
        isCustom: true
      }
    ];

    const totalCKD = await Patient.countDocuments({ target: { $ne: "no_disease" } });

    const results = await Promise.all(
      factors.map(async (f) => {
        let matchCondition = { target: { $ne: "no_disease" } };

        if (f.isCustom && f.key === "body_mass_index_bmi") {
          matchCondition[f.key] = { $gt: 30 };
        } else {
          matchCondition[f.key] = f.isTruthy;
        }

        const count = await Patient.countDocuments(matchCondition);
        const percentage = totalCKD ? (count / totalCKD) * 100 : 0;

        return {
          factor: f.label,
          count,
          percentage: Number(percentage.toFixed(2))
        };
      })
    );

    results.sort((a, b) => b.percentage - a.percentage);

    res.json(results);
  } catch (error) {
    console.error("Error calculating CKD risk factors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSevereCKDPercentage = async (req, res) => {
  try {
    // Total CKD patients = everyone EXCEPT "no_disease"
    const totalCKD = await Patient.countDocuments({
      target: { $ne: "no_disease" },
    });

    // Patients with severe CKD (based on target field)
    const severeCKD = await Patient.countDocuments({
      target: "severe_disease",
    });

    const percentage =
      totalCKD === 0 ? 0 : ((severeCKD / totalCKD) * 100).toFixed(2);

    res.json({ percentage: Number(percentage) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCkdRiskCombinations = async (req, res) => {
  try {
    // Fetch only CKD patients
    const patients = await Patient.find({ target: { $ne: "no_disease" } });

    const total = patients.length;

    // Define risk factors
    const factors = [
      { key: "diabetes_mellitus_yesno", label: "Diabetes" },
      { key: "hypertension_yesno", label: "Hypertension" },
      { key: "smoking_status", label: "Smoking" },
      { key: "physical_activity_level", label: "Low Activity", check: (p) => p.physical_activity_level === "low" },
      { key: "anemia_yesno", label: "Anemia" },
      { key: "coronary_artery_disease_yesno", label: "CAD" },
      { key: "body_mass_index_bmi", label: "Obesity", check: (p) => p.body_mass_index_bmi > 30 }
    ];

    const results = [];

    // Helper: check if patient has given factor
    const hasFactor = (p, f) => {
      if (f.check) return f.check(p);
      return p[f.key] === 1;
    };

    // Pairwise overlaps
    for (let i = 0; i < factors.length; i++) {
      for (let j = i + 1; j < factors.length; j++) {
        const f1 = factors[i];
        const f2 = factors[j];

        const overlapCount = patients.filter(
          (p) => hasFactor(p, f1) && hasFactor(p, f2)
        ).length;

        if (overlapCount > 0) {
          results.push({
            combination: `${f1.label} + ${f2.label}`,
            count: overlapCount,
            percentage: ((overlapCount / total) * 100).toFixed(1),
          });
        }
      }
    }

    // Triple overlaps (optional)
    for (let i = 0; i < factors.length; i++) {
      for (let j = i + 1; j < factors.length; j++) {
        for (let k = j + 1; k < factors.length; k++) {
          const f1 = factors[i];
          const f2 = factors[j];
          const f3 = factors[k];

          const overlapCount = patients.filter(
            (p) => hasFactor(p, f1) && hasFactor(p, f2) && hasFactor(p, f3)
          ).length;

          if (overlapCount > 0) {
            results.push({
              combination: `${f1.label} + ${f2.label} + ${f3.label}`,
              count: overlapCount,
              percentage: ((overlapCount / total) * 100).toFixed(1),
            });
          }
        }
      }
    }

    // Sort by percentage
    results.sort((a, b) => b.count - a.count);

    res.json(results);
  } catch (err) {
    console.error("Error computing CKD risk overlaps:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAppetiteAgeTarget = async (req, res) => {
  try {
    const ageGroupLabels = [
      { label: "18-30", min: 18, max: 30 },
      { label: "31-45", min: 31, max: 45 },
      { label: "46-60", min: 46, max: 60 },
      { label: "61-75", min: 61, max: 75 },
      { label: "75+", min: 76, max: 120 },
    ];

    const pipeline = [
      {
        $project: {
          age_group: {
            $switch: {
              branches: ageGroupLabels.map((g) => ({
                case: {
                  $and: [
                    { $gte: ["$age_of_the_patient", g.min] },
                    { $lte: ["$age_of_the_patient", g.max] },
                  ],
                },
                then: g.label,
              })),
              default: "Unknown",
            },
          },
          appetite: "$appetite_goodpoor",
          target: "$target",
        },
      },
      // Filter out unknown age group
      {
        $match: {
          age_group: { $ne: "Unknown" },
        },
      },
      {
        $group: {
          _id: {
            age_group: "$age_group",
            appetite: "$appetite",
            target: "$target",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { age_group: "$_id.age_group", appetite: "$_id.appetite" },
          total: { $sum: "$count" },
          targets: { $push: { target: "$_id.target", count: "$count" } },
        },
      },
      {
        $project: {
          _id: 0,
          age_group: "$_id.age_group",
          appetite: "$_id.appetite",
          targets: {
            $map: {
              input: "$targets",
              as: "t",
              in: {
                target: "$$t.target",
                percentage: {
                  $round: [
                    { $multiply: [{ $divide: ["$$t.count", "$total"] }, 100] },
                    2,
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { age_group: 1, appetite: 1 } },
    ];

    const results = await Patient.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    console.error("Error in getAppetiteAgeTarget:", err);
    res.status(500).json({ error: err.message });
  }
};








module.exports = {
  getAgeGroupDistribution,
  getDiabetesRelatedCKD,
  getHypertensionCKDStats,
  getCKDSummary,
  getLifestyleRiskFactors,
  getCkdFactorPrevalence,
  getAllCKDRiskFactors,
  getSevereCKDPercentage,
  getCkdRiskCombinations,
  getAppetiteAgeTarget
};
