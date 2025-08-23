// src/pages/Patients.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Filter, Users } from "lucide-react";

/* ------------ types ------------- */
type PatientCard = {
  _id?: string;
  id?: number | string;
  name?: string;
  age?: number | null;
  gender?: string;
  stage?: string;
  diagnosis?: string;
  story?: string;
  lifestyle?: { diabetic?: boolean; exercise?: boolean; smokes?: boolean; highBP?: boolean };
  riskFactors?: string[];
  improvements?: string[];
  vitals?: { bmi?: number | null; egfr?: number | null; hemoglobin?: number | null };
  labFlags?: string[];
  matchScore?: number; // 0..100
};

const API_BASE = import.meta.env.VITE_API_BASE || "";
const toNum = (v: string) => (v === "" || v == null ? undefined : Number(v));

/* =========================================================
   Helpers
========================================================= */
const asNum = (v: any) => (v == null || v === "" ? undefined : Number(v));
const asBool = (v: any) => {
  if (v === true || v === false) return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["yes", "y", "true", "t", "1"].includes(s)) return true;
    if (["no", "n", "false", "f", "0"].includes(s)) return false;
  }
  return undefined;
};

const stageFromEgfr = (egfr?: number | null) => {
  if (egfr == null || Number.isNaN(egfr)) return "Unknown";
  if (egfr >= 90) return "Stage 1";
  if (egfr >= 60) return "Stage 2";
  if (egfr >= 45) return "Stage 3a";
  if (egfr >= 30) return "Stage 3b";
  if (egfr >= 15) return "Stage 4";
  return "Stage 5";
};

/** Adapt backend docs (with many possible field names) to our card shape */
const normalizePatient = (raw: any, idx = 0): PatientCard => {
  const doc = raw?.patient ?? raw ?? {};
  const score =
    asNum(raw?.matchScore) ??
    asNum(raw?.score) ??
    asNum(raw?.similarity) ??
    asNum(raw?._score);

  const age = asNum(doc.age) ?? asNum(doc.age_of_the_patient);

  const bmi =
    asNum(doc?.vitals?.bmi) ??
    asNum(doc.body_mass_index_bmi);

  const egfr =
    asNum(doc?.vitals?.egfr) ??
    asNum(doc.estimated_glomerular_filtration_rate_egfr);

  const hemoglobin =
    asNum(doc?.vitals?.hemoglobin) ??
    asNum(doc.hemoglobin_level_gms);

  const diabetic =
    asBool(doc?.lifestyle?.diabetic) ??
    asBool(doc.diabetes_mellitus_yesno);

  const highBP =
    asBool(doc?.lifestyle?.highBP) ??
    asBool(doc.hypertension_yesno);

  const smokes =
    asBool(doc?.lifestyle?.smokes) ??
    asBool(doc.smoking_status);

  const name = doc.name || doc.fullName || `Patient ${idx + 1}`;
  const stage = doc.stage || stageFromEgfr(egfr);

  const riskFactors = [
    diabetic ? "Diabetes" : undefined,
    highBP ? "High Blood Pressure" : undefined,
    smokes ? "Smoking" : undefined,
  ].filter(Boolean) as string[];

  return {
    id: doc.id ?? doc._id ?? idx,
    _id: doc._id,
    name,
    age: age ?? null,
    gender: (doc.gender || doc.sex || "").toString().toLowerCase(),
    stage,
    diagnosis: doc.diagnosis || doc.target || undefined,
    story: doc.story || "Explore lifestyle and lab patterns similar to yours.",
    lifestyle: { diabetic, highBP, smokes, exercise: undefined },
    riskFactors,
    improvements: doc.improvements || [],
    vitals: { bmi: bmi ?? null, egfr: egfr ?? null, hemoglobin: hemoglobin ?? null },
    labFlags: doc.labFlags || [],
    matchScore:
      typeof score === "number"
        ? Math.max(0, Math.min(100, score))
        : undefined,
  };
};

/* =========================================================
   Patients Page
========================================================= */
export default function Patients() {
  /* ---------- Tabs ---------- */
  const [tab, setTab] = useState<"similar" | "explore">("similar");

  /* ---------- Modal ---------- */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PatientCard | null>(null);
  const openModal = (p: PatientCard) => { setSelected(p); setOpen(true); };

  /* ---------- Shared card renderer ---------- */
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Stage 1": return "bg-secondary text-secondary-foreground";
      case "Stage 2": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Stage 3": return "bg-warning/10 text-warning-foreground";
      case "Stage 4": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Stage 5": return "bg-destructive/10 text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderCards = (arr: PatientCard[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {arr.map((p, index) => {
        const stage = p.stage || "Unknown";
        const vitals = p.vitals || {};
        const previewRisks = (p.riskFactors || []).slice(0, 2);
        const previewFlags = (p.labFlags || []).slice(0, 1);
        return (
          <Card
            key={p._id || p.id || index}
            className="shadow-card border-0 hover:shadow-hover transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{p.name || `Patient ${index + 1}`}</CardTitle>
                  <CardDescription>{p.age ? `${p.age} years old` : "—"}</CardDescription>
                </div>
                <Badge className={getStageColor(stage)}>{stage}</Badge>
              </div>
              {p.diagnosis && (
                <div className="flex items-center space-x-2 mt-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{p.diagnosis}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>BMI: <span className="font-medium">{vitals.bmi ?? "—"}</span></div>
                <div>eGFR: <span className="font-medium">{vitals.egfr ?? "—"}</span></div>
                <div>Hgb: <span className="font-medium">{vitals.hemoglobin ?? "—"}</span></div>
              </div>

              {previewRisks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewRisks.map((rf, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{rf}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewFlags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Lab Flag:</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewFlags.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {typeof p.matchScore === "number" && (
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Similarity Match</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${p.matchScore}%` }} />
                      </div>
                      <span className="text-xs font-medium">{p.matchScore}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  className="bg-green-500 w-full text-white hover:bg-green-600"
                  variant="outline"
                  onClick={() => openModal(p)}
                >
                  View details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  /* =========================================================
     TAB 1: Similar (static 12, no refresh)
  ========================================================= */
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<PatientCard[]>([]);
  const [others] = useState<PatientCard[]>([]); // kept for layout parity if you add later

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setSimError(null);
        setSimLoading(true);
        const userId =
          localStorage.getItem("userId") ||
          JSON.parse(localStorage.getItem("kidney_user") || "{}")?._id ||
          JSON.parse(localStorage.getItem("kidneyguard_user") || "{}")?._id;

        if (!userId) {
          setSimError("You're not signed in.");
          return;
        }

        const res = await fetch(`${API_BASE}/patients/similar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, limit: 12 }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        console.log("[SIMILAR] raw response:", data);

        const arr: any[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
const normalized = arr.map((d, i) => normalizePatient(d, i));
// log first few normalized items so we can see fields the UI uses
console.log("[SIMILAR] normalized[0..2]:", normalized.slice(0, 3));
console.table(
  normalized.slice(0, 6).map(p => ({
    id: p._id || p.id,
    name: p.name,
    age: p.age,
    bmi: p.vitals?.bmi,
    egfr: p.vitals?.egfr,
    hgb: p.vitals?.hemoglobin,
    match: p.matchScore
  }))
);

setSimilar(normalized);
        
      } catch (e: any) {
        if (!canceled) setSimError(e.message || "Failed to load similar patients");
      } finally {
        if (!canceled) setSimLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  /* =========================================================
     TAB 2: Explore (cohort search)
  ========================================================= */
  const [patients, setPatients] = useState<PatientCard[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [kpi, setKpi] = useState({
    avgEgfr: null as number | null,
    medBmi: null as number | null,
    pctSmokers: null as number | null,
    pctDiabetes: null as number | null,
    pctHyperten: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [smoking, setSmoking] = useState<"any" | "yes" | "no">("any");
  const [diabetes, setDiabetes] = useState<"any" | "yes" | "no">("any");
  const [hypertension, setHypertension] = useState<"any" | "yes" | "no">("any");
  const [ckd, setCkd] = useState<"any" | "yes" | "no">("any");

  const [actLow, setActLow] = useState(true);
  const [actMed, setActMed] = useState(true);
  const [actHigh, setActHigh] = useState(true);

  const activityArray = useMemo(() => {
    const arr: string[] = [];
    if (actLow) arr.push("low");
    if (actMed) arr.push("moderate");
    if (actHigh) arr.push("high");
    return arr;
  }, [actLow, actMed, actHigh]);

  const booleanChoice = (v: "any" | "yes" | "no") =>
    v === "yes" ? true : v === "no" ? false : undefined;

  const fetchCohort = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const body = {
        filters: {
          gender: gender === "all" ? undefined : gender,
          age: { min: toNum(ageMin), max: toNum(ageMax) },
          smoking: booleanChoice(smoking),
          diabetes: booleanChoice(diabetes),
          hypertension: booleanChoice(hypertension),
          ckd: booleanChoice(ckd),
          activity: activityArray.length === 3 ? undefined : activityArray,
        },
        sampleLimit: 9,
      };
      const res = await fetch(`${API_BASE}/search/cohort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setTotal(data.total ?? 0);
      setKpi({
        avgEgfr: data.summary?.avgEgfr ?? null,
        medBmi: data.summary?.medBmi ?? null,
        pctSmokers: data.summary?.pctSmokers ?? null,
        pctDiabetes: data.summary?.pctDiabetes ?? null,
        pctHyperten: data.summary?.pctHyperten ?? null,
      });

      // TEMP LOGS — browser console
console.log("[COHORT] raw response:", data);

const examples: any[] = Array.isArray(data.examples) ? data.examples : [];
const normalized = examples.map((e, i) => normalizePatient(e, i));

console.log("[COHORT] normalized[0..2]:", normalized.slice(0, 3));
console.table(
  normalized.slice(0, 6).map(p => ({
    id: p._id || p.id,
    name: p.name,
    age: p.age,
    bmi: p.vitals?.bmi,
    egfr: p.vitals?.egfr,
    hgb: p.vitals?.hemoglobin
  }))
);

setPatients(normalized);
    } catch (e: any) {
      setError(e?.message || "Cohort search failed");
    } finally {
      setLoading(false);
    }
  }, [gender, ageMin, ageMax, smoking, diabetes, hypertension, ckd, activityArray]);

  useEffect(() => { fetchCohort(); }, []); // initial

  /* ---------- Segmented tabs UI ---------- */
  const SegTabs = () => (
    <div className="w-full bg-muted/40 rounded-lg p-2 flex gap-4 items-center justify-center">
      <button
        className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition
          ${tab === "similar" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100"}`}
        onClick={() => setTab("similar")}
      >
        <Users className="h-4 w-4" />
        <span>Similar</span>
      </button>
      <button
        className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition
          ${tab === "explore" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100"}`}
        onClick={() => setTab("explore")}
      >
        <Filter className="h-4 w-4" />
        <span>Explore</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2"><Users className="h-10 w-10 text-primary" /></div>
          <h1 className="text-4xl font-bold">Meet the Patients</h1>
        </div>

        {/* Tabs like screenshot */}
        <div className="mb-6">
          <SegTabs />
        </div>

        {/* TAB CONTENTS */}
        {tab === "similar" ? (
          <Card className="mb-8 shadow-card border-0">
            <CardHeader>
              <CardTitle>Patients like me</CardTitle>
              <CardDescription>Closest matches from our dataset.</CardDescription>
            </CardHeader>
            <CardContent>
              {simLoading && <p className="text-muted-foreground">Finding matches…</p>}
              {simError && <span className="text-sm text-destructive">{simError}</span>}
              {!simLoading && !simError && similar.length > 0 && (
                <>
                  {renderCards(similar)}
                  {others.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold mt-10 mb-3">Other patients</h3>
                      {renderCards(others)}
                    </>
                  )}
                </>
              )}
              {!simLoading && !simError && similar.length === 0 && (
                <p className="text-sm text-muted-foreground">No similar patients to show yet.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Explore Filters */}
            <Card className="mb-6 shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Explore cohort
                </CardTitle>
                <CardDescription>Multi‑criteria, privacy‑safe search.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex gap-2">
                    <Input placeholder="Age min" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                    <Input placeholder="Age max" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                  </div>

                  <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={smoking} onValueChange={(v: any) => setSmoking(v)}>
                    <SelectTrigger><SelectValue placeholder="Smoking" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Smoking: Any</SelectItem>
                      <SelectItem value="yes">Smoking: Yes</SelectItem>
                      <SelectItem value="no">Smoking: No</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={diabetes} onValueChange={(v: any) => setDiabetes(v)}>
                    <SelectTrigger><SelectValue placeholder="Diabetes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Diabetes: Any</SelectItem>
                      <SelectItem value="yes">Diabetes: Yes</SelectItem>
                      <SelectItem value="no">Diabetes: No</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={hypertension} onValueChange={(v: any) => setHypertension(v)}>
                    <SelectTrigger><SelectValue placeholder="Hypertension" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Hypertension: Any</SelectItem>
                      <SelectItem value="yes">Hypertension: Yes</SelectItem>
                      <SelectItem value="no">Hypertension: No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Select value={ckd} onValueChange={(v: any) => setCkd(v)}>
                    <SelectTrigger><SelectValue placeholder="CKD" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">CKD: Any</SelectItem>
                      <SelectItem value="yes">CKD: Yes (eGFR &lt; 60)</SelectItem>
                      <SelectItem value="no">CKD: No (eGFR ≥ 60)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="col-span-2 text-sm rounded-lg border p-3">
                    <div className="font-medium mb-2">Activity level</div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={actLow} onChange={() => setActLow(v => !v)} /> low
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={actMed} onChange={() => setActMed(v => !v)} /> moderate
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={actHigh} onChange={() => setActHigh(v => !v)} /> high
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <Button className="bg-green-500 text-white hover:bg-green-600" onClick={fetchCohort}>
                      Search cohort
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setGender("all");
                      setAgeMin(""); setAgeMax("");
                      setSmoking("any"); setDiabetes("any"); setHypertension("any"); setCkd("any");
                      setActLow(true); setActMed(true); setActHigh(true);
                      fetchCohort();
                    }}>
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPIs */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="border-0 shadow-card"><CardContent className="py-3">
                <div className="text-xs text-muted-foreground">Total matches</div>
                <div className="text-xl font-semibold">{total}</div>
              </CardContent></Card>
              <Card className="border-0 shadow-card"><CardContent className="py-3">
                <div className="text-xs text-muted-foreground">Avg eGFR</div>
                <div className="text-xl font-semibold">{kpi.avgEgfr ?? "—"}</div>
              </CardContent></Card>
              <Card className="border-0 shadow-card"><CardContent className="py-3">
                <div className="text-xs text-muted-foreground">Median BMI</div>
                <div className="text-xl font-semibold">{kpi.medBmi ?? "—"}</div>
              </CardContent></Card>
              <Card className="border-0 shadow-card"><CardContent className="py-3">
                <div className="text-xs text-muted-foreground">% Smokers</div>
                <div className="text-xl font-semibold">{kpi.pctSmokers ?? "—"}%</div>
              </CardContent></Card>
              <Card className="border-0 shadow-card"><CardContent className="py-3">
                <div className="text-xs text-muted-foreground">% Diabetes / % HTN</div>
                <div className="text-xl font-semibold">
                  {kpi.pctDiabetes ?? "—"}% / {kpi.pctHyperten ?? "—"}%
                </div>
              </CardContent></Card>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-muted-foreground">Loading cohort…</div>
            ) : error ? (
              <div className="text-destructive">Error: {error}</div>
            ) : patients.length > 0 ? (
              renderCards(patients)
            ) : (
              <Card className="text-center py-12 shadow-card border-0 mt-6">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No patients found</h3>
                  <p className="text-muted-foreground">Try adjusting filters to broaden your cohort.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
          {selected && (
            <>
              <div className="bg-gradient-primary/10 px-6 py-5 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
                  <DialogDescription>{selected.age ? `${selected.age} years old` : "—"}</DialogDescription>
                </DialogHeader>
                {selected.stage && (
                  <div className="mt-3">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {selected.stage}
                    </Badge>
                  </div>
                )}
              </div>

              <ScrollArea className="max-h-[70vh]">
                <div className="p-6 space-y-6">
                  {selected.diagnosis && (
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-medium">{selected.diagnosis}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.story || "No story available."}
                  </p>

                  {selected.vitals && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Vitals</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg bg-muted px-3 py-2"><div className="text-xs text-muted-foreground">BMI</div><div className="font-medium">{selected.vitals.bmi ?? "—"}</div></div>
                        <div className="rounded-lg bg-muted px-3 py-2"><div className="text-xs text-muted-foreground">eGFR</div><div className="font-medium">{selected.vitals.egfr ?? "—"}</div></div>
                        <div className="rounded-lg bg-muted px-3 py-2"><div className="text-xs text-muted-foreground">Hemoglobin</div><div className="font-medium">{selected.vitals.hemoglobin ?? "—"}</div></div>
                      </div>
                    </div>
                  )}

                  {selected.riskFactors && selected.riskFactors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Risk Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.riskFactors.map((rf, i) => (
                          <Badge key={i} variant="outline">{rf}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.labFlags && selected.labFlags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Lab Flags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.labFlags.map((f, i) => (
                          <Badge key={i} variant="outline">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {typeof selected.matchScore === "number" && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Similarity Match</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${selected.matchScore}%` }} />
                        </div>
                        <span className="text-sm font-medium">{selected.matchScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex justify-end">
                <Button onClick={() => setOpen(false)} className="px-6">Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
