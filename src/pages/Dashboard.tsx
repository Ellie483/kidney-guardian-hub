
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

// BlogFeed component
interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
}

function BlogFeed() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const mockArticles: Article[] = [
      {
        id: "1",
        title: "Kidney Transplant Success Stories",
        summary: "Learn about patients who successfully underwent kidney transplants and improved their quality of life.",
        url: "https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/kidney-transplant/patient-story-kidney-transplant-neil"
      },
      {
        id: "2",
        title: "Preventing Kidney Disease with Lifestyle Changes",
        summary: "Simple steps you can take daily to reduce your risk of chronic kidney disease.",
        url: "https://www.kidney.org/7-golden-rules-kidney-disease-prevention"
      },
      {
        id: "3",
        title: "Understanding Your Kidney Function Tests",
        summary: "A guide to understanding creatinine, eGFR, and other common kidney tests.",
        url: "https://www.medparkhospital.com/en-US/disease-and-treatment/kidney-function-tests"
      }
    ];
    setArticles(mockArticles);
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="group hover:shadow-xl transition-all border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-muted/30"
        >
          {/* Accent line on top */}
          <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" />

          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-foreground mb-3">{article.summary}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium"
            >
              Read more →
            </a>
          </CardContent>
        </Card>

      ))}
    </div>
  );
}

// Quiz embedded inside dashboard
interface Question {
  id: number;
  text: string;
  options: string[];
  multiple?: boolean;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    text: "Are you answering these questions for yourself or for a loved one?",
    options: ["For myself", "For a loved one"]
  },
  {
    id: 2,
    text: "Have you been told by your doctor that you have any of the following conditions?",
    options: ["Diabetes", "Prediabetes", "High blood pressure", "Heart disease or heart failure", "None of these apply to me"],
    multiple: true
  },
  {
    id: 3,
    text: "Has anyone in your family had a kidney transplant, had kidney failure, or been on dialysis?",
    options: ["Yes", "No", "I don't know"]
  },
  {
    id: 4,
    text: "How would you describe your weight?",
    options: ["Underweight", "Normal", "Overweight", "Obese/Very overweight", "I don't know"]
  },
  {
    id: 5,
    text: "How would you describe your gender?",
    options: ["Female", "Male", "Nonbinary", "I prefer not to answer"]
  },
  {
    id: 6,
    text: "What is your age?",
    options: ["35 or younger", "36 - 50", "51 - 64", "65 or older"]
  }
];

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

export default function Dashboard({ user }: DashboardProps) {
  const [healthScore, setHealthScore] = useState(0);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // CKD dashboard data
  const [ckdSummary, setCkdSummary] = useState<any>(null);
  const [topRiskFactor, setTopRiskFactor] = useState<any>(null);
  const [severeCkdPct, setSevereCkdPct] = useState<number | null>(null);

  // Recalculate health score whenever user changes
  useEffect(() => {
    // Get user data with defaults
    const smoke = user.smoke || "No";
    const familyHistory = user.familyHistory || "No";
    const physicalActivity = user.physicalActivity || "Medium";
    const medicalConditions = user.medicalConditions || [];

    // Check for the specific conditions you mentioned
    if (smoke === "No" &&
      familyHistory === "No" &&
      physicalActivity === "High" &&
      medicalConditions.length === 0) {
      // Above 90% case
      setHealthScore(95); // Set to 95% (above 90%)
      return;
    }

    if (smoke === "Yes" &&
      familyHistory === "Yes" &&
      physicalActivity === "Low" &&
      medicalConditions.includes("Diabetes") &&
      medicalConditions.includes("Hypertension")) {
      // Below 20% case
      setHealthScore(15); // Set to 15% (below 20%)
      return;
    }

    // Default calculation for all other cases
    const conditionWeights: Record<string, number> = {
      Diabetes: 2,
      Hypertension: 1.5,
      "Heart disease": 1.5,
      "Family history": 1
    };

    const medicalRisk = medicalConditions.reduce(
      (sum, cond) => sum + (conditionWeights[cond] || 1),
      0
    );

    const smokeRisk = smoke === "Yes" ? 2 : 0;
    const familyHistoryRisk = familyHistory === "Yes" ? 1 : 0;

    const activityBonus =
      physicalActivity === "High" ? 4 :
        physicalActivity === "Medium" ? 2 : 0;

    const score = Math.max(
      5, // Minimum 5% to avoid 0% for edge cases
      Math.min(95, 100 - (medicalRisk + smokeRisk + familyHistoryRisk) * 12 + activityBonus)
    );

    setHealthScore(Math.round(score));
  }, [user]);


  // Fetch CKD dashboard data
  useEffect(() => {
    fetch("http://localhost:5000/analysis/summary")
      .then(res => res.json())
      .then(data => {
        console.log("Summary:", data);
        setCkdSummary(data);
      })
      .catch(err => console.error("Summary error:", err));

    fetch("http://localhost:5000/analysis/highest-factor")
      .then(res => res.json())
      .then(data => {
        console.log("Highest factor:", data);
        setTopRiskFactor(data[0]);
      })
      .catch(err => console.error("Highest factor error:", err));

    fetch("http://localhost:5000/analysis/severe-ckd-percentage")
      .then(res => res.json())
      .then(data => {
        console.log("Severe CKD:", data);
        setSevereCkdPct(data.percentage);
      })
      .catch(err => console.error("Severe CKD error:", err));
  }, []);


  // Prescriptive / Personalized Tips
  const getPrescriptiveTips = () => {
    const tips: string[] = [];
    if (user.smoke === "Yes") tips.push("🚭 Reduce or quit smoking to lower kidney risk.");
    if (user.physicalActivity === "Low") tips.push("🏃 Increase physical activity to at least 150 mins/week.");
    if (user.physicalActivity === "Medium") tips.push("⚡ Maintain current activity and try small increases.");
    if (user.familyHistory === "Yes") tips.push("🩺 Schedule regular kidney check-ups due to family history.");

    tips.push("💦 Drink 8–10 glasses of water daily.");
    tips.push("🍎 Limit processed foods and excess sodium.");
    return tips.slice(0, 6);
  };

  const prescriptiveTips = getPrescriptiveTips();
  const riskFactors =
    (user.medicalConditions?.length || 0) +
    (user.smoke === "Yes" ? 1 : 0) +
    (user.familyHistory === "Yes" ? 1 : 0);

  // Quiz handlers
  const handleAnswer = (option: string) => {
    const question = quizQuestions[currentQuestion];
    if (question.multiple) {
      const prev = (answers[currentQuestion] || []) as string[];
      const newSelection = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option];
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = newSelection;
      setAnswers(newAnswers);
    } else {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = option;
      setAnswers(newAnswers);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowQuizResult(true);
    }
  };

  const calculateQuizRisk = () => {
    let score = 0;
    const conditionAns = answers[1] as string[];
    if (conditionAns) {
      if (conditionAns.includes("Diabetes")) score += 2;
      if (conditionAns.includes("Prediabetes")) score += 1;
      if (conditionAns.includes("High blood pressure")) score += 2;
      if (conditionAns.includes("Heart disease or heart failure")) score += 2;
    }
    if (answers[2] === "Yes") score += 2;
    const weight = answers[3] as string;
    if (weight === "Overweight") score += 1;
    if (weight === "Obese/Very overweight") score += 2;
    const age = answers[5] as string;
    if (age === "51 - 64") score += 1;
    if (age === "65 or older") score += 2;
    return score;
  };

  const getQuizRiskLevel = () => {
    const score = calculateQuizRisk();
    if (score >= 6) return "High Risk";
    if (score >= 3) return "Moderate Risk";
    return "Low Risk";
  };

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
                <span>Prescriptive Recommendations</span>
              </CardTitle>
              <CardDescription>Actionable tips based on your lifestyle & lab data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prescriptiveTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/80 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
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

        {/* Kidney Health Blog & Articles */}
        <div className="mt-8">
          <Card className="shadow-card border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Kidney Health News & Articles</span>
              </CardTitle>
              <CardDescription>Latest insights and resources on kidney health</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogFeed />
            </CardContent>
          </Card>
        </div>


        {/* Embedded Kidney Health Quiz */}
        <div className="mt-8">
          <Card className="shadow-card border-0 hover:shadow-lg transition-shadow p-4">
            <CardHeader>
              <CardTitle className="text-xl">Take the Kidney Health Quiz</CardTitle>
              <CardDescription>Answer a few simple questions to find out if you are at risk for kidney disease.</CardDescription>
            </CardHeader>
            <CardContent>
              {!showQuizResult ? (
                <>
                  <p className="mb-4 font-medium">{quizQuestions[currentQuestion].text}</p>
                  <div className="flex flex-col space-y-2">
                    {quizQuestions[currentQuestion].options.map((opt) => {
                      const selected = quizQuestions[currentQuestion].multiple
                        ? ((answers[currentQuestion] || []) as string[]).includes(opt)
                        : answers[currentQuestion] === opt;
                      return (
                        <Button
                          key={opt}
                          variant={selected ? "default" : "outline"}
                          onClick={() => handleAnswer(opt)}
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <Button onClick={nextQuestion} disabled={!answers[currentQuestion]?.length}>
                      {currentQuestion < quizQuestions.length - 1 ? "Next" : "Submit"}
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <p className="font-medium text-lg mb-2">Your Kidney Health Risk Level:</p>
                  <Badge variant={getQuizRiskLevel() === "High Risk" ? "destructive" : getQuizRiskLevel() === "Moderate Risk" ? "secondary" : "default"}>
                    {getQuizRiskLevel()}
                  </Badge>
                  <div className="mt-4">
                    <Button onClick={() => { setShowQuizResult(false); setCurrentQuestion(0); setAnswers([]); }}>
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold mb-6 mt-8">CKD Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Peak CKD Age Group */}
          <Card className="shadow-card border-0 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Peak CKD Age Group</CardTitle>
              <CardDescription>
                Most CKD patients fall into this age range
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <p className="text-2xl font-bold text-primary">{ckdSummary?.peak_age_group || "Loading..."}</p>
              <p className="text-sm text-gray-500">
                Likely caused by {ckdSummary?.top_cause_key?.replace(/_/g, " ") || "..."}
              </p>
            </CardContent>
          </Card>

          {/* Top CKD Risk Factor */}
          <Card className="shadow-card border-0 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Top CKD Risk Factor</CardTitle>
              <CardDescription>
                Most prevalent factor among CKD patients
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <p className="text-2xl font-bold text-primary">{topRiskFactor?.factor || "Loading..."}</p>
              <p className="text-sm text-gray-500">
                Affects {topRiskFactor?.percentage || "..."}% of CKD patients
              </p>
            </CardContent>
          </Card>

          {/* Severe CKD Cases */}
          <Card className="shadow-card border-0 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Severe CKD Cases</CardTitle>
              <CardDescription>
                Percentage of CKD patients with severe disease
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <p className="text-2xl font-bold text-red-500">{severeCkdPct ?? "..."}%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );


}

