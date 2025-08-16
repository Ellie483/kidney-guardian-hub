import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Filter, Users, Activity, Cigarette, Utensils } from "lucide-react";
import { useState } from "react";

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Sarah ",
    age: 45,
    gender: "Female",
    stage: "Stage 2",
    diagnosis: "Chronic Kidney Disease",
    story: "Diagnosed with CKD after routine blood work. Through dietary changes and regular exercise, she's maintaining stable kidney function.",
    lifestyle: { diabetic: true, exercise: true, smokes: false, highBP: false },
    riskFactors: ["Diabetes", "Family History"],
    improvements: ["Lost 25 lbs", "Better blood sugar control", "Regular exercise routine"],
    matchScore: 85
  },
  {
    id: 2,
    name: "James",
    age: 52,
    gender: "Male",
    stage: "Stage 3",
    diagnosis: "Diabetic Nephropathy",
    story: "Long-time diabetic who developed kidney complications. Successfully quit smoking and now focuses on blood pressure management.",
    lifestyle: { smokes: false, highBP: true, diabetic: true, exercise: false },
    riskFactors: ["Diabetes", "Former Smoker", "High Blood Pressure"],
    improvements: ["Quit smoking", "Blood pressure under control", "Regular doctor visits"],
    matchScore: 78
  },
  {
    id: 3,
    name: "Maria Barina",
    age: 38,
    gender: "Female",
    stage: "Stage 1",
    diagnosis: "Early CKD Detection",
    story: "Caught kidney disease early due to family history. Proactive lifestyle changes have kept her kidneys healthy.",
    lifestyle: { familyHistory: true, exercise: true, diabetic: false, smokes: false },
    riskFactors: ["Family History"],
    improvements: ["Preventive care", "Healthy diet", "Regular monitoring"],
    matchScore: 92
  },
  {
    id: 4,
    name: "Robert Chen",
    age: 59,
    gender: "Male",
    stage: "Stage 4",
    diagnosis: "Advanced CKD",
    story: "Advanced kidney disease but maintaining quality of life through careful management and family support.",
    lifestyle: { smokes: false, highBP: true, diabetic: true, heartDisease: true },
    riskFactors: ["Diabetes", "High Blood Pressure", "Heart Disease"],
    improvements: ["Stable progression", "Active lifestyle", "Strong support system"],
    matchScore: 65
  },
  {
    id: 5,
    name: "Linda Thompson",
    age: 41,
    gender: "Female",
    stage: "Stage 2",
    diagnosis: "Hypertensive Nephropathy",
    story: "High blood pressure led to kidney damage. Now successfully managing both conditions with medication and lifestyle changes.",
    lifestyle: { smokes: false, highBP: true, exercise: true, diabetic: false },
    riskFactors: ["High Blood Pressure"],
    improvements: ["Blood pressure controlled", "Regular exercise", "Medication compliance"],
    matchScore: 73
  },
  {
    id: 6,
    name: "David Kim",
    age: 34,
    gender: "Male",
    stage: "Stage 1",
    diagnosis: "Genetic Risk",
    story: "Genetic predisposition to kidney disease. Taking preventive measures to maintain healthy kidneys for life.",
    lifestyle: { familyHistory: true, exercise: true, smokes: false, diabetic: false },
    riskFactors: ["Genetic Predisposition"],
    improvements: ["Preventive lifestyle", "Regular screening", "Health awareness"],
    matchScore: 88
  }
];

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.story.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || patient.stage.includes(stageFilter);
    const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter;
    
    return matchesSearch && matchesStage && matchesGender;
  });

  const getLifestyleIcon = (key: string) => {
    switch (key) {
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'smokes': return <Cigarette className="h-4 w-4" />;
      case 'diabetic': return <Heart className="h-4 w-4" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Stage 1': return 'bg-secondary text-secondary-foreground';
      case 'Stage 2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Stage 3': return 'bg-warning/10 text-warning-foreground';
      case 'Stage 4': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Stage 5': return 'bg-destructive/10 text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Meet the Patients</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from people managing kidney disease. Find inspiration and learn from similar journeys.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Find Similar Patients</span>
            </CardTitle>
            <CardDescription>Filter by criteria to find patients with similar profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or story..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by CKD Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="1">Stage 1</SelectItem>
                  <SelectItem value="2">Stage 2</SelectItem>
                  <SelectItem value="3">Stage 3</SelectItem>
                  <SelectItem value="4">Stage 4</SelectItem>
                  <SelectItem value="5">Stage 5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <Card key={patient.id} className="shadow-card border-0 hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>{patient.age} years old • {patient.gender}</CardDescription>
                  </div>
                  <Badge className={getStageColor(patient.stage)}>
                    {patient.stage}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{patient.diagnosis}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {patient.story}
                </p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
                  <div className="flex flex-wrap gap-1">
                    {patient.riskFactors.map((factor, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Key Improvements:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {patient.improvements.slice(0, 2).map((improvement, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-secondary rounded-full" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Similarity Match</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${patient.matchScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{patient.matchScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="text-center py-12 shadow-card border-0">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria to find more patient stories.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-primary text-primary-foreground shadow-card border-0">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Inspired by Their Stories?</h3>
            <p className="text-lg mb-6 opacity-90">
              Start your own kidney health journey today with personalized recommendations.
            </p>
            <Button variant="secondary" size="lg" className="bg-white/20 text-white border-white/20 hover:bg-white/30">
              Get Your Health Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}