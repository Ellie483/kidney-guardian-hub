const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');

// Define bin configurations for continuous fields
const binConfigs = {
    age_of_the_patient: [
        { label: '0-30', min: 0, max: 30 },
        { label: '31-45', min: 31, max: 45 },
        { label: '46-60', min: 46, max: 60 },
        { label: '61-75', min: 61, max: 75 },
        { label: '76+', min: 76, max: Infinity }
    ],
    body_mass_index_bmi: [
        { label: 'Underweight (<18.5)', min: 0, max: 18.5 },
        { label: 'Normal (18.5-25)', min: 18.5, max: 25 },
        { label: 'Overweight (25-30)', min: 25, max: 30 },
        { label: 'Obese (>30)', min: 30, max: Infinity }
    ],
    estimated_glomerular_filtration_rate_egfr: [
        { label: 'Normal (≥90)', min: 90, max: Infinity },
        { label: 'Mild (60-89)', min: 60, max: 89.999 },
        { label: 'Moderate (30-59)', min: 30, max: 59.999 },
        { label: 'Severe (15-29)', min: 15, max: 29.999 },
        { label: 'Failure (<15)', min: 0, max: 14.999 }
    ],
    serum_creatinine_mgdl: [
        { label: 'Low (<0.5)', min: 0, max: 0.5 },
        { label: 'Normal (0.5-1.2)', min: 0.5, max: 1.2 },
        { label: 'Elevated (>1.2)', min: 1.2, max: Infinity }
    ],
    duration_of_diabetes_mellitus_years: [
        { label: '0-5', min: 0, max: 5 },
        { label: '6-10', min: 6, max: 10 },
        { label: '11-20', min: 11, max: 20 },
        { label: '21+', min: 21, max: Infinity }
    ],
    duration_of_hypertension_years: [
        { label: '0-5', min: 0, max: 5 },
        { label: '6-10', min: 6, max: 10 },
        { label: '11-20', min: 11, max: 20 },
        { label: '21+', min: 21, max: Infinity }
    ],
    blood_urea_mgdl: [
        { label: 'Normal (6-20)', min: 6, max: 20 },
        { label: 'Elevated (21-50)', min: 21, max: 50 },
        { label: 'High (>50)', min: 51, max: Infinity }
    ],
    sodium_level_meql: [
        { label: 'Low (<135)', min: 0, max: 135 },
        { label: 'Normal (135-145)', min: 135, max: 145 },
        { label: 'High (>145)', min: 145, max: Infinity }
    ],
    potassium_level_meql: [
        { label: 'Low (<3.5)', min: 0, max: 3.5 },
        { label: 'Normal (3.5-5.0)', min: 3.5, max: 5.0 },
        { label: 'High (>5.0)', min: 5.0, max: Infinity }
    ],
    random_blood_glucose_level_mgdl: [
        { label: 'Normal (<140)', min: 0, max: 140 },
        { label: 'Prediabetes (140-199)', min: 140, max: 199 },
        { label: 'Diabetes (≥200)', min: 200, max: Infinity }
    ],
    albumin_in_urine: []
};

// Function to get binning projection for a field
const getBinProjection = (field) => {
  const bins = binConfigs[field];
  if (bins && bins.length > 0) {
    return {
      $switch: {
        branches: bins.map((g) => {
          const conditions = [
            { $gte: [`$${field}`, g.min] }
          ];

          // For Infinity, only check lower bound
          if (g.max !== Infinity) {
            conditions.push({ $lte: [`$${field}`, g.max] });
          }

          return {
            case: { $and: conditions },
            then: g.label
          };
        }),
        default: "Unknown"
      }
    };
  }
  return `$${field}`; // no binning, return raw value
};

// List of all possible target values
const ALL_TARGETS = ["low_risk", "high_risk", "moderate_risk"];

// ✅ Custom Pivot Table API
const getCustomPivot = async (req, res) => {
    try {
        const {
            row_field,
            col_field,
            filter_field, // Optional filter field
            filter_value, // Optional filter value
            sort_by_col, // Field to sort columns by
            sort_direction = 'asc'
        } = req.query;

        if (!row_field || !col_field) {
            return res.status(400).json({ error: 'row_field and col_field are required' });
        }

        const schemaPaths = Patient.schema.paths;
        if (!schemaPaths[row_field] || !schemaPaths[col_field] || !schemaPaths['target']) {
            return res.status(400).json({ error: 'Invalid field names' });
        }

        // Build the pipeline
        const pipeline = [];

        // Optional filter
        if (filter_field && filter_value) {
            const filterQuery = {};
            filterQuery[filter_field] = filter_value;
            pipeline.push({ $match: filterQuery });
        }

        // ✅ Exclude "no_disease"
        pipeline.push({ $match: { target: { $ne: 'no_disease' } } });

        const row_bin = getBinProjection(row_field);
        const col_bin = getBinProjection(col_field);
        const target_bin = getBinProjection('target');
        const sort_by_col_bin = getBinProjection(sort_by_col || col_field);

        pipeline.push(
            {
                $project: {
                    row: row_bin,
                    col: col_bin,
                    target: target_bin,
                    sort_col: sort_by_col_bin,
                    _id: 0
                }
            },
            {
                $group: {
                    _id: { row: '$row', col: '$col', target: '$target', sort_col: '$sort_col' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.sort_col': sort_direction === 'desc' ? -1 : 1 }
            },
            {
                $group: {
                    _id: { row: '$_id.row', col: '$_id.col' },
                    totalCount: { $sum: '$count' },
                    targetCounts: {
                        $push: {
                            k: { $toString: '$_id.target' },
                            v: '$count'
                        }
                    }
                }
            },
            {
                $addFields: {
                    targets: {
                        $map: {
                            input: '$targetCounts',
                            as: 'target',
                            in: {
                                k: '$$target.k',
                                v: {
                                    count: '$$target.v',
                                    percentage: {
                                        $cond: [
                                            { $gt: ['$totalCount', 0] },
                                            { $multiply: [{ $divide: ['$$target.v', '$totalCount'] }, 100] },
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $addFields: { targets: { $arrayToObject: '$targets' } } },
            {
                $group: {
                    _id: { $toString: '$_id.row' },
                    cols: {
                        $push: {
                            k: { $toString: '$_id.col' },
                            v: {
                                targets: '$targets',
                                total_count: '$totalCount'
                            }
                        }
                    }
                }
            },
            { $addFields: { cols: { $arrayToObject: '$cols' } } },
            { $sort: { _id: 1 } }
        );

        const result = await Patient.aggregate(pipeline);

        // ✅ Ensure all targets exist with 0 count if missing
        const pivotData = result.map(item => {
            const rowObj = { row: item._id };

            Object.entries(item.cols).forEach(([col, val]) => {
                const completedTargets = {};
                ALL_TARGETS.forEach(t => {
                    if (val.targets[t]) {
                        completedTargets[t] = val.targets[t];
                    } else {
                        completedTargets[t] = { count: 0, percentage: 0 };
                    }
                });

                rowObj[col] = {
                    targets: completedTargets,
                    total_count: val.total_count
                };
            });

            return rowObj;
        });

        res.json({ data: pivotData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getCustomPivot };
