import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend, Treemap } from 'recharts';
import { Brain, ChartBar, Users, TrendingUp, CheckCircle, X, Lightbulb } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import PivotTable from "@/components/ui/pivot";
import AppetiteHeatmap from "@/components/ui/appetiteHeatmap";
// Mock data for charts
const genderData = [
  { name: 'Male', value: 45, patients: 4500 },
  { name: 'Female', value: 55, patients: 5500 }
];
const availableFields = [
  "age_of_the_patient",
  "smoking_status",
  "diabetes_mellitus_yesno",
  "hypertension_yesno",
  "physical_activity_level",
  "family_history_of_chronic_kidney_disease",
  "body_mass_index_bmi",
  "duration_of_diabetes_mellitus_years",
  "duration_of_hypertension_years",
  "coronary_artery_disease_yesno",
  "serum_creatinine_mgdl",
  "estimated_glomerular_filtration_rate_egfr",
  "blood_urea_mgdl",
  "sodium_level_meql",
  "potassium_level_meql",
  "random_blood_glucose_level_mgdl",
  "albumin_in_urine",
  "appetite_goodpoor",
  "anemia_yesno"
];
const fieldLabels = {
  age_of_the_patient: "Age of Patient",
  smoking_status: "Smoking Status",
  diabetes_mellitus_yesno: "Diabetes (Yes/No)",
  hypertension_yesno: "Hypertension (Yes/No)",
  physical_activity_level: "Physical Activity Level",
  family_history_of_chronic_kidney_disease: "Family History of CKD",
  body_mass_index_bmi: "BMI",
  duration_of_diabetes_mellitus_years: "Duration of Diabetes (Years)",
  duration_of_hypertension_years: "Duration of Hypertension (Years)",
  coronary_artery_disease_yesno: "Coronary Artery Disease (Yes/No)",
  serum_creatinine_mgdl: "Serum Creatinine (mg/dL)",
  estimated_glomerular_filtration_rate_egfr: "eGFR (mL/min/1.73m²)",
  blood_urea_mgdl: "Blood Urea (mg/dL)",
  sodium_level_meql: "Sodium Level (mEq/L)",
  potassium_level_meql: "Potassium Level (mEq/L)",
  random_blood_glucose_level_mgdl: "Random Blood Glucose (mg/dL)",
  albumin_in_urine: "Albumin in Urine",
  appetite_goodpoor: "Appetite (Good/Poor)",
  anemia_yesno: "Anemia (Yes/No)"
};




const comboData = [
  { combination: "Diabetes + Hypertension", percentage: 32.5 },
  { combination: "Smoking + Hypertension", percentage: 18.7 },
  { combination: "Low Activity + Diabetes", percentage: 12.4 },
  { combination: "Smoking + Diabetes", percentage: 9.8 },
  { combination: "No Risk Factors", percentage: 7.1 },
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


// const ageGroupData = [
//   { age_group: "18-30", total: 10, diabetes_pct: 20, hypertension_pct: 10, smoking_pct: 30, low_activity_pct: 40, anemia_pct: 5, cad_pct: 0, obesity_pct: 15 },
//   { age_group: "31-45", total: 25, diabetes_pct: 40, hypertension_pct: 20, smoking_pct: 35, low_activity_pct: 25, anemia_pct: 10, cad_pct: 5, obesity_pct: 20 },
//   { age_group: "46-60", total: 50, diabetes_pct: 60, hypertension_pct: 50, smoking_pct: 45, low_activity_pct: 40, anemia_pct: 15, cad_pct: 10, obesity_pct: 30 },
// ];

const ageGroupColors = {
  "18-30": "#82ca9d",
  "31-45": "#8884d8",
  "46-60": "#ffc658",
  "61-75": "#ff8042",
  "75+": "#8dd1e1",
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export default function Awareness() {

  const [insight, setInsight] = useState("");


  const [ageloading, setAgeLoading] = useState(true); // loading state

  useEffect(() => {
    setAgeLoading(true); // start loading
    fetch("http://localhost:5000/analysis/summary")
      .then((res) => res.json())
      .then((data) => {
        setInsight(
          `CKD peaks in the ${data.peak_age_group} age group, likely due to ${data.top_cause_key.replace(/_/g, " ")}.`
        );
        setAgeLoading(false); // stop loading
      })
      .catch((err) => {
        console.error("Error fetching insight summary:", err);
        setInsight("Failed to load insight.");
        setAgeLoading(false); // stop loading on error
      });
  }, []);

  // const [ageGroupData, setAgeGroupData] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch("http://localhost:5000/analysis/age-distribution")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setAgeGroupData(data);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching age group data:", err);
  //       setLoading(false);
  //     });
  // }, []);

  const [lifestyleImpactData, setLifestyleImpactData] = useState([]);
  const [lifeloading, setLifeLoading] = useState(true);
  const [lifeinsight, setLifeInsight] = useState("");


  useEffect(() => {
    fetch("http://localhost:5000/analysis/ckd-prevalence-by-factor")
      .then((res) => res.json())
      .then((data) => {
        setLifestyleImpactData(data);
        setLifeLoading(false);

        // Generate insight from top 2 risk factors
        if (data && data.length > 0) {
          const topFactors = data.slice(0, 2);
          const [first, second] = topFactors;

          const format = (s) =>
            s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          const insightText = `${format(first.factor)} and ${format(
            second.factor
          )} are the highest lifestyle risk factors for CKD. About ${first.percentage.toFixed(
            1
          )}% of CKD patients are affected by ${format(first.factor)}.`;

          setLifeInsight(insightText);
        }
      })
      .catch((err) => {
        console.error("Error fetching lifestyle data:", err);
        setLifeLoading(false);
      });
  }, []);

  const [topRiskFactor, setTopRiskFactor] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/analysis/highest-factor") // <-- Use your updated API route
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setTopRiskFactor(data[0]); // Highest % is first
        }
      })
      .catch((err) => {
        console.error("Error fetching top CKD risk factor:", err);
      });
  }, []);

  const [severeCKD, setSevereCKD] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/analysis/severe-ckd-percentage")
      .then((res) => res.json())
      .then((data) => setSevereCKD(data.percentage))
      .catch((err) => {
        console.error("Error fetching severe CKD data:", err);
      });
  }, []);

  const [comboData, setComboData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [comboLoading, setcomboLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const factors = ["All", "Diabetes", "Hypertension", "Smoking", "Low Activity", "Anemia", "CAD", "Obesity"];
  const [rowField, setRowField] = useState<string | null>(null);
  const [colField, setColField] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/analysis/ckd-risk-combinations")
      .then((res) => res.json())
      .then((data) => {
        setComboData(data);
        setcomboLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching combination data:", err);
        setcomboLoading(false);
      });
  }, []);

  // Filtered data based on selected factor
  const filteredData =
    filter === "All"
      ? comboData
      : comboData.filter((item) => item.combination.includes(filter));

  // Top 5 or all if "See More" clicked
  filteredData?.sort((a, b) => b.percentage - a.percentage);

  const [ageLoading, setageLoading] = useState(true);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [highestGroup, setHighestGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch from your API
        const res = await fetch("http://localhost:5000/analysis/age-distribution");
        const json = await res.json();
        setAgeGroupData(json.data);
        setHighestGroup(json.highest_age_group);
        setageLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setageLoading(false);
      }
    };
    fetchData();
  }, []);

  // transform selected group into factor dataset
  const getFactorData = (group) => {
    return [
      { factor: "Diabetes", percentage: parseFloat(group.diabetes_pct) },
      { factor: "Hypertension", percentage: parseFloat(group.hypertension_pct) },
      { factor: "Smoking", percentage: parseFloat(group.smoking_pct) },
      { factor: "Low Activity", percentage: parseFloat(group.low_activity_pct) },
      { factor: "Anemia", percentage: parseFloat(group.anemia_pct) },
      { factor: "CAD", percentage: parseFloat(group.cad_pct) },
      { factor: "Obesity", percentage: parseFloat(group.obesity_pct) },
    ];
  };

  const [appetiteData, setAppetiteData] = useState([]);
  const [appetiteLoading, setAppetiteLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/analysis/appetite-age-target"); // Replace with your API endpoint
        const json = await res.json();
        setAppetiteData(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setAppetiteLoading(false);
      }
    };

    fetchData();
  }, []);


  const [mythsAndFacts, setMythsAndFacts] = useState([]);
  const [revealedMyths, setRevealedMyths] = useState(new Set());
  const [mythloading, setmythLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const API_URL = "http://localhost:5000/mythfact";

  // Fetch myths/facts from server
  const fetchMythsAndFacts = async () => {
    try {
      setmythLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      // Map API data to UI format
      const mappedData = data.map(item => ({
        id: item._id,
        statement: item.title,
        explanation: item.description,
        isMyth: item.type === "myth",
        category: item.category
      }));
      setMythsAndFacts(mappedData);
      setmythLoading(false);
    } catch (err) {
      console.error(err);
      setmythLoading(false);
    }
  };

  useEffect(() => {
    fetchMythsAndFacts();
  }, []);

  // Toggle reveal for a myth/fact
  const toggleMythReveal = (id) => {
    setRevealedMyths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  const ageGroupLabels: Record<string, string> = {
    "18-30": "Youth",
    "31-45": "Young Adults",
    "46-60": "Middle-aged Adults",
    "61-75": "Seniors",
    "75+": "Elderly",
  };

  // Filter myths/facts by category
  const filteredItems = filterCategory === "all"
    ? mythsAndFacts
    : mythsAndFacts.filter(item => item.category === filterCategory);
  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Did You Know?</h1>
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
              <span>Customized Table</span>
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
                  <div className="text-4xl font-bold text-primary mb-2">
                    {lifestyleImpactData[0]?.percentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">

                    has {lifestyleImpactData[0]?.factor
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </CardContent>
              </Card>
            <Card
  className="text-center shadow-card border-0 animate-fade-in"
  style={{ animationDelay: '100ms' }}
>
  <CardContent className="pt-6">
    {highestGroup && (
      <>
                  <div className="text-4xl font-bold font-red mb-2">
          {highestGroup}
        </div>
        <p className="text-sm text-muted-foreground">
          Most affected age group
        </p>
      </>
    )}
  </CardContent>
</Card>



              {topRiskFactor && (
                <Card className="text-center shadow-card border-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {topRiskFactor.percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Caused by {topRiskFactor.factor.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {severeCKD !== null && (
                <Card
                  className="text-center shadow-card border-0 animate-fade-in"
                  style={{ animationDelay: '300ms' }}
                >
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {severeCKD.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Have severe CKD</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Gender Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0 animate-slide-up">
                <CardHeader>
                  <CardTitle>Risk Factor Combinations</CardTitle>
                  <CardDescription>Top combinations among CKD patients</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filter buttons */}
                  <div className="flex space-x-2 mb-4 flex-wrap">
                    {factors.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded mb-2 ${filter === f ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {comboLoading ? (
                    <p>Loading combination data...</p>
                  ) : (
                    <>
                      {/* Scrollable combination list */}
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {filteredData.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-muted/50 rounded-lg shadow-sm"
                          >
                            <span className="text-sm font-medium">{item.combination}</span>
                            <span className="text-sm font-bold">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Insight */}
                      {filteredData.length > 0 && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>Insight:</strong> Among combinations{filter !== "All" ? ` including ${filter}` : ""}, the most common is{" "}
                            <span className="font-semibold">{filteredData[0].combination}</span>, found in {filteredData[0].percentage}% of CKD patients.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Age Group Analysis */}
              <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <CardTitle>Age Group Impact</CardTitle>
                  <CardDescription>
                    {selectedGroup
                      ? `Factors contributing to CKD in ${selectedGroup.age_group}`
                      : "CKD cases by age group"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {ageLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <>
                      {!selectedGroup ? (
                        // Age distribution chart
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={ageGroupData}
                            onClick={(e) => {
                              if (e && e.activePayload) {
                                const group = e.activePayload[0].payload;
                                setSelectedGroup(group);
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age_group" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="age_pct" fill="#8884d8" name="percentage" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        // Factor percentage chart
                        <>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getFactorData(selectedGroup)} margin={{ bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="factor"
                                interval={0} // force all labels to display
                                tick={({ x, y, payload }) => {
                                  const text = payload.value;
                                  const truncated = text.length > 10 ? text.slice(0, 10) + "…" : text;
                                  return (
                                    <g transform={`translate(${x},${y + 20}) rotate(-30)`}>
                                      <title>{text}</title> {/* full label on hover */}
                                      <text
                                        textAnchor="end"
                                        fill="#666"
                                        fontSize={12}
                                        style={{ pointerEvents: "none" }}
                                      >
                                        {truncated}
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <YAxis unit="%" />
                              <Tooltip />
                              <Bar dataKey="percentage" fill="#82ca9d" name="Percentage" />
                            </BarChart>
                          </ResponsiveContainer>




                          <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                              ← Back
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Insight box */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Insight:</strong>{" "}
                      {selectedGroup
                        ? `In age group ${selectedGroup.age_group}, the leading contributing factor is 
                ${getFactorData(selectedGroup).reduce((a, b) => (a.percentage > b.percentage ? a : b)).factor}.`
                        : `The most affected age group is ${highestGroup}.`}
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
                  {lifestyleImpactData.map((item) => (
                    <div key={item.factor} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium">{item.factor}</div>
                      <div className="flex-1">
                        <Progress value={Math.round(item.percentage)} className="h-3" />
                      </div>
                      <div className="w-16 text-sm font-bold text-right">
                        {item.percentage.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>


                <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  {lifeinsight && (
                    <p className="text-sm">
                      <strong>Key Takeaway:</strong> {lifeinsight}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <AppetiteHeatmap />

          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Field selection UI */}
            <div className="flex space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Row Field</label>
                <select
                  value={rowField || ""}
                  onChange={(e) => setRowField(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">-- Select Row Field --</option>
                  {availableFields.map((field) => {
                    // Disable logic
                    const isDisabled =
                      field === colField ||
                      (field === "duration_of_hypertension_years" && colField === "hypertension_yesno") ||
                      (field === "hypertension_yesno" && colField === "duration_of_hypertension_years") ||
                      (field === "duration_of_diabetes_mellitus_years" && colField === "diabetes_mellitus_yesno") ||
                      (field === "diabetes_mellitus_yesno" && colField === "duration_of_diabetes_mellitus_years");

                    return (
                      <option key={field} value={field} disabled={isDisabled}>
                        {fieldLabels[field]}
                      </option>
                    );
                  })}
                </select>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Column Field</label>
                <select
                  value={colField || ""}
                  onChange={(e) => setColField(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">-- Select Column Field --</option>
                  {availableFields.map((field) => {
                    const isDisabled =
                      field === rowField ||
                      (field === "duration_of_hypertension_years" && rowField === "hypertension_yesno") ||
                      (field === "hypertension_yesno" && rowField === "duration_of_hypertension_years") ||
                      (field === "duration_of_diabetes_mellitus_years" && rowField === "diabetes_mellitus_yesno") ||
                      (field === "diabetes_mellitus_yesno" && rowField === "duration_of_diabetes_mellitus_years");

                    return (
                      <option key={field} value={field} disabled={isDisabled}>
                        {fieldLabels[field]}
                      </option>
                    );
                  })}
                </select>


              </div>
            </div>

            {/* Pivot Table */}
            <PivotTable rowField={rowField} colField={colField} fieldLabels={fieldLabels}
            />
          </TabsContent>

          <TabsContent value="myths" className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center space-x-4 mb-4">
              <Label htmlFor="categoryFilter">Filter by Category:</Label>
              <select
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border border-border rounded-md bg-background"
              >
                <option value="all">All</option>
                <option value="general">General</option>
                <option value="prevention">Prevention</option>
                <option value="treatment">Treatment</option>
                <option value="diet">Diet</option>
              </select>
            </div>

            {mythloading ? (
              <p>Loading myths and facts...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item, index) => (
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
            )}

            <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold mb-4">Knowledge is Power</h3>
                <p className="mb-6 opacity-90">
                  Understanding CKD myths and facts helps you make informed decisions about your kidney health.
                </p>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}