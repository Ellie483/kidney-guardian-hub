const cacheService = require('../services/cache.service');
const Patient = require("../models/patient.model");
const fs = require('fs').promises;
const path = require('path');

// ⚡ Load decision-tree dynamically
let DecisionTree;
import('decision-tree').then(module => {
  DecisionTree = module.default;
}).catch(err => {
  console.error('Failed to load decision-tree:', err);
});

// 🏥 6 ATTRIBUTES + TARGET
const features = [
  'creatinine_category',
  'egfr_category',
  'blood_urea_category',
  'albumin_urine_category',
  'sodium_category',
  'potassium_category'
];

const class_name = 'target';

// 📊 FIND MIN/MAX VALUES FOR EACH ATTRIBUTE
async function findMinMaxValues() {
  try {
    console.log('🔍 Finding min/max values for each attribute...');
    
    const aggregates = await Patient.aggregate([
      {
        $group: {
          _id: null,
          // Serum Creatinine (typically 0.5-15 mg/dL)
          min_creatinine: { $min: '$serum_creatinine_mgdl' },
          max_creatinine: { $max: '$serum_creatinine_mgdl' },
          
          // eGFR (typically 5-120 mL/min/1.73m²)
          min_egfr: { $min: '$estimated_glomerular_filtration_rate_egfr' },
          max_egfr: { $max: '$estimated_glomerular_filtration_rate_egfr' },
          
          // Blood Urea (typically 5-100 mg/dL)  
          min_blood_urea: { $min: '$blood_urea_mgdl' },
          max_blood_urea: { $max: '$blood_urea_mgdl' },
          
          // Albumin in Urine (typically 0-500 mg/dL)
          min_albumin: { $min: '$albumin_in_urine' },
          max_albumin: { $max: '$albumin_in_urine' },
          
          // Sodium (typically 120-160 mEq/L)
          min_sodium: { $min: '$sodium_level_meql' },
          max_sodium: { $max: '$sodium_level_meql' },
          
          // Potassium (typically 2.5-7.0 mEq/L)
          min_potassium: { $min: '$potassium_level_meql' },
          max_potassium: { $max: '$potassium_level_meql' }
        }
      }
    ]);

    if (!aggregates || aggregates.length === 0) {
      console.log('⚠️ No data found for min/max calculation');
      return null;
    }

    const minMax = aggregates[0];
    console.log('✅ Min/Max values found:');
    console.log('Creatinine:', minMax.min_creatinine, '-', minMax.max_creatinine);
    console.log('eGFR:', minMax.min_egfr, '-', minMax.max_egfr);
    console.log('Blood Urea:', minMax.min_blood_urea, '-', minMax.max_blood_urea);
    console.log('Albumin Urine:', minMax.min_albumin, '-', minMax.max_albumin);
    console.log('Sodium:', minMax.min_sodium, '-', minMax.max_sodium);
    console.log('Potassium:', minMax.min_potassium, '-', minMax.max_potassium);
    
    return minMax;
    
  } catch (error) {
    console.error('❌ Error finding min/max values:', error);
    return null;
  }
}


// 🏥 CREATE DYNAMIC BINNING FUNCTIONS WITH DEBUG LOGS
function createBinningFunctions(minMaxValues) {
  // Fallback to standard medical ranges if no data
  const ranges = minMaxValues || {
    min_creatinine: 0.5, max_creatinine: 15,
    min_egfr: 5, max_egfr: 120,
    min_blood_urea: 5, max_blood_urea: 100,
    min_albumin: 0, max_albumin: 500,
    min_sodium: 120, max_sodium: 160,
    min_potassium: 2.5, max_potassium: 7.0
  };

  // Convert all values to numbers to ensure they're not null/undefined
  const min_creatinine = Number(ranges.min_creatinine) || 0.5;
  const max_creatinine = Number(ranges.max_creatinine) || 15;
  const min_egfr = Number(ranges.min_egfr) || 5;
  const max_egfr = Number(ranges.max_egfr) || 120;
  const min_blood_urea = Number(ranges.min_blood_urea) || 5;
  const max_blood_urea = Number(ranges.max_blood_urea) || 100;
  const min_albumin = Number(ranges.min_albumin) || 0;
  const max_albumin = Number(ranges.max_albumin) || 500;
  const min_sodium = Number(ranges.min_sodium) || 120;
  const max_sodium = Number(ranges.max_sodium) || 160;
  const min_potassium = Number(ranges.min_potassium) || 2.5;
  const max_potassium = Number(ranges.max_potassium) || 7.0;

  console.log('📊 BINNING INTERVALS:');
  console.log('================================');

  const binningFunctions = {
    // Creatinine: 0.5-15 mg/dL (5 bins)
    binCreatinine: (creat) => {
      const range = max_creatinine - min_creatinine;
      const binSize = range / 5;
      
      console.log(`🧪 Creatinine Bins:`);
      console.log(`   very_low: < ${(min_creatinine + binSize).toFixed(2)}`);
      console.log(`   low:      < ${(min_creatinine + 2 * binSize).toFixed(2)}`);
      console.log(`   medium:   < ${(min_creatinine + 3 * binSize).toFixed(2)}`);
      console.log(`   high:     < ${(min_creatinine + 4 * binSize).toFixed(2)}`);
      console.log(`   very_high:>= ${(min_creatinine + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${creat}`);
      
      if (creat < min_creatinine + binSize) {
        console.log('   → Creatinine: very_low');
        return 'very_low';
      }
      if (creat < min_creatinine + 2 * binSize) {
        console.log('   → Creatinine: low');
        return 'low';
      }
      if (creat < min_creatinine + 3 * binSize) {
        console.log('   → Creatinine: medium');
        return 'medium';
      }
      if (creat < min_creatinine + 4 * binSize) {
        console.log('   → Creatinine: high');
        return 'high';
      }
      console.log('   → Creatinine: very_high');
      return 'very_high';
    },

    // eGFR: 5-120 mL/min/1.73m² (5 bins)
    binEGFR: (egfr) => {
      const range = max_egfr - min_egfr;
      const binSize = range / 5;
      
      console.log(`🧪 eGFR Bins:`);
      console.log(`   kidney_failure: < ${(min_egfr + binSize).toFixed(2)}`);
      console.log(`   severe:         < ${(min_egfr + 2 * binSize).toFixed(2)}`);
      console.log(`   moderate:       < ${(min_egfr + 3 * binSize).toFixed(2)}`);
      console.log(`   mild:           < ${(min_egfr + 4 * binSize).toFixed(2)}`);
      console.log(`   normal:         >= ${(min_egfr + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${egfr}`);
      
      if (egfr < min_egfr + binSize) {
        console.log('   → egfr: kidney_failure');
        return 'kidney_failure';
      }
      if (egfr < min_egfr + 2 * binSize) {
        console.log('   → egfr: severe');
        return 'severe';
      }
      if (egfr < min_egfr + 3 * binSize) {
        console.log('   → egfr: moderate');
        return 'moderate';
      }
      if (egfr < min_egfr + 4 * binSize) {
        console.log('   → egfr: mild');
        return 'mild';
      }
      console.log('   → egfr: normal');
      return 'normal';
    },

    // Blood Urea: 5-100 mg/dL (5 bins)
    binBloodUrea: (bun) => {
      const range = max_blood_urea - min_blood_urea;
      const binSize = range / 5;
      
      console.log(`🧪 Blood Urea Bins:`);
      console.log(`   very_low: < ${(min_blood_urea + binSize).toFixed(2)}`);
      console.log(`   low:      < ${(min_blood_urea + 2 * binSize).toFixed(2)}`);
      console.log(`   medium:   < ${(min_blood_urea + 3 * binSize).toFixed(2)}`);
      console.log(`   high:     < ${(min_blood_urea + 4 * binSize).toFixed(2)}`);
      console.log(`   very_high:>= ${(min_blood_urea + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${bun}`);
      
      if (bun < min_blood_urea + binSize) {
        console.log('   → Blood Urea: very_low');
        return 'very_low';
      }
      if (bun < min_blood_urea + 2 * binSize) {
        console.log('   → Blood Urea: low');
        return 'low';
      }
      if (bun < min_blood_urea + 3 * binSize) {
        console.log('   → Blood Urea: medium');
        return 'medium';
      }
      if (bun < min_blood_urea + 4 * binSize) {
        console.log('   → Blood Urea: high');
        return 'high';
      }
      console.log('   → Blood Urea: very_high');
      return 'very_high';
    },

    // Albumin in Urine: 0-500 mg/dL (5 bins)
    binAlbuminUrine: (albumin) => {
      const range = max_albumin - min_albumin;
      const binSize = range / 5;
      
      console.log(`🧪 Albumin Urine Bins:`);
      console.log(`   normal:    < ${(min_albumin + binSize).toFixed(2)}`);
      console.log(`   micro:     < ${(min_albumin + 2 * binSize).toFixed(2)}`);
      console.log(`   moderate:  < ${(min_albumin + 3 * binSize).toFixed(2)}`);
      console.log(`   heavy:     < ${(min_albumin + 4 * binSize).toFixed(2)}`);
      console.log(`   nephrotic: >= ${(min_albumin + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${albumin}`);
      
      if (albumin < min_albumin + binSize) {
        console.log('   → Albumin in Urine: normal');
        return 'normal';
      }
      if (albumin < min_albumin + 2 * binSize) {
        console.log('   → Albumin in Urine: micro');
        return 'micro';
      }
      if (albumin < min_albumin + 3 * binSize) {
        console.log('   → Albumin in Urine: moderate');
        return 'moderate';
      }
      if (albumin < min_albumin + 4 * binSize) {
        console.log('   → Albumin in Urine: heavy');
        return 'heavy';
      }
      console.log('   → Albumin in Urine: nephrotic');
      return 'nephrotic';
    },

    // Sodium: 120-160 mEq/L (5 bins)
    binSodium: (sodium) => {
      const range = max_sodium - min_sodium;
      const binSize = range / 5;
      
      console.log(`🧪 Sodium Bins:`);
      console.log(`   very_low: < ${(min_sodium + binSize).toFixed(2)}`);
      console.log(`   low:      < ${(min_sodium + 2 * binSize).toFixed(2)}`);
      console.log(`   normal:   < ${(min_sodium + 3 * binSize).toFixed(2)}`);
      console.log(`   high:     < ${(min_sodium + 4 * binSize).toFixed(2)}`);
      console.log(`   very_high:>= ${(min_sodium + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${sodium}`);
      
      if (sodium < min_sodium + binSize) {
        console.log('   → Sodium: very_low');
        return 'very_low';
      }
      if (sodium < min_sodium + 2 * binSize) {
        console.log('   → Sodium: low');
        return 'low';
      }
      if (sodium < min_sodium + 3 * binSize) {
        console.log('   → Sodium: normal');
        return 'normal';
      }
      if (sodium < min_sodium + 4 * binSize) {
        console.log('   → Sodium: high');
        return 'high';
      }
      console.log('   → Sodium: very_high');
      return 'very_high';
    },

    // Potassium: 2.5-7.0 mEq/L (5 bins)
    binPotassium: (potassium) => {
      const range = max_potassium - min_potassium;
      const binSize = range / 5;
      
      console.log(`🧪 Potassium Bins:`);
      console.log(`   very_low: < ${(min_potassium + binSize).toFixed(2)}`);
      console.log(`   low:      < ${(min_potassium + 2 * binSize).toFixed(2)}`);
      console.log(`   normal:   < ${(min_potassium + 3 * binSize).toFixed(2)}`);
      console.log(`   high:     < ${(min_potassium + 4 * binSize).toFixed(2)}`);
      console.log(`   very_high:>= ${(min_potassium + 4 * binSize).toFixed(2)}`);
      console.log(`   Input: ${potassium}`);
      
      if (potassium < min_potassium + binSize) {
        console.log('   → Potassium: very_low');
        return 'very_low';
      }
      if (potassium < min_potassium + 2 * binSize) {
        console.log('   → Potassium: low');
        return 'low';
      }
      if (potassium < min_potassium + 3 * binSize) {
        console.log('   → Potassium: normal');
        return 'normal';
      }
      if (potassium < min_potassium + 4 * binSize) {
        console.log('   → Potassium: high');
        return 'high';
      }
      console.log('   → Potassium: very_high');
      return 'very_high';
    }
  };

  console.log('================================');
  return binningFunctions;
}

// 📝 SAVE COMPLETE DTINSTANCE TO TEXT FILE
async function saveDtInstanceToFile(dtInstance, filename = 'dt-instance-structure.txt') {
  try {
    const filePath = path.join(__dirname, '..', 'debug', filename);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    let content = `COMPLETE DTINSTANCE STRUCTURE\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `============================================\n\n`;
    
    content += `FULL JSON STRUCTURE:\n`;
    content += JSON.stringify(dtInstance.toJSON(), null, 2);
    
    await fs.writeFile(filePath, content);
    console.log(`✅ dtInstance structure saved to: ${filePath}`);
    return filePath;
    
  } catch (error) {
    console.error('❌ Error saving dtInstance to file:', error.message);
    return null;
  }
}

// 📏 Calculate tree depth
function calculateTreeDepth(node) {
  if (!node.vals || node.vals.length === 0) return 1;
  
  let maxDepth = 0;
  node.vals.forEach(val => {
    if (val.child) {
      const childDepth = calculateTreeDepth(val.child);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });
  
  return maxDepth + 1;
}

exports.predictPatientCondition = async (req, res) => {
  try {
    console.log('🚀 Starting prediction process...');
    
    if (!DecisionTree) {
      return res.status(503).json({ error: 'DecisionTree module not loaded yet, please retry.' });
    }

    let dtInstance;
    let binningFunctions;

    // 1. First, find min/max values for each attribute
    const minMaxValues = await findMinMaxValues();
    console.log('✅ Step 1: Min/Max values analysis completed');
    
    // 2. Create dynamic binning functions based on actual data ranges
    binningFunctions = createBinningFunctions(minMaxValues);
    console.log('✅ Step 2: Dynamic binning functions created');
    
    // 🏥 PREPROCESS PATIENT DATA with dynamic binning
    const preprocessPatientData = (patientData) => {
      return {
        creatinine_category: binningFunctions.binCreatinine(patientData.serum_creatinine_mgdl || 1.0),
        egfr_category: binningFunctions.binEGFR(patientData.estimated_glomerular_filtration_rate_egfr || 90),
        blood_urea_category: binningFunctions.binBloodUrea(patientData.blood_urea_mgdl || 20),
        albumin_urine_category: binningFunctions.binAlbuminUrine(patientData.albumin_in_urine || 10),
        sodium_category: binningFunctions.binSodium(patientData.sodium_level_meql || 140),
        potassium_category: binningFunctions.binPotassium(patientData.potassium_level_meql || 4.0),
        target: patientData.target
      };
    };

    // 3. Try to get cached model JSON from Redis
    const cachedModelJson = await cacheService.getDecisionTree();
    
    if (cachedModelJson) {
      console.log('✅ Using cached model from Redis');
      dtInstance = new DecisionTree(cachedModelJson);
      await saveDtInstanceToFile(dtInstance, 'cached-dt-instance.txt');
      console.log('✅ Step 3: Cached tree structure saved');
      
    } else {
      console.log('🔄 Training new model with real data...');
      
      // 4. Extract real data from database (20 records for tracing)
     // Keep only 1 → 9000
        const rawTrainingData = await Patient.find()
          .limit(9000)
          .select('serum_creatinine_mgdl estimated_glomerular_filtration_rate_egfr blood_urea_mgdl albumin_in_urine sodium_level_meql potassium_level_meql target')
          .lean();


      console.log(`✅ Retrieved ${rawTrainingData.length} records from database`);
      
      if (rawTrainingData.length === 0) {
        return res.status(400).json({ error: 'No training data available.' });
      }

      // 5. Preprocess data into categories using dynamic binning
      const trainingDataWithCategories = rawTrainingData.map(preprocessPatientData);
      console.log('✅ Step 4: Data preprocessing completed');
      
      // 6. Train the model (automatically handles majority voting and splitting)
      dtInstance = new DecisionTree(trainingDataWithCategories, class_name, features);
      console.log('✅ Step 5: Model training completed');
      
      // 7. Save to Redis
      const modelJson = dtInstance.toJSON();
      await cacheService.setDecisionTree(modelJson);
      console.log('✅ Step 6: Model saved to Redis');
      
      // 8. 💾 SAVE COMPLETE TREE STRUCTURE
      await saveDtInstanceToFile(dtInstance, 'new-dt-instance.txt');
      console.log('✅ Step 7: New tree structure saved');
    }

    // 9. Make prediction with dynamic binning
    const categoricalInput = {
      creatinine_category: binningFunctions.binCreatinine(req.body.serum_creatinine_mgdl),
      egfr_category: binningFunctions.binEGFR(req.body.estimated_glomerular_filtration_rate_egfr),
      blood_urea_category: binningFunctions.binBloodUrea(req.body.blood_urea_mgdl),
      albumin_urine_category: binningFunctions.binAlbuminUrine(req.body.albumin_in_urine),
      sodium_category: binningFunctions.binSodium(req.body.sodium_level_meql),
      potassium_category: binningFunctions.binPotassium(req.body.potassium_level_meql)
    };

    const prediction = dtInstance.predict(categoricalInput);
    console.log('✅ Step 8: Prediction completed:', prediction);
    
    res.json({
      predicted_condition: prediction,
      input_categories: categoricalInput,
      message: "Prediction using 6 attributes with dynamic binning and majority voting"
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📋 Train model endpoint
exports.trainModel = async (req, res) => {
  try {
    console.log('🔄 Manual training started...');
    
    const minMaxValues = await findMinMaxValues();
    const binningFunctions = createBinningFunctions(minMaxValues);
    
    const preprocessPatientData = (patientData) => {
      return {
        creatinine_category: binningFunctions.binCreatinine(patientData.serum_creatinine_mgdl || 1.0),
        egfr_category: binningFunctions.binEGFR(patientData.estimated_glomerular_filtration_rate_egfr || 90),
        blood_urea_category: binningFunctions.binBloodUrea(patientData.blood_urea_mgdl || 20),
        albumin_urine_category: binningFunctions.binAlbuminUrine(patientData.albumin_in_urine || 10),
        sodium_category: binningFunctions.binSodium(patientData.sodium_level_meql || 140),
        potassium_category: binningFunctions.binPotassium(patientData.potassium_level_meql || 4.0),
        target: patientData.target
      };
    };
    
    const rawTrainingData = await Patient.find()
      .limit(10000)
      .select('serum_creatinine_mgdl estimated_glomerular_filtration_rate_egfr blood_urea_mgdl albumin_in_urine sodium_level_meql potassium_level_meql target')
      .lean();

    const trainingDataWithCategories = rawTrainingData.map(preprocessPatientData);
    const dtInstance = new DecisionTree(trainingDataWithCategories, class_name, features);

    const modelJson = dtInstance.toJSON();
    await cacheService.setDecisionTree(modelJson);

    await saveDtInstanceToFile(dtInstance, 'manual-training-tree.txt');

    res.json({
      message: 'Model trained successfully with dynamic binning',
      samples: trainingDataWithCategories.length,
      features: features,
      tree_saved: true
    });

  } catch (err) {
    console.error("Training error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get cache status
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

// 🗑️ Clear cache
exports.clearCache = async (req, res) => {
  try {
    await cacheService.deleteDecisionTree();
    res.json({ message: 'Redis cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};

// 🔍 Get tree analysis
exports.getTreeAnalysis = async (req, res) => {
  try {
    const cachedModelJson = await cacheService.getDecisionTree();
    if (!cachedModelJson) {
      return res.status(404).json({ error: 'No trained model available' });
    }

    const dtInstance = new DecisionTree(cachedModelJson);
    await saveDtInstanceToFile(dtInstance, 'analysis-tree.txt');

    res.json({
      success: true,
      message: 'Tree analysis saved to text file',
      download_path: '/debug/analysis-tree.txt'
    });

  } catch (err) {
    console.error("Tree analysis error:", err);
    res.status(500).json({ error: err.message });
  }
}