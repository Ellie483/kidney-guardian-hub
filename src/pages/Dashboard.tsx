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
  Activity,
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
    smokeAlcohol?: string;
    registeredAt?: string;
  };
}

// Mock patient data for similarity matching
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
  // Risk factors: count medical conditions + smoking/alcohol
  const riskFactors =
    (user.medicalConditions?.length || 0) +
    (user.smokeAlcohol === "Yes" ? 1 : 0);

  const healthScore = Math.max(20, 100 - riskFactors * 15);

  // Personalized tips based on Step 2 data
  const getPersonalizedTips = () => {
    const tips: string[] = [];

    if (user.smokeAlcohol === "Yes") tips.push("Consider reducing smoking/alcohol consumption for kidney health.");
    if (user.medicalConditions?.includes("Diabetes")) tips.push("Monitor your blood sugar levels regularly.");
    if (user.medicalConditions?.includes("Hypertension")) tips.push("Keep your blood pressure under control.");
    if (!user.age) tips.push("Stay physically active to maintain kidney health.");
    if (user.familyHistory === "Yes") tips.push("Regular check-ups are important due to family history.");
    tips.push("Drink 8-10 glasses of water daily.");
    tips.push("Limit processed foods and excess sodium.");

    return tips.slice(0, 4); // top 4 tips
  };

  const getSimilarPatients = () => {
    return mockPatients
      .filter(patient => {
        const userConditions = user.medicalConditions || [];
        const patientConditions = patient.medicalConditions || [];
        return userConditions.some(cond => patientConditions.includes(cond));
      })
      .slice(0, 2);
  };

  const personalizedTips = getPersonalizedTips();
  const similarPatients = getSimilarPatients();

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-80 bg-cover bg-center rounded-3xl mx-4 mt-4 relative overflow-hidden shadow-glow animate-float"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero backdrop-blur-sm" />
          <div className="relative h-full flex items-center justify-center text-center text-white p-6">
            <div className="animate-fade-in">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm animate-glow-pulse">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                Welcome back, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-xl opacity-90 font-light">
                Your personalized kidney health journey continues
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <Card className="lg:col-span-1 shadow-glow border-0 animate-fade-in bg-gradient-card hover:shadow-warm transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center space-x-2 text-lg">
                <div className="p-2 bg-gradient-primary rounded-full shadow-glow">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">Health Score</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">Based on your lifestyle assessment</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative p-6">
                <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-glow-pulse">{healthScore}</div>
                <Progress value={healthScore} className="h-4 mb-6 shadow-medical" />
                <div className="flex items-center justify-center">
                  {healthScore >= 80 ? (
                    <Badge variant="default" className="bg-gradient-secondary text-white px-4 py-2 shadow-hover animate-shimmer">
                      ✨ Excellent
                    </Badge>
                  ) : healthScore >= 60 ? (
                    <Badge variant="secondary" className="px-4 py-2 shadow-hover">💚 Good</Badge>
                  ) : (
                    <Badge variant="destructive" className="px-4 py-2 shadow-hover">⚠️ Needs Attention</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 shadow-glow border-0 animate-fade-in bg-gradient-card hover:shadow-warm transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="p-2 bg-gradient-secondary rounded-full shadow-glow">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-secondary bg-clip-text text-transparent font-bold">Quick Actions</span>
              </CardTitle>
              <CardDescription>Start your kidney health journey today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/patients">
                  <Button variant="outline" className="h-24 flex flex-col space-y-3 w-full hover:shadow-glow hover:bg-gradient-primary hover:text-white transition-all duration-300 group border-2 hover:border-primary/50">
                    <div className="p-2 bg-gradient-primary rounded-full group-hover:bg-white/20">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">Meet Patients</span>
                  </Button>
                </Link>
                <Link to="/awareness">
                  <Button variant="outline" className="h-24 flex flex-col space-y-3 w-full hover:shadow-glow hover:bg-gradient-secondary hover:text-white transition-all duration-300 group border-2 hover:border-secondary/50">
                    <div className="p-2 bg-gradient-secondary rounded-full group-hover:bg-white/20">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">Learn Facts</span>
                  </Button>
                </Link>
                <Link to="/games">
                  <Button variant="outline" className="h-24 flex flex-col space-y-3 w-full hover:shadow-glow hover:bg-gradient-warm hover:text-white transition-all duration-300 group border-2 hover:border-warning/50">
                    <div className="p-2 bg-gradient-warm rounded-full group-hover:bg-white/20">
                      <Gamepad2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">Play Games</span>
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="outline" className="h-24 flex flex-col space-y-3 w-full hover:shadow-glow hover:bg-gradient-primary hover:text-white transition-all duration-300 group border-2 hover:border-accent/50">
                    <div className="p-2 bg-gradient-primary rounded-full group-hover:bg-white/20">
                      <FlaskConical className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">Lab Analysis</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Tips */}
          <Card className="lg:col-span-2 shadow-glow border-0 animate-slide-up bg-gradient-card hover:shadow-warm transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="p-2 bg-gradient-primary rounded-full shadow-glow">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">Your Personalized Tips</span>
              </CardTitle>
              <CardDescription>Recommendations tailored just for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-muted/30 to-primary/5 rounded-xl border border-primary/10 hover:shadow-hover transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow group-hover:animate-glow-pulse">
                        <span className="text-sm font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{tip}</p>
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
