import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts';
import { Brain, ChartBar, Users, TrendingUp, CheckCircle, X, Lightbulb } from "lucide-react";

// Mock data for charts
const genderData = [
  { name: 'Male', value: 45, patients: 4500 },
  { name: 'Female', value: 55, patients: 5500 }
];

const ageGroupData = [
  { age: '18-30', male: 5, female: 8 },
  { age: '31-45', male: 15, female: 22 },
  { age: '46-60', male: 35, female: 45 },
  { age: '61-75', male: 30, female: 20 },
  { age: '75+', male: 15, female: 5 }
];

const stageProgressionData = [
  { year: '2020', stage1: 35, stage2: 25, stage3: 20, stage4: 15, stage5: 5 },
  { year: '2021', stage1: 32, stage2: 28, stage3: 22, stage4: 13, stage5: 5 },
  { year: '2022', stage1: 30, stage2: 30, stage3: 25, stage4: 10, stage5: 5 },
  { year: '2023', stage1: 28, stage2: 32, stage3: 28, stage4: 8, stage5: 4 }
];

const lifestyleImpactData = [
  { factor: 'Smoking', risk: 85 },
  { factor: 'Diabetes', risk: 78 },
  { factor: 'High BP', risk: 72 },
  { factor: 'Obesity', risk: 65 },
  { factor: 'Family History', risk: 58 }
];

const mythsAndFacts = [
  {
    id: 1,
    statement: "Only old people get chronic kidney disease",
    isMyth: true,
    explanation: "CKD can affect people of all ages. While it's more common in older adults, diabetes and high blood pressure - leading causes of CKD - can develop at any age."
  },
  {
    id: 2,
    statement: "You need to drink 8 glasses of water daily for healthy kidneys",
    isMyth: false,
    explanation: "Staying well-hydrated helps your kidneys filter waste effectively. The exact amount varies by person, but adequate water intake is indeed important for kidney health."
  },
  {
    id: 3,
    statement: "Kidney disease always causes obvious symptoms",
    isMyth: true,
    explanation: "CKD is often called a 'silent disease' because symptoms may not appear until kidney function is significantly reduced. Regular testing is crucial for early detection."
  },
  {
    id: 4,
    statement: "High protein diets can damage healthy kidneys",
    isMyth: true,
    explanation: "For people with healthy kidneys, moderate high-protein diets are generally safe. However, those with existing kidney disease may need to limit protein intake."
  },
  {
    id: 5,
    statement: "Diabetes is the leading cause of kidney failure",
    isMyth: false,
    explanation: "Diabetic nephropathy accounts for about 44% of new cases of kidney failure. Controlling blood sugar is crucial for preventing kidney damage."
  },
  {
    id: 6,
    statement: "Once you have kidney disease, dialysis is inevitable",
    isMyth: true,
    explanation: "Many people with CKD never progress to kidney failure. Early detection and proper management can slow or even stop the progression of kidney disease."
  }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export default function Awareness() {
  const [revealedMyths, setRevealedMyths] = useState<Set<number>>(new Set());

  const toggleMythReveal = (id: number) => {
    setRevealedMyths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Did You Know123?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover eye-opening insights about chronic kidney disease from real patient data and medical research.
          </p>
        </div>

        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <ChartBar className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="myths" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Myths vs Facts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="text-center shadow-card border-0 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">37M</div>
                  <p className="text-sm text-muted-foreground">Americans with CKD</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card border-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-secondary mb-2">90%</div>
                  <p className="text-sm text-muted-foreground">Don't know they have it</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card border-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-warning mb-2">44%</div>
                  <p className="text-sm text-muted-foreground">Caused by diabetes</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card border-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-accent mb-2">15%</div>
                  <p className="text-sm text-muted-foreground">Have severe CKD</p>
                </CardContent>
              </Card>
            </div>

            {/* Gender Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0 animate-slide-up">
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>CKD prevalence by gender</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Insight:</strong> Women are slightly more likely to develop CKD, with 55% of cases occurring in females vs 45% in males.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Analysis */}
              <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <CardTitle>Age Group Impact</CardTitle>
                  <CardDescription>CKD cases by age and gender</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male" fill={COLORS[0]} name="Male" />
                      <Bar dataKey="female" fill={COLORS[1]} name="Female" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Insight:</strong> CKD peaks in the 46-60 age group, particularly among women, likely due to diabetes complications.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lifestyle Impact */}
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle>Lifestyle Risk Factors</CardTitle>
                <CardDescription>Relative risk increase for CKD development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lifestyleImpactData.map((item, index) => (
                    <div key={item.factor} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium">{item.factor}</div>
                      <div className="flex-1">
                        <Progress value={item.risk} className="h-3" />
                      </div>
                      <div className="w-12 text-sm font-bold text-right">{item.risk}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Key Takeaway:</strong> Smoking and diabetes are the highest risk factors. The good news? Most of these are preventable or manageable with lifestyle changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-card border-0 animate-fade-in">
              <CardHeader>
                <CardTitle>CKD Stage Progression Over Time</CardTitle>
                <CardDescription>How CKD stage distribution has changed (2020-2023)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={stageProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stage1" stroke={COLORS[0]} name="Stage 1" strokeWidth={2} />
                    <Line type="monotone" dataKey="stage2" stroke={COLORS[1]} name="Stage 2" strokeWidth={2} />
                    <Line type="monotone" dataKey="stage3" stroke={COLORS[2]} name="Stage 3" strokeWidth={2} />
                    <Line type="monotone" dataKey="stage4" stroke="#f59e0b" name="Stage 4" strokeWidth={2} />
                    <Line type="monotone" dataKey="stage5" stroke="#ef4444" name="Stage 5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <h4 className="font-medium text-secondary mb-2">Positive Trends</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Stage 4 & 5 cases decreasing</li>
                      <li>• Better early detection programs</li>
                      <li>• Improved diabetes management</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h4 className="font-medium text-warning mb-2">Areas of Concern</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Stage 2 & 3 cases increasing</li>
                      <li>• Need more prevention focus</li>
                      <li>• Lifestyle factors rising</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mythsAndFacts.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="shadow-card border-0 hover:shadow-hover transition-all duration-300 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleMythReveal(item.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex-1 pr-4">
                        "{item.statement}"
                      </CardTitle>
                      {revealedMyths.has(item.id) ? (
                        <Badge 
                          variant={item.isMyth ? "destructive" : "default"}
                          className="flex items-center space-x-1"
                        >
                          {item.isMyth ? <X className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          <span>{item.isMyth ? "MYTH" : "FACT"}</span>
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Reveal
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {revealedMyths.has(item.id) && (
                    <CardContent className="pt-0 animate-fade-in">
                      <div className={`p-4 rounded-lg border ${item.isMyth ? 'bg-destructive/10 border-destructive/20' : 'bg-secondary/10 border-secondary/20'}`}>
                        <p className="text-sm">{item.explanation}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold mb-4">Knowledge is Power</h3>
                <p className="mb-6 opacity-90">
                  Understanding CKD myths and facts helps you make informed decisions about your kidney health.
                </p>
                <Button variant="secondary" className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                  Share These Facts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}