import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlaskConical, TrendingUp, AlertTriangle, CheckCircle, Info, Heart, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface LabResult {
  age_of_the_patient: number;
  body_mass_index_bmi: number;
  blood_pressure_mmhg: number;
  smoking_status: string;
  physical_activity_level: string;
  family_history_of_chronic_kidney_disease: string;

  duration_of_diabetes_mellitus_years: string;
  duration_of_hypertension_years: string;
  coronary_artery_disease_yesno: string;
  appetite_goodpoor: string;

  serum_creatinine_mgdl: number;
  estimated_glomerular_filtration_rate_egfr: number;
  blood_urea_mgdl: number;
  sodium_level_meql: number;
  potassium_level_meql: number;
  random_blood_glucose_level_mgdl: number;
  specific_gravity_of_urine: number;
  red_blood_cells_in_urine: string;
  pus_cells_in_urine: string;
  bacteria_in_urine: string;
}

interface Analysis {
  stage: string;
  stageNumber: number;
  riskLevel: string;
  explanations: Record<string, string>;
  recommendations: string[];
  followUp: string;
}

export default function LabAnalysis() {
  const [labResults, setLabResults] = useState<Partial<LabResult>>({});
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('lifestyle');
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof LabResult, value: string) => {
    setLabResults(prev => ({
      ...prev,
      [field]: field ==='smoking_status' || field === 'duration_of_diabetes_mellitus_years' || field === 'duration_of_hypertension_years' ||
      field ==='physical_activity_level' || field === 'family_history_of_chronic_kidney_disease' || field === 'coronary_artery_disease_yesno' || 
      field ==='appetite_goodpoor' || field ==='red_blood_cells_in_urine' ||
      field ==='pus_cells_in_urine' || field ==='bacteria_in_urine'
       ? value : parseFloat(value) || 0
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsOffset = tabsRef.current.offsetTop;
        setIsSticky(window.scrollY > tabsOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCKDStage = (predicted_condition: string): { stage: string; stageNumber: number } => {
    if (predicted_condition == "no_disease") return { stage: "Stage 0 (Normal)", stageNumber: 0 };
    if (predicted_condition == "low_risk") return { stage: "Stage 1 (A little decrease)", stageNumber: 1 };
    if (predicted_condition == "moderate_risk") return { stage: "Stage 2 (Moderate decrease)", stageNumber: 2 };
    if (predicted_condition == "high_risk") return { stage: "Stage 3 (High decrease)", stageNumber: 3 };
    return { stage: "Stage 4 (Kidney failure)", stageNumber: 4 };
  };

  const getRiskLevel = (predicted_condition: string): string => {
    if (predicted_condition == "no_disease") return "No Risk";
    if (predicted_condition == "low_risk") return "Low Risk";
    if (predicted_condition == "moderate_risk") return "Moderate Risk";
    if (predicted_condition == "high_risk") return "High Risk";
    return "Severe Risk";
  };

  const generateExplanations = (results: LabResult): Record<string, string> => {
    const explanations: Record<string, string> = {};

    // Creatinine explanation
    if (results.serum_creatinine_mgdl <= 1.2) {
      explanations.creatinine = "Normal - Your kidneys are filtering waste effectively.";
    } else if (results.serum_creatinine_mgdl <= 2.0) {
      explanations.creatinine = "Elevated - Indicates some kidney function impairment.";
    } else {
      explanations.creatinine = "High - Suggests significant kidney function decline.";
    }

    // BUN explanation
    if (results.blood_urea_mgdl <= 20) {
      explanations.bun = "Normal - Good kidney waste elimination.";
    } else if (results.blood_urea_mgdl <= 40) {
      explanations.bun = "Elevated - May indicate kidney function concerns.";
    } else {
      explanations.bun = "High - Suggests significant kidney impairment.";
    }

    // eGFR explanation
    if (results.estimated_glomerular_filtration_rate_egfr >= 90) {
      explanations.egfr = "Excellent - Optimal kidney filtration rate.";
    } else if (results.estimated_glomerular_filtration_rate_egfr >= 60) {
      explanations.egfr = "Good - Mild decrease but still adequate function.";
    } else if (results.estimated_glomerular_filtration_rate_egfr >= 30) {
      explanations.egfr = "Concerning - Moderate kidney function decline.";
    } else if (results.estimated_glomerular_filtration_rate_egfr >= 15) {
      explanations.egfr = "Severe - Significant kidney function impairment.";
    } else {
      explanations.egfr = "Critical - Kidney failure range.";
    }

    // Sodium explanation (Normal: 135–145 mEq/L)
    if (results.sodium_level_meql < 135) {
      explanations.sodium = "Low - May indicate hyponatremia (electrolyte imbalance).";
    } else if (results.sodium_level_meql <= 145) {
      explanations.sodium = "Normal - Balanced sodium level.";
    } else {
      explanations.sodium = "High - May indicate hypernatremia, dehydration, or other concerns.";
    }

    // Potassium explanation (Normal: 3.5–5.0 mEq/L)
    if (results.potassium_level_meql < 3.5) {
      explanations.potassium = "Low - Hypokalemia, can affect heart and muscle function.";
    } else if (results.potassium_level_meql <= 5.0) {
      explanations.potassium = "Normal - Healthy potassium balance.";
    } else {
      explanations.potassium = "High - Hyperkalemia, may affect heart rhythm and kidney function.";
    }

    return explanations;
  };

  const generateRecommendations = (stageNumber: number, riskLevel: string): string[] => {
    const recommendations = [];
    
    if (stageNumber >= 3) {
      recommendations.push("Consult a nephrologist (kidney specialist) regularly");
      recommendations.push("Monitor blood pressure closely - target <130/80");
      recommendations.push("Follow a kidney-friendly diet (low sodium)");
    }
    
    if (stageNumber >= 2) {
      recommendations.push("Control diabetes if present - target HbA1c <7%");
      recommendations.push("Stay hydrated but don't overhydrate");
      recommendations.push("Avoid NSAIDs (ibuprofen, naproxen) when possible");
    }

    // Always include general recommendations
    recommendations.push("Maintain regular exercise as tolerated");
    recommendations.push("Get annual kidney function tests");
    
    if (riskLevel === "High Risk") {
      recommendations.push("Consider dialysis preparation if eGFR <20");
      recommendations.push("Discuss kidney transplant options");
    }

    return recommendations;
  };

  const getFollowUpSchedule = (stageNumber: number): string => {
    switch (stageNumber) {
      case 0:
      case 1:
        return "Annual kidney function tests recommended";
      case 2:
        return "Check kidney function every 6 months";
      case 3:
        return "Check kidney function every 3 months";
      case 4:
        return "Monthly monitoring required";
      default:
        return "Follow up as recommended by your doctor";
    }
  };

  const analyzeResults = async () => {
    // if(!labResults.serum_creatinine_mgdl) {
    if ( !labResults.age_of_the_patient || !labResults.body_mass_index_bmi || !labResults.blood_pressure_mmhg
      || !labResults.smoking_status || !labResults.physical_activity_level || !labResults.family_history_of_chronic_kidney_disease
      || !labResults.duration_of_diabetes_mellitus_years || !labResults.duration_of_hypertension_years || !labResults.coronary_artery_disease_yesno 
      || !labResults.appetite_goodpoor || !labResults.serum_creatinine_mgdl || !labResults.estimated_glomerular_filtration_rate_egfr
      || !labResults.blood_urea_mgdl || !labResults.sodium_level_meql || !labResults.potassium_level_meql
     ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {

      setIsAnalyzing(true);

      const response = await fetch("http://localhost:5000/api/lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(labResults),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Analysis Result:", result);

      // Simulate analysis delay
      setTimeout(() => {
        const results = labResults as LabResult;
        const { stage, stageNumber } = getCKDStage(result["predicted_condition"]);
        const riskLevel = getRiskLevel(result["predicted_condition"]);
        const explanations = generateExplanations(results);
        const recommendations = generateRecommendations(stageNumber, riskLevel);
        const followUp = getFollowUpSchedule(stageNumber);

        setAnalysis({
          stage,
          stageNumber,
          riskLevel,
          explanations,
          recommendations,
          followUp
        });
        
        toast.success("Lab results analyzed successfully!");
      }, 0);

    } catch (error) {
      console.error("Full error details:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
    
  };

  const resetAnalysis = () => {
    setLabResults({});
    setAnalysis(null);
    setActiveTab('lifestyle');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "No Risk": return "text-secondary";
      case "Low Risk": return "text-blue-600";
      case "Moderate Risk": return "text-warning";
      case "High Risk": return "text-orange-600";
      case "Severe Risk": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStageColor = (stageNumber: number) => {
    switch (stageNumber) {
      case 0:
      case 1: return "bg-secondary text-secondary-foreground";
      //case 2: return "bg-warning/1 text-warning border border-warning/1";
      case 2: return "bg-warning text-warning-foreground border border-warning";
      case 3: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-200";
      case 4: return "bg-destructive text-destructive-foreground border border-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <FlaskConical className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Lab Result Analysis</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your lab results and lifestyle habits for AI-powered analysis and personalized explanations of your kidney health.
          </p>
        </div>

        {!analysis ? (
          <div>
            {/* Sticky Tabs */}
            <div className="relative">
              <div
                ref={tabsRef}
                className={`flex bg-white rounded-lg shadow-md mb-6 ${isSticky ? 'fixed z-50 shadow-lg' : ''}`}
                style={isSticky ? { top: '50px', width: tabsRef.current?.offsetWidth } : {}}
              >
                <button
                  className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'lifestyle' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}
                  onClick={() => setActiveTab('lifestyle')}
                >
                  Lifestyle
                </button>
                <button
                  className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'background' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}
                  onClick={() => setActiveTab('background')}
                >
                  Background Disease
                </button>
                <button
                  className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'lab' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}
                  onClick={() => setActiveTab('lab')}
                >
                  Lab Results
                </button>
              </div>
            </div>

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Lifestyle Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This information helps us provide personalized recommendations for improving your health and wellness.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age_of_the_patient" className="text-[16px]">Age <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="age_of_the_patient"
                        type="number"
                        placeholder="e.g., 30"
                        min = "1"
                        max = "120"
                        value={labResults.age_of_the_patient || ''}
                        onChange={(e) => handleInputChange('age_of_the_patient', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body_mass_index_bmi" className="text-[16px]">Body Mass Index <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="body_mass_index_bmi"
                        type="number"
                        placeholder="e.g., 25"
                        min = "1"
                        max = "50"
                        value={labResults.body_mass_index_bmi || ''}
                        onChange={(e) => handleInputChange('body_mass_index_bmi', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_pressure_mmhg" className="text-[16px]">Usual blood pressure <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="blood_pressure_mmhg"
                        type="number"
                        placeholder="e.g., 120"
                        min = "1"
                        max = "300"
                        value={labResults.blood_pressure_mmhg || ''}
                        onChange={(e) => handleInputChange('blood_pressure_mmhg', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smoking_status" className="text-[16px]">Smoking? <span className="text-red-500 text-xl">*</span></Label>
                      <select
                        id="smoking_status"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.smoking_status || ''}
                        onChange={(e) => handleInputChange('smoking_status', e.target.value)}
                      >
                        <option value="">Select Yes/No</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physical_activity_level" className="text-[16px]">Do physical activity regularly? <span className="text-red-500 text-xl">*</span></Label>
                      <select
                        id="physical_activity_level"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.physical_activity_level || ''}
                        onChange={(e) => handleInputChange('physical_activity_level', e.target.value)}
                      >
                        <option value="">Select One</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="family_history_of_chronic_kidney_disease" className="text-[16px]">Do you have family history? <span className="text-red-500 text-xl">*</span></Label>
                      <select
                        id="family_history_of_chronic_kidney_disease"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.family_history_of_chronic_kidney_disease || ''}
                        onChange={(e) => handleInputChange('family_history_of_chronic_kidney_disease', e.target.value)}
                      >
                        <option value="">Select Yes/No</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setActiveTab('background')}>
                    Save Lifestyle Information
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Background Disease Tab */}
            {activeTab === 'background' && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Medical Background</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This information is crucial for accurate assessment and personalized recommendations.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration_of_diabetes_mellitus_years" className="text-[16px]">Duration of diabetes sufferring (if you have) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="duration_of_diabetes_mellitus_years"
                        type="text"
                        placeholder="e.g., 5"
                        max = "100"
                        value={labResults.duration_of_diabetes_mellitus_years || ''}
                        onChange={(e) => handleInputChange('duration_of_diabetes_mellitus_years', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">If you don't have diabetes, type 0.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration_of_hypertension_years" className="text-[16px]">Duration of hypertension sufferring (if you have) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="duration_of_hypertension_years"
                        type="text"
                        placeholder="e.g., 5"
                        max = "100"
                        value={labResults.duration_of_hypertension_years || ''}
                        onChange={(e) => handleInputChange('duration_of_hypertension_years', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">If you don't have hypertension, type 0.</p>
                    </div>
                      
                    <div className="space-y-2">
                      <Label htmlFor="coronary_artery_disease_yesno" className="text-[16px]">Do you have coronary artery disease? <span className="text-red-500 text-xl">*</span></Label>
                      <select
                        id="coronary_artery_disease_yesno"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.coronary_artery_disease_yesno || ''}
                        onChange={(e) => handleInputChange('coronary_artery_disease_yesno', e.target.value)}
                      >
                        <option value="">Select Yes/No</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appetite_goodpoor" className="text-[16px]">Do you have a normal appetite? <span className="text-red-500 text-xl">*</span></Label>
                      <select
                        id="appetite_goodpoor"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.appetite_goodpoor || ''}
                        onChange={(e) => handleInputChange('appetite_goodpoor', e.target.value)}
                      >
                        <option value="">Select Yes/No</option>
                        <option value="good">Yes</option>
                        <option value="poor">No</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setActiveTab('lab')}>
                    Save Medical Background
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Lab Results Tab */}
            {activeTab === 'lab' && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FlaskConical className="h-5 w-5" />
                    <span>Enter Your Lab Values</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This tool provides educational information only. Always consult your healthcare provider for medical advice.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serum_creatinine_mgdl" className="text-[16px]">Serum Creatinine (mg/dL) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="serum_creatinine_mgdl"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.8"
                        value={labResults.serum_creatinine_mgdl || ''}
                        onChange={(e) => handleInputChange('serum_creatinine_mgdl', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: 0.6-1.2 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimated_glomerular_filtration_rate_egfr" className="text-[16px]">eGFR (mL/min/1.73m²) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="estimated_glomerular_filtration_rate_egfr"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 90"
                        value={labResults.estimated_glomerular_filtration_rate_egfr || ''}
                        onChange={(e) => handleInputChange('estimated_glomerular_filtration_rate_egfr', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: &gt;90 mL/min/1.73m²</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_urea_mgdl" className="text-[16px]">Blood Urea Nitrogen (mg/dL) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="blood_urea_mgdl"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12"
                        value={labResults.blood_urea_mgdl || ''}
                        onChange={(e) => handleInputChange('blood_urea_mgdl', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: 7-20 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sodium_level_meql" className="text-[16px]">Sodium Level (mEq/L) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="sodium_level_meql"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 140"
                        value={labResults.sodium_level_meql || ''}
                        onChange={(e) => handleInputChange('sodium_level_meql', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: 135-145 mEq/L</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="potassium_level_meql" className="text-[16px]">Potassium Level (mEq/L) <span className="text-red-500 text-xl">*</span></Label>
                      <Input
                        id="potassium_level_meql"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 4.0"
                        value={labResults.potassium_level_meql || ''}
                        onChange={(e) => handleInputChange('potassium_level_meql', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: 3.5-5.0 mEq/L</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="random_blood_glucose_level_mgdl" className="text-[16px]">Random Blood Glucose (mg/dL)</Label>
                      <Input
                        id="random_blood_glucose_level_mgdl"
                        type="number"
                        placeholder="e.g., 100"
                        value={labResults.random_blood_glucose_level_mgdl || ''}
                        onChange={(e) => handleInputChange('random_blood_glucose_level_mgdl', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: &lt;140 mg/dL (non-fasting)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specific_gravity_of_urine" className="text-[16px]">Urine Specific Gravity</Label>
                      <Input
                        id="specific_gravity_of_urine"
                        type="number"
                        step="0.001"
                        placeholder="e.g., 1.010"
                        value={labResults.specific_gravity_of_urine || ''}
                        onChange={(e) => handleInputChange('specific_gravity_of_urine', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground text-[14px]">Normal: 1.005-1.030</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="red_blood_cells_in_urine" className="text-[16px]">Red Blood Cells in Urine</Label>
                      <select
                        id="red_blood_cells_in_urine"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.red_blood_cells_in_urine || ''}
                        onChange={(e) => handleInputChange('red_blood_cells_in_urine', e.target.value)}
                      >
                        <option value="">Select One</option>
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pus_cells_in_urine" className="text-[16px]">White Blood Cells in Urine</Label>
                      <select
                        id="pus_cells_in_urine"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.pus_cells_in_urine || ''}
                        onChange={(e) => handleInputChange('pus_cells_in_urine', e.target.value)}
                      >
                        <option value="">Select One</option>
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bacteria_in_urine" className="text-[16px]">Bacteria in Urine</Label>
                      <select
                        id="bacteria_in_urine"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={labResults.bacteria_in_urine || ''}
                        onChange={(e) => handleInputChange('bacteria_in_urine', e.target.value)}
                      >
                        <option value="">Select One</option>
                        <option value="not present">Not Present</option>
                        <option value="present">Present</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={analyzeResults}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? "Analyzing Results..." : "Analyze Lab Results"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Overall Assessment */}
            <Card className="shadow-card border-0 animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <Heart className="h-6 w-6" />
                  <span>Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 text-[16px]"><b>CKD Stage</b></h3>
                    <Badge className={`text-lg px-4 py-2 ${getStageColor(analysis.stageNumber)}`}>
                      {analysis.stage}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 text-[16px]"><b>Risk Level</b></h3>
                    <div className={`text-2xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                      {analysis.riskLevel}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 text-[16px]"><b>eGFR</b></h3>
                    <div className="text-2xl font-bold text-primary">
                      {labResults.estimated_glomerular_filtration_rate_egfr} mL/min/1.73m²
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Explanations */}
            {/* <Card className="shadow-card border-0 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Detailed Value Explanations</span>
                </CardTitle>
                <CardDescription className="text-[16px]">
                  Understanding what each test result means for your kidney health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.explanations).map(([key, explanation]) => (
                    <div key={key} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {key === 'egfr'
                            ? 'eGFR'
                            : key === 'bun'
                            ? 'Blood Urea Nitrogen'
                            : key === 'creatinine'
                            ? 'Serum Creatinine'
                            : key === 'sodium'
                            ? 'Sodium Level'
                            : key === 'potassium'
                            ? 'Potassium Level'
                            : key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <Badge variant="outline">
                          {key === 'creatinine' && `${labResults.serum_creatinine_mgdl} mg/dL`}
                          {key === 'bun' && `${labResults.blood_urea_mgdl} mg/dL`}
                          {key === 'egfr' && `${labResults.estimated_glomerular_filtration_rate_egfr} mL/min/1.73m²`}
                          {key === 'sodium' && `${labResults.sodium_level_meql} mEq/L`}
                          {key === 'potassium' && `${labResults.potassium_level_meql} mEq/L`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground text-[16px]">{explanation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Recommendations */}
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <CardDescription className="text-[16px]">
                  Action steps to protect and improve your kidney health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                      </div>
                      <p className="text-[16px]">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Schedule */}
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Follow-up Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-[16px]">
                    <strong>{analysis.followUp}</strong> - Regular monitoring is essential for managing kidney health.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button onClick={resetAnalysis} variant="outline" className="text-[16px]">
                Analyze New Results
              </Button>
              <Button onClick={() => window.print()} className="text-[16px]">
                Print Results
              </Button>
            </div>
          </div>
        )}

        {/* Important Disclaimer */}
        <Card className="mt-8 border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Important Medical Disclaimer</h4>
                <p className="text-sm text-muted-foreground  text-[15px]">
                  This analysis is for educational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider for proper diagnosis, treatment, and medical guidance. 
                  Lab values can vary based on laboratory methods and individual factors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}