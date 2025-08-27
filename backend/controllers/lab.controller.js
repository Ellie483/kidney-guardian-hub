const Patient = require("../models/patient.model");
const DecisionTree = require('decision-tree');
const cacheService = require('../services/cache.service');

// ⚡ Attributes (features used in decision tree)
const features = [
  'age_of_the_patient',
  'smoking_status',
  'physical_activity_level',
  'family_history_of_chronic_kidney_disease',
  'body_mass_index_bmi',
  'duration_of_diabetes_mellitus_years',
  'duration_of_hypertension_years',
  'coronary_artery_disease_yesno',
  'serum_creatinine_mgdl',
  'estimated_glomerular_filtration_rate_egfr',
  'blood_urea_mgdl',
  'sodium_level_meql',
  'potassium_level_meql',
  'random_blood_glucose_level_mgdl',
  'specific_gravity_of_urine',
  'red_blood_cells_in_urine',
  'pus_cells_in_urine',
  'bacteria_in_urine',
  'blood_pressure_mmhg',
  'appetite_goodpoor'
];

const class_name = 'target';




exports.predictPatientCondition = async (req, res) => {
  try {
    let dtInstance;

    // 1. Try to get cached model JSON from Redis
    const cachedModelJson = await cacheService.getDecisionTree();
    
    if (cachedModelJson) {
      console.log('✅ Using cached model from Redis');
      const ttl = await cacheService.getTTL();
      console.log(`Cache expires in ${ttl} seconds`);
      
      // 🚨 RECREATE the DecisionTree instance from JSON
      // This is FAST - no training involved, just structure rebuilding
      dtInstance = new DecisionTree(cachedModelJson);
    } else {
      // 2. Train new model if no cache exists
      console.log('🔄 Training new model...');

      // Count documents
      const count = await Patient.countDocuments();
      let trainCount = Math.floor((count * 100) / 100); // 100% training

      const trainingData = await Patient.find()
        .limit(trainCount)
        .select(
          'age_of_the_patient smoking_status physical_activity_level family_history_of_chronic_kidney_disease body_mass_index_bmi duration_of_diabetes_mellitus_years duration_of_hypertension_years coronary_artery_disease_yesno serum_creatinine_mgdl estimated_glomerular_filtration_rate_egfr blood_urea_mgdl sodium_level_meql potassium_level_meql random_blood_glucose_level_mgdl specific_gravity_of_urine red_blood_cells_in_urine pus_cells_in_urine bacteria_in_urine blood_pressure_mmhg appetite_goodpoor target'
        )
        .lean(); // plain JS objects (better for ML)

      if (trainingData.length === 0) {
        return res.status(400).json({ error: 'No training data available.' });
      }

      // Train the model (SLOW - processes 80% records)
      dtInstance = new DecisionTree(trainingData, class_name, features);
      
      // 🚨 Convert to JSON for Redis storage
      const modelJson = dtInstance.toJSON();
      
      // Store JSON in Redis
      await cacheService.setDecisionTree(modelJson);
      console.log('✅ Model trained and saved to Redis');
    }

    // 3. Use the instance for prediction
    const predictedClass = dtInstance.predict(req.body);
    console.log(predictedClass);
    
    res.json({
      predicted_condition: predictedClass,
      input_data: req.body,
      message: "Prediction successful"
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Cache management endpoints
exports.clearCache = async (req, res) => {
  try {
    await cacheService.deleteDecisionTree();
    res.json({ message: 'Redis cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};

exports.getCacheStatus = async (req, res) => {
  try {
    const ttl = await cacheService.getTTL();
    const hasModel = await cacheService.getDecisionTree() !== null;
    
    res.json({
      hasModel,
      ttlSeconds: ttl,
      expiresIn: ttl > 0 ? `${ttl} seconds` : 'expired',
      status: hasModel ? 'active' : 'empty'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache status' });
  }
};