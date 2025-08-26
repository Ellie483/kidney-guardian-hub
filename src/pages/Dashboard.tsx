import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Droplets,
  AlertTriangle,
  Users,
  BookOpen,
  Gamepad2,
  FlaskConical
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/kidney-hero.jpg";

interface DashboardProps {
  user: {
    name: string;
    email: string;
    age?: string;
    gender?: string;
    heightFeet?: string;
    heightInches?: string;
    weight?: string;
    bloodType?: string;
    medicalConditions?: string[];
    medications?: string;
    familyHistory?: string;
    smoke?: string;
    physicalActivity?: "Low" | "Medium" | "High";
    registeredAt?: string;
  };
}

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Sarah M.",
    age: 45,
    stage: "Stage 2",
    story: "Managed to improve her kidney function through lifestyle changes.",
    medicalConditions: ["Diabetes"],
    matchReasons: ["Also has diabetes", "Regular exerciser"]
  },
  {
    id: 2,
    name: "James R.",
    age: 52,
    stage: "Stage 3",
    story: "Successfully quit smoking and lowered his blood pressure.",
    medicalConditions: ["Hypertension"],
    matchReasons: ["Former smoker", "Managing blood pressure"]
  },
  {
    id: 3,
    name: "Maria L.",
    age: 38,
    stage: "Stage 1",
    story: "Early detection helped her maintain healthy kidneys.",
    medicalConditions: ["Family history"],
    matchReasons: ["Family history", "Proactive about health"]
  }
];

export default function Dashboard({ user }: DashboardProps) {
  const [healthScore, setHealthScore] = useState(0);

  // Recalculate health score whenever user changes
  useEffect(() => {
    const conditionWeights: Record<string, number> = {
      Diabetes: 2,
      Hypertension: 1,
      CKD: 3,
      "Family history": 1
    };

    const medicalRisk = (user.medicalConditions || []).reduce(
      (sum, cond) => sum + (conditionWeights[cond] || 1),
      0
    );
    const smokeRisk = user.smoke === "Yes" ? 2 : 0;
    const familyHistoryRisk = user.familyHistory === "Yes" ? 1 : 0;

    const activityBonus =
      user.physicalActivity === "High" ? 4 :
      user.physicalActivity === "Medium" ? 2 : 0;

    const score = Math.max(
      0,
      Math.min(100, 100 - (medicalRisk + smokeRisk + familyHistoryRisk) * 15 + activityBonus)
    );
    setHealthScore(score);
  }, [user]);

  // Personalized tips
  const getPersonalizedTips = () => {
    const tips: string[] = [];
    if (user.smoke === "Yes") tips.push("Consider reducing smoking/alcohol consumption for kidney health.");
    if (user.medicalConditions?.includes("Diabetes")) tips.push("Monitor your blood sugar levels regularly.");
    if (user.medicalConditions?.includes("Hypertension")) tips.push("Keep your blood pressure under control.");
    if (!user.age) tips.push("Stay physically active to maintain kidney health.");
    if (user.familyHistory === "Yes") tips.push("Regular check-ups are important due to family history.");
    if (user.physicalActivity !== "High") tips.push("Increase physical activity for better health.");
    tips.push("Drink 8-10 glasses of water daily.");
    tips.push("Limit processed foods and excess sodium.");
    return tips.slice(0, 4);
  };
  const personalizedTips = getPersonalizedTips();

  // Similar patients
  const getSimilarPatients = () => {
    return mockPatients
      .filter(patient => (user.medicalConditions || []).some(cond => (patient.medicalConditions || []).includes(cond)))
      .slice(0, 2);
  };
  const similarPatients = getSimilarPatients();

  // Risk factors alert
  const riskFactors = (user.medicalConditions?.length || 0) + (user.smoke === "Yes" ? 1 : 0) + (user.familyHistory === "Yes" ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center rounded-b-3xl mx-4 mt-4 relative overflow-hidden"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60" />
          <div className="relative h-full flex items-center justify-center text-center text-white p-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-lg opacity-90">
                Your personalized kidney health dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <Card className="lg:col-span-1 shadow-card border-0 animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Health Score</span>
              </CardTitle>
              <CardDescription>Based on your lifestyle assessment</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative">
                <div className="text-4xl font-bold text-primary mb-2">{healthScore}</div>
                <Progress value={healthScore} className="h-3 mb-4" />
                <div className="flex items-center justify-center space-x-2">
                  {healthScore >= 80 ? (
                    <Badge variant="default" className="bg-secondary text-secondary-foreground">Excellent</Badge>
                  ) : healthScore >= 60 ? (
                    <Badge variant="secondary">Good</Badge>
                  ) : (
                    <Badge variant="destructive">Needs Attention</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 shadow-card border-0 animate-fade-in">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start your kidney health journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/patients">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full hover:shadow-hover transition-shadow">
                    <Users className="h-6 w-6" />
                    <span className="text-xs">Meet Patients</span>
                  </Button>
                </Link>
                <Link to="/awareness">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full hover:shadow-hover transition-shadow">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-xs">Learn Facts</span>
                  </Button>
                </Link>
                <Link to="/games">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full hover:shadow-hover transition-shadow">
                    <Gamepad2 className="h-6 w-6" />
                    <span className="text-xs">Play Games</span>
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full hover:shadow-hover transition-shadow">
                    <FlaskConical className="h-6 w-6" />
                    <span className="text-xs">Lab Analysis</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Tips */}
          <Card className="lg:col-span-2 shadow-card border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span>Your Personalized Tips</span>
              </CardTitle>
              <CardDescription>Recommendations based on your lifestyle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalizedTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Similar Patients */}
          <Card className="lg:col-span-1 shadow-card border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-secondary" />
                <span>Similar Journeys</span>
              </CardTitle>
              <CardDescription>Patients with similar profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {similarPatients.map(patient => (
                  <div key={patient.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{patient.name}</span>
                      <Badge variant="outline" className="text-xs">{patient.stage}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{patient.story}</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.matchReasons.slice(0, 2).map((reason, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{reason}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                <Link to="/patients">
                  <Button variant="outline" size="sm" className="w-full">Meet More Patients</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Factors Alert */}
        {riskFactors > 2 && (
          <Card className="mt-6 border-warning bg-warning/5 shadow-card animate-pulse-gentle">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <div>
                  <h4 className="font-medium text-warning-foreground">Multiple Risk Factors Detected</h4>
                  <p className="text-sm text-muted-foreground">
                    You have {riskFactors} risk factors. Consider consulting with a healthcare provider for personalized advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
