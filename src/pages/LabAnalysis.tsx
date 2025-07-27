import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlaskConical, TrendingUp, AlertTriangle, CheckCircle, Info, Heart } from "lucide-react";
import { toast } from "sonner";

interface LabResult {
  creatinine: number;
  bun: number;
  egfr: number;
  protein: string;
  bloodPressure: string;
  glucose: number;
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

  const handleInputChange = (field: keyof LabResult, value: string) => {
    setLabResults(prev => ({
      ...prev,
      [field]: field === 'protein' || field === 'bloodPressure' ? value : parseFloat(value) || 0
    }));
  };

  const calculateCKDStage = (egfr: number): { stage: string; stageNumber: number } => {
    if (egfr >= 90) return { stage: "Stage 1 (Normal or High)", stageNumber: 1 };
    if (egfr >= 60) return { stage: "Stage 2 (Mild decrease)", stageNumber: 2 };
    if (egfr >= 30) return { stage: "Stage 3 (Moderate decrease)", stageNumber: 3 };
    if (egfr >= 15) return { stage: "Stage 4 (Severe decrease)", stageNumber: 4 };
    return { stage: "Stage 5 (Kidney failure)", stageNumber: 5 };
  };

  const getRiskLevel = (stageNumber: number, creatinine: number, bun: number): string => {
    if (stageNumber >= 4) return "High";
    if (stageNumber === 3 && (creatinine > 2.0 || bun > 40)) return "Moderate-High";
    if (stageNumber === 3) return "Moderate";
    if (stageNumber === 2 && (creatinine > 1.2 || bun > 25)) return "Low-Moderate";
    return "Low";
  };

  const generateExplanations = (results: LabResult): Record<string, string> => {
    const explanations: Record<string, string> = {};

    // Creatinine explanation
    if (results.creatinine <= 1.2) {
      explanations.creatinine = "Normal - Your kidneys are filtering waste effectively.";
    } else if (results.creatinine <= 2.0) {
      explanations.creatinine = "Elevated - Indicates some kidney function impairment.";
    } else {
      explanations.creatinine = "High - Suggests significant kidney function decline.";
    }

    // BUN explanation
    if (results.bun <= 20) {
      explanations.bun = "Normal - Good kidney waste elimination.";
    } else if (results.bun <= 40) {
      explanations.bun = "Elevated - May indicate kidney function concerns.";
    } else {
      explanations.bun = "High - Suggests significant kidney impairment.";
    }

    // eGFR explanation
    if (results.egfr >= 90) {
      explanations.egfr = "Excellent - Optimal kidney filtration rate.";
    } else if (results.egfr >= 60) {
      explanations.egfr = "Good - Mild decrease but still adequate function.";
    } else if (results.egfr >= 30) {
      explanations.egfr = "Concerning - Moderate kidney function decline.";
    } else if (results.egfr >= 15) {
      explanations.egfr = "Severe - Significant kidney function impairment.";
    } else {
      explanations.egfr = "Critical - Kidney failure range.";
    }

    // Protein explanation
    if (results.protein === "Negative" || results.protein === "Trace") {
      explanations.protein = "Good - Minimal protein loss indicates healthy kidney filtering.";
    } else if (results.protein === "1+" || results.protein === "2+") {
      explanations.protein = "Concerning - Moderate protein loss may indicate kidney damage.";
    } else {
      explanations.protein = "High - Significant protein loss suggests kidney damage.";
    }

    // Blood pressure explanation
    const [systolic, diastolic] = results.bloodPressure.split('/').map(Number);
    if (systolic < 120 && diastolic < 80) {
      explanations.bloodPressure = "Normal - Healthy blood pressure supports kidney function.";
    } else if (systolic < 140 && diastolic < 90) {
      explanations.bloodPressure = "Elevated - May contribute to kidney damage over time.";
    } else {
      explanations.bloodPressure = "High - Can accelerate kidney disease progression.";
    }

    return explanations;
  };

  const generateRecommendations = (stageNumber: number, riskLevel: string): string[] => {
    const recommendations = [];
    
    if (stageNumber >= 3) {
      recommendations.push("Consult a nephrologist (kidney specialist) regularly");
      recommendations.push("Monitor blood pressure closely - target <130/80");
      recommendations.push("Follow a kidney-friendly diet (low sodium, controlled protein)");
    }
    
    if (stageNumber >= 2) {
      recommendations.push("Control diabetes if present - target HbA1c <7%");
      recommendations.push("Stay hydrated but don't overhydrate");
      recommendations.push("Avoid NSAIDs (ibuprofen, naproxen) when possible");
    }

    // Always include general recommendations
    recommendations.push("Maintain regular exercise as tolerated");
    recommendations.push("Don't smoke - smoking accelerates kidney disease");
    recommendations.push("Get annual kidney function tests");
    
    if (riskLevel === "High") {
      recommendations.push("Consider dialysis preparation if eGFR <20");
      recommendations.push("Discuss kidney transplant options");
    }

    return recommendations;
  };

  const getFollowUpSchedule = (stageNumber: number): string => {
    switch (stageNumber) {
      case 1:
      case 2:
        return "Annual kidney function tests recommended";
      case 3:
        return "Check kidney function every 6 months";
      case 4:
        return "Check kidney function every 3 months";
      case 5:
        return "Monthly monitoring required";
      default:
        return "Follow up as recommended by your doctor";
    }
  };

  const analyzeResults = () => {
    if (!labResults.creatinine || !labResults.bun || !labResults.egfr || 
        !labResults.protein || !labResults.bloodPressure) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const results = labResults as LabResult;
      const { stage, stageNumber } = calculateCKDStage(results.egfr);
      const riskLevel = getRiskLevel(stageNumber, results.creatinine, results.bun);
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

      setIsAnalyzing(false);
      toast.success("Lab results analyzed successfully!");
    }, 2000);
  };

  const resetAnalysis = () => {
    setLabResults({});
    setAnalysis(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low": return "text-secondary";
      case "Low-Moderate": return "text-blue-600";
      case "Moderate": return "text-warning";
      case "Moderate-High": return "text-orange-600";
      case "High": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStageColor = (stageNumber: number) => {
    switch (stageNumber) {
      case 1:
      case 2: return "bg-secondary text-secondary-foreground";
      case 3: return "bg-warning/10 text-warning-foreground border border-warning/20";
      case 4: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-200";
      case 5: return "bg-destructive/10 text-destructive-foreground border border-destructive/20";
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
            Upload your lab results for AI-powered analysis and personalized explanations of your kidney health.
          </p>
        </div>

        {!analysis ? (
          /* Input Form */
          <Card className="shadow-card border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5" />
                <span>Enter Your Lab Values</span>
              </CardTitle>
              <CardDescription>
                Input your recent lab test results. We'll analyze them and provide detailed explanations.
              </CardDescription>
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
                  <Label htmlFor="creatinine">Serum Creatinine (mg/dL)</Label>
                  <Input
                    id="creatinine"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.2"
                    value={labResults.creatinine || ''}
                    onChange={(e) => handleInputChange('creatinine', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 0.7-1.3 mg/dL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bun">Blood Urea Nitrogen (mg/dL)</Label>
                  <Input
                    id="bun"
                    type="number"
                    placeholder="e.g., 18"
                    value={labResults.bun || ''}
                    onChange={(e) => handleInputChange('bun', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 7-20 mg/dL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="egfr">eGFR (mL/min/1.73m²)</Label>
                  <Input
                    id="egfr"
                    type="number"
                    placeholder="e.g., 85"
                    value={labResults.egfr || ''}
                    onChange={(e) => handleInputChange('egfr', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: &gt;90 mL/min/1.73m²</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
                  <Input
                    id="glucose"
                    type="number"
                    placeholder="e.g., 95"
                    value={labResults.glucose || ''}
                    onChange={(e) => handleInputChange('glucose', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 70-100 mg/dL (fasting)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Urine Protein</Label>
                  <select
                    id="protein"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={labResults.protein || ''}
                    onChange={(e) => handleInputChange('protein', e.target.value)}
                  >
                    <option value="">Select result</option>
                    <option value="Negative">Negative</option>
                    <option value="Trace">Trace</option>
                    <option value="1+">1+</option>
                    <option value="2+">2+</option>
                    <option value="3+">3+</option>
                    <option value="4+">4+</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Normal: Negative or Trace</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    type="text"
                    placeholder="e.g., 120/80"
                    value={labResults.bloodPressure || ''}
                    onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: &lt;120/80 mmHg</p>
                </div>
              </div>

              <Button 
                onClick={analyzeResults}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? "Analyzing Results..." : "Analyze Lab Results"}
              </Button>
            </CardContent>
          </Card>
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">CKD Stage</h3>
                    <Badge className={`text-lg px-4 py-2 ${getStageColor(analysis.stageNumber)}`}>
                      {analysis.stage}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk Level</h3>
                    <div className={`text-2xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                      {analysis.riskLevel}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">eGFR</h3>
                    <div className="text-2xl font-bold text-primary">
                      {labResults.egfr} mL/min/1.73m²
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Explanations */}
            <Card className="shadow-card border-0 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Detailed Value Explanations</span>
                </CardTitle>
                <CardDescription>
                  Understanding what each test result means for your kidney health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.explanations).map(([key, explanation]) => (
                    <div key={key} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {key === 'egfr' ? 'eGFR' : key === 'bun' ? 'BUN' : key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <Badge variant="outline">
                          {key === 'creatinine' && `${labResults.creatinine} mg/dL`}
                          {key === 'bun' && `${labResults.bun} mg/dL`}
                          {key === 'egfr' && `${labResults.egfr} mL/min/1.73m²`}
                          {key === 'protein' && labResults.protein}
                          {key === 'bloodPressure' && `${labResults.bloodPressure} mmHg`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{explanation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <CardDescription>
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
                      <p className="text-sm">{recommendation}</p>
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
                  <AlertDescription>
                    <strong>{analysis.followUp}</strong> - Regular monitoring is essential for managing kidney health.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button onClick={resetAnalysis} variant="outline">
                Analyze New Results
              </Button>
              <Button onClick={() => window.print()}>
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
                <p className="text-sm text-muted-foreground">
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