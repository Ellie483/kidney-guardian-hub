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
import { Loader } from "lucide-react";


const hasRichDetails = (doc: any): boolean => {
  const d = doc?.patient ?? doc ?? {};
  return (
    d.hasOwnProperty("serum_creatinine_mgdl") ||
    d.hasOwnProperty("estimated_glomerular_filtration_rate_egfr") ||
    d.hasOwnProperty("blood_urea_mgdl")
  );
};
async function fetchFullPatientById(id: string | number) {
  const candidates = [
    `${API_BASE}/patients/${id}`,
    `${API_BASE}/patients/by-id/${id}`,
    `${API_BASE}/patients/get?id=${id}`,
    `${API_BASE}/patient/${id}`,
    `${API_BASE}/records/${id}`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) continue;
      const data = await res.json();
      const doc = data?.patient ?? data?.record ?? data?.doc ?? data;
      if (doc && typeof doc === "object") return doc;
    } catch {}
  }
  throw new Error("Could not load full patient by id");
}

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
  lifestyle?: { 
    diabetic?: boolean; 
    exercise?: boolean; 
    smokes?: boolean; 
    highBP?: boolean; 
    activityLevel?: string | null; 
  };
  activityLevel?: string | null;
  riskFactors?: string[];
  improvements?: string[];
  vitals?: {
    bmi?: number | null;
    egfr?: number | null;
    bloodUrea?: number | null;   // ✅ added
  };
  labFlags?: string[];
  matchScore?: number;
  raw?: any;
};




const API_BASE = import.meta.env.VITE_API_BASE || "";
const toNum = (v: string) => (v === "" || v == null ? undefined : Number(v));




/* =========================================================
   Helpers
========================================================= */
const fmtNum = (v: any, digits = 2) =>
  v == null || v === "" || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(digits);

// Keys to force 2-dp in the Clinical details grid
const TWO_DP_FIELDS = new Set([
  "serum_creatinine_mgdl",
  "estimated_glomerular_filtration_rate_egfr",
  "blood_urea_mgdl",
  "sodium_level_meql",
  "potassium_level_meql",
  "random_blood_glucose_level_mgdl",
  "body_mass_index_bmi",
  // add more here if you want them 2dp in the details grid
]);
const yesNo = (v: any): string => {
  // accept 1/0, true/false, "yes"/"no"
  if (v === true || v === 1 || v === "1") return "Yes";
  if (v === false || v === 0 || v === "0") return "No";
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["yes", "y", "true", "t"].includes(s)) return "Yes";
    if (["no", "n", "false", "f"].includes(s)) return "No";
  }
  // leave strings like "normal", "abnormal" as-is
  return v == null || v === "" ? "—" : String(v);
};

const fmt = (v: any) => (v == null || v === "" ? "—" : String(v));

const asNum = (v: any) => (v == null || v === "" ? undefined : Number(v));
const asBool = (v: any) => {
  if (v === true || v === false) return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["yes","y","true","t","1"].includes(s)) return true;
    if (["no","n","false","f","0"].includes(s)) return false;
  }
  return undefined;
};


const FIELD_ORDER = [
  "age_of_the_patient",
  "smoking_status",
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
  "albumin_in_urine",                 // ✅ NEW (shown as “Urine albumin”)
  "appetite_goodpoor",
  "target",
] as const;

const LABELS: Record<string, string> = {
  age_of_the_patient: "Age",
  smoking_status: "Smoking status",
  physical_activity_level: "Physical activity",
  family_history_of_chronic_kidney_disease: "Family history of CKD",
  body_mass_index_bmi: "BMI",
  duration_of_diabetes_mellitus_years: "Duration of diabetes (yrs)",
  duration_of_hypertension_years: "Duration of hypertension (yrs)",
  coronary_artery_disease_yesno: "Coronary artery disease (Y/N)",
  serum_creatinine_mgdl: "Serum creatinine (mg/dL)",
  estimated_glomerular_filtration_rate_egfr: "eGFR",
  blood_urea_mgdl: "Blood urea (mg/dL)",
  sodium_level_meql: "Sodium (mEq/L)",
  potassium_level_meql: "Potassium (mEq/L)",
  random_blood_glucose_level_mgdl: "Random blood glucose (mg/dL)",
  albumin_in_urine: "Urine albumin",          // ✅ NEW
  appetite_goodpoor: "Appetite",
  target: "Target / Diagnosis",
};



const prettyByKey = (key: string, v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  // Normalize 0/1 booleans for *_yesno & smoking_status
  if (/_yesno$/.test(key) || key === "smoking_status") {
    if (v === 1 || v === "1" || v === true || `${v}`.toLowerCase() === "yes") return "Yes";
    if (v === 0 || v === "0" || v === false || `${v}`.toLowerCase() === "no") return "No";
  }
  return String(v);
};

/* ---------- build a 'details' snapshot from reduced schema ---------- */
function buildDetails(doc: any): Record<string, any> {
  const d = doc?.patient ?? doc ?? {};

  // allow graceful fallbacks from card-normalized shape if present
  const activity =
    d.physical_activity_level ??
    d?.lifestyle?.activityLevel ??
    d?.lifestyle?.activity ??
    null;

  const egfr =
    d.estimated_glomerular_filtration_rate_egfr ??
    d?.vitals?.egfr ??
    null;

  const bmi =
    d.body_mass_index_bmi ??
    d?.vitals?.bmi ??
    null;

    return {
      age_of_the_patient: d.age_of_the_patient ?? d.age ?? null,
      smoking_status:
        d.smoking_status ??
        (typeof d?.lifestyle?.smokes === "boolean" ? (d.lifestyle.smokes ? 1 : 0) : undefined),
    
      physical_activity_level: activity,
    
      family_history_of_chronic_kidney_disease: d.family_history_of_chronic_kidney_disease,
      body_mass_index_bmi: bmi,
    
      duration_of_diabetes_mellitus_years: d.duration_of_diabetes_mellitus_years,
      duration_of_hypertension_years: d.duration_of_hypertension_years,
      coronary_artery_disease_yesno: d.coronary_artery_disease_yesno,
    
      serum_creatinine_mgdl: d.serum_creatinine_mgdl,
      estimated_glomerular_filtration_rate_egfr: egfr,
      blood_urea_mgdl: d.blood_urea_mgdl,
      sodium_level_meql: d.sodium_level_meql,
      potassium_level_meql: d.potassium_level_meql,
      random_blood_glucose_level_mgdl: d.random_blood_glucose_level_mgdl,
    
      albumin_in_urine: d.albumin_in_urine,       // ✅ NEW
    
      blood_pressure_mmhg: d.blood_pressure_mmhg,
      appetite_goodpoor: d.appetite_goodpoor,
    
      target: d.target ?? d.diagnosis,
    };
    
}


function prettyStage(val: any): string | undefined {
  if (val == null) return undefined;

  // Numeric encodings 0..4
  if (typeof val === "number") {
    const map = ["No disease", "Low risk", "Moderate risk", "High risk", "Severe disease"];
    return map[val] ?? undefined;
  }

  const s = String(val).trim().toLowerCase();

  // Common string encodings (normalize underscores/spaces)
  const t = s.replace(/\s+/g, " "); // collapse spaces
  if (["no disease", "no_disease", "none", "negative", "no ckd", "no"].includes(s) || t === "no disease")
    return "No disease";
  if (s.includes("low")) return "Low risk";
  if (s.includes("moderate") || s === "med") return "Moderate risk";
  if (s.includes("severe")) return "Severe disease";
  if (s.includes("high")) return "High risk";

  // "0","1","2","3","4"
  if (/^[0-4]$/.test(s)) return prettyStage(Number(s));

  return undefined; // hide if unknown
}


/** Adapt backend docs to our card shape (21 fields only) */
const normalizePatient = (raw: any, idx = 0): PatientCard => {
  const src = raw?.patient ?? raw ?? {};

  // Try likely places where the full Mongo doc might live
  const rawDoc =
    raw?.raw ??
    raw?.patient?.raw ??
    raw?.patientRaw ??
    src?.raw ??
    raw?.doc ?? raw?.record ??
    raw?.patient ??
    src;

  const fullRaw = rawDoc;

  const score =
    asNum(raw?.matchScore) ?? asNum(raw?.score) ?? asNum(raw?.similarity) ?? asNum(raw?._score);

  // Basic vitals from reduced set (+ safe fallbacks)
  const age = asNum(src.age) ?? asNum(src.age_of_the_patient);
  const bmi = asNum(src?.vitals?.bmi) ?? asNum(src.body_mass_index_bmi);
  const egfr =
    asNum(src?.vitals?.egfr) ??
    asNum(src.estimated_glomerular_filtration_rate_egfr);

  // Activity
  const activityLevel =
    src?.lifestyle?.activityLevel ??
    src?.lifestyle?.activity ??
    (typeof src.physical_activity_level === "string" ? src.physical_activity_level : null) ??
    (typeof fullRaw?.physical_activity_level === "string" ? fullRaw.physical_activity_level : null);

  // Infer lifestyle flags if missing from backend card
  const smokingStatus = asNum(src.smoking_status);
  const smokes =
    asBool(src?.lifestyle?.smokes) ??
    (smokingStatus === 1 ? true : smokingStatus === 0 ? false : undefined);

  const durDM  = asNum(src.duration_of_diabetes_mellitus_years);
  const durHTN = asNum(src.duration_of_hypertension_years);

  // Parse systolic if "120/80"
  const systolic = (() => {
    const v = src.blood_pressure_mmhg ?? fullRaw?.blood_pressure_mmhg;
    if (v == null || v === "") return undefined;
    const s = String(v);
    if (s.includes("/")) {
      const left = Number(s.split("/")[0]);
      return Number.isFinite(left) ? left : undefined;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  })();

  const diabetic =
    asBool(src?.lifestyle?.diabetic) ??
    (Number.isFinite(durDM) && durDM > 0 ? true : undefined);

  const highBP =
    asBool(src?.lifestyle?.highBP) ??
    (Number.isFinite(durHTN) && durHTN > 0 ? true :
     Number.isFinite(systolic) && systolic >= 140 ? true : undefined);

  const name  = src.name || src.fullName || `Profile ${idx + 1}`;

  const rawStageSource =
    src.target ??
    src.prediction ??
    src.risk ??
    src.label ??
    fullRaw?.target ??
    fullRaw?.prediction ??
    fullRaw?.risk ??
    fullRaw?.label;

  const stage = prettyStage(rawStageSource);

  const diagnosisLabel =
    (typeof src.diagnosis === "string" && src.diagnosis.trim() !== "")
      ? src.diagnosis
      : stage;
  const albuminUrine = asNum(src.albumin_in_urine);
  const riskFactors = [
    diabetic && "Diabetes",
    highBP && "High Blood Pressure",
    smokes && "Smoking",
  ].filter(Boolean) as string[];

  return {
    id: src.id ?? src._id ?? idx,
    _id: src._id,
    name,
    age: age ?? null,
    gender: (src.gender || src.sex || "").toString().toLowerCase(),
    stage,
    diagnosis: diagnosisLabel,
    lifestyle: { diabetic, highBP, smokes, exercise: undefined, activityLevel },
    activityLevel,
    riskFactors,
    improvements: src.improvements || [],
    vitals: {
      bmi: bmi ?? null,
      egfr: egfr ?? null,
      bloodUrea:
        asNum(src.blood_urea_mgdl) ??
        asNum((rawDoc ?? src)?.blood_urea_mgdl) ?? // fallback to full raw if present
        null,
    },
    labFlags: src.labFlags || [],
    matchScore: typeof score === "number" ? Math.max(0, Math.min(100, score)) : undefined,
    raw: fullRaw,
  };
};


/* small UI chip */
const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center rounded-full border border-emerald-200/70 px-2.5 py-0.5 text-xs text-emerald-700 bg-emerald-50/70">
    {label}
  </span>
);

/* =========================================================
   Patients Page
========================================================= */
export default function Patients() {
  const [tab, setTab] = useState<"similar" | "explore">("similar");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PatientCard | null>(null);
  const openModal = (p: PatientCard) => { setSelected(p); setOpen(true); };

  const getStageBadge = (label?: string) => {
    const s = (label || "").toLowerCase();
    if (s.includes("no disease")) return "bg-emerald-100 text-emerald-800";
    if (s.includes("low"))        return "bg-blue-100 text-blue-800";
    if (s.includes("moderate"))   return "bg-amber-100 text-amber-800";
    if (s.includes("high") || s.includes("severe")) return "bg-red-100 text-red-800";
    return "bg-muted text-muted-foreground";
  };
  


// Add a function to close the modal
const closeModal = () => {
  setOpen(false);        // Close the modal
};

const renderCards = (arr: PatientCard[]) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {arr.map((p, index) => {
      const stage = p.stage;
      const vitals = p.vitals || {};
      const previewRisks = (p.riskFactors || []).slice(0, 3);
      const previewFlags = (p.labFlags || []).slice(0, 1);
      const activity =
        p.lifestyle?.activityLevel ??
        (p as any).activityLevel ??
        (p.lifestyle as any)?.activity ?? null;

      const activityLabel = activity
        ? activity.charAt(0).toUpperCase() + activity.slice(1)
        : null;

      return (
        <Card
          key={p._id || p.id || index}
          className="shadow-card border border-emerald-100 hover:shadow-hover transition-all duration-300 animate-fade-in rounded-lg"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{`Profile ${index + 1}`}</CardTitle>
                <CardDescription>{p.age ? `${p.age} years old` : "—"}</CardDescription>
              </div>
              {stage && (
                <Badge className={`${getStageBadge(stage)} rounded-full`}>{stage}</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Vitals (reduced: BMI, eGFR) */}
            <div className="grid grid-cols-3 gap-2 text-xs">
            <div>BMI: <span className="font-medium">{fmtNum(vitals.bmi)}</span></div>
            <div>eGFR: <span className="font-medium">{fmtNum(vitals.egfr)}</span></div>
            <div>Urea: <span className="font-medium">{fmtNum(vitals.bloodUrea)}</span></div>
            </div>

            {/* Risk Factors */}
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
              <div className="flex flex-wrap gap-1">
                {previewRisks.length > 0 ? (
                  previewRisks.map((rf, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {rf}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500">No risk factors</span>
                )}
              </div>
            </div>

            {/* Lifestyle */}
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">Lifestyle:</h4>
              <div className="flex flex-wrap gap-1">
                {activityLabel ? (
                  <Badge variant="outline" className="text-xs">
                    Activity: {activityLabel}
                  </Badge>
                ) : (
                  <span className="text-slate-500">No data</span>
                )}
              </div>
            </div>

            {/* Lab Flags (optional) */}
            {previewFlags.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Lab Flag:</h4>
                <div className="flex flex-wrap gap-1">
                  {previewFlags.map((f, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-2 flex justify-end">
            <Button
              className="bg-emerald-600 w-full text-white hover:bg-emerald-700"
              variant="outline"
              onClick={() => openModal(p)}
            >
              View details
            </Button>
          </div>
        </Card>
      );
    })}
  </div>
);


async function enrichPatients(cards: PatientCard[]): Promise<PatientCard[]> {
  const results = await Promise.allSettled(
    cards.map(async (c) => {
      // If we already have rich fields, keep as-is
      if (hasRichDetails(c.raw ?? c)) return c;

      const id = c._id ?? c.id;
      if (!id) return c;

      // Pull full record by id
      const full = await fetchFullPatientById(id);

      // Recompute stage / diagnosis if backend stores them differently
      const rawStage = full?.target ?? full?.prediction ?? full?.risk ?? full?.label;
      const stage = c.stage ?? prettyStage(rawStage);
      const diagnosis =
        c.diagnosis ??
        (typeof full?.diagnosis === "string" && full.diagnosis.trim() !== ""
          ? full.diagnosis
          : stage);

      return {
        ...c,
        stage,
        diagnosis,
        raw: full, // now we have the reduced 21 fields for buildDetails(...)
        vitals: {
          bmi: c.vitals?.bmi ?? asNum(full?.body_mass_index_bmi) ?? null,
          egfr: c.vitals?.egfr ?? asNum(full?.estimated_glomerular_filtration_rate_egfr) ?? null,
          bloodUrea: c.vitals?.bloodUrea ?? asNum(full?.blood_urea_mgdl) ?? null, // ✅ add this
        },
      } as PatientCard;
    })
  );

  // Keep originals on failures, enriched on successes
  return results.map((r, i) => (r.status === "fulfilled" ? r.value : cards[i]));
}

  
 /* =========================================================
   TAB 1: Similar
========================================================= */
const [simLoading, setSimLoading] = useState(false);
const [simError, setSimError] = useState<string | null>(null);
const [similar, setSimilar] = useState<PatientCard[]>([]);
const [others] = useState<PatientCard[]>([]);

useEffect(() => {
  let canceled = false;

  // --- helper: unwrap any plausible list shape ---
  const unwrapList = (data: any): any[] => {
    if (Array.isArray(data)) return data;

    const candidates = [
      "results", "matches", "patients", "items", "records", "hits", "docs", "data",
    ];

    for (const k of candidates) {
      const v = data?.[k];
      if (Array.isArray(v)) return v;
      // nested: { data: { results: [...] } }, { hits: { hits: [...] } }, etc.
      if (Array.isArray(v?.results)) return v.results;
      if (Array.isArray(v?.items)) return v.items;
      if (Array.isArray(v?.hits)) return v.hits;
    }

    // Sometimes servers send an object like {0:{...},1:{...}}
    const objectValues = Object.values(data ?? {});
    const arrayLike = objectValues.filter(
      (x) => x && typeof x === "object" && !Array.isArray(x)
    );
    if (
      arrayLike.length > 0 &&
      arrayLike.every((o: any) => "_id" in o || "id" in o || "name" in o)
    ) {
      return arrayLike as any[];
    }

    return [];
  };

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
      const arr = unwrapList(data);
      const normalized = arr.map((d, i) => normalizePatient(d, i));
      const enriched = await enrichPatients(normalized);
      if (!canceled) setSimilar(enriched);
    } catch (e: any) {
      if (!canceled) setSimError(e.message || "Failed to load similar patients");
    } finally {
      if (!canceled) setSimLoading(false);
    }
  })();

  return () => { canceled = true; };
}, []);

useEffect(() => {
  let cancelled = false;

  (async () => {
    if (!open || !selected) return;

    // If we already have rich details, skip.
    if (hasRichDetails(selected.raw ?? selected) && selected?.vitals?.bloodUrea != null) return;

    const id = selected._id ?? selected.id;
    if (!id) return;

    try {
      setDetailsError(null);
      setDetailsLoading(true);

      const full = await fetchFullPatientById(id);
      if (cancelled) return;

      // Recompute stage/diagnosis if needed
      const rawStage = full?.target ?? full?.prediction ?? full?.risk ?? full?.label;
      const computedStage = prettyStage(rawStage);
      const computedDx =
        (typeof full?.diagnosis === "string" && full.diagnosis.trim() !== "")
          ? full.diagnosis
          : (computedStage ?? selected.diagnosis);

      setSelected(prev => prev && ({
        ...prev,
        stage: prev.stage ?? computedStage,
        diagnosis: prev.diagnosis ?? computedDx,
        raw: full, // 🔑 now modal has the reduced 21 fields
        vitals: {
          bmi: prev.vitals?.bmi ?? asNum(full?.body_mass_index_bmi) ?? null,
          egfr: prev.vitals?.egfr ?? asNum(full?.estimated_glomerular_filtration_rate_egfr) ?? null,
          bloodUrea: prev.vitals?.bloodUrea ?? asNum(full?.blood_urea_mgdl) ?? null, // ✅ add this
        },
      }));
    } catch (e: any) {
      if (!cancelled) setDetailsError(e?.message || "Failed to load details");
    } finally {
      if (!cancelled) setDetailsLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [open, selected]);


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

// Filters
const [activityLevel, setActivityLevel] = useState<"low" | "moderate" | "high" | null>("low");
const [familyHistory, setFamilyHistory] = useState<"any" | "yes" | "no">("any");
const [ageMin, setAgeMin] = useState<string>("");
const [ageMax, setAgeMax] = useState<string>("");
const [smoking, setSmoking] = useState<"any" | "yes" | "no">("any");
const [diabetes, setDiabetes] = useState<"any" | "yes" | "no">("any");
const [hypertension, setHypertension] = useState<"any" | "yes" | "no">("any");

// Use backend enums for CKD
type CkdFilter = "any" | "no_disease" | "low_risk" | "moderate_risk" | "high_risk" | "severe_disease";
const [ckd, setCkd] = useState<CkdFilter>("any");

// Helpers
const booleanChoice = (v: "any" | "yes" | "no") =>
  v === "yes" ? true : v === "no" ? false : undefined;

const fetchCohort = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    // Build request using reduced 21-field semantics
    const body = {
      filters: {
        // convert familyHistory to boolean
        familyHistory: booleanChoice(familyHistory),
        age: { min: toNum(ageMin), max: toNum(ageMax) },
        smoking: booleanChoice(smoking),
        diabetes: booleanChoice(diabetes),
        hypertension: booleanChoice(hypertension),
        // CKD enum or undefined for "any"
        ckd: ckd === "any" ? undefined : ckd,
        // single activity level or none
        activity: activityLevel ? [activityLevel] : [],
      },
      sampleLimit: 12,
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

    const examples: any[] = Array.isArray(data.examples) ? data.examples : [];
    const normalized = examples.map((e, i) => normalizePatient(e, i));
    setPatients(normalized);
  } catch (e: any) {
    setError(e?.message || "Cohort search failed");
  } finally {
    setLoading(false);
  }
}, [familyHistory, ageMin, ageMax, smoking, diabetes, hypertension, ckd, activityLevel]);

useEffect(() => { fetchCohort(); }, [fetchCohort]);

const albuminLabel = (v: any) => {
  if (v == null) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  // 0 none, 1 trace, 2 moderate, 3 high (4 if ever present → very high)
  return ["None", "Trace", "Moderate", "High", "Very high"][Math.max(0, Math.min(4, Math.round(n)))] || "—";
};

const RAW_FIELDS: Array<{ key: string; label: string; type?: "yn" | "text" | "albumin" }> = [
  { key: "age_of_the_patient", label: "Age" },
  { key: "smoking_status", label: "Smoking status", type: "yn" },

  { key: "physical_activity_level", label: "Physical activity" },
  { key: "family_history_of_chronic_kidney_disease", label: "Family history of CKD", type: "yn" },
  { key: "body_mass_index_bmi", label: "BMI" },
  { key: "duration_of_diabetes_mellitus_years", label: "Duration of diabetes (yrs)" },
  { key: "duration_of_hypertension_years", label: "Duration of hypertension (yrs)" },
  { key: "coronary_artery_disease_yesno", label: "Coronary artery disease (Y/N)", type: "yn" },

  { key: "serum_creatinine_mgdl", label: "Serum creatinine (mg/dL)" },
  { key: "estimated_glomerular_filtration_rate_egfr", label: "eGFR" },
  { key: "blood_urea_mgdl", label: "Blood urea (mg/dL)" },
  { key: "sodium_level_meql", label: "Sodium (mEq/L)" },
  { key: "potassium_level_meql", label: "Potassium (mEq/L)" },
  { key: "random_blood_glucose_level_mgdl", label: "Random blood glucose (mg/dL)" },

  { key: "albumin_in_urine", label: "Urine albumin", type: "albumin" }, // ✅ NEW

  { key: "appetite_goodpoor", label: "Appetite" },
  { key: "target", label: "Target / Diagnosis" },
];

const [detailsLoading, setDetailsLoading] = useState(false);
const [detailsError, setDetailsError] = useState<string | null>(null);


  /* ---------- Segmented tabs UI ---------- */
  const SegTabs = () => (
    <div className="w-full rounded-xl p-2 flex gap-3 items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-100/50 ring-1 ring-emerald-100">
  <button
    className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition
      ${tab === "similar" ? "bg-white shadow-sm text-emerald-700 ring-1 ring-emerald-200" : "text-slate-600 hover:text-emerald-700"}`}
    onClick={() => setTab("similar")}
  >
    <Users className="h-4 w-4" />
    <span>Similar Health Profiles</span>
  </button>
  <button
    className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition
      ${tab === "explore" ? "bg-white shadow-sm text-emerald-700 ring-1 ring-emerald-200" : "text-slate-600 hover:text-emerald-700"}`}
    onClick={() => setTab("explore")}
  >
    <Filter className="h-4 w-4" />
    <span>Explore Health Profiles</span>
  </button>
</div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Users className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Health Profiles</h1>
        </div>
  
        <div className="mb-6">
          <SegTabs />
        </div>
  
        {tab === "similar" ? (
  <Card className="mb-8 border-0 shadow-md bg-white/70 backdrop-blur-sm ring-1 ring-emerald-100">
    <CardHeader>
      <CardDescription>Explore similar profiles and get early awareness.</CardDescription>
    </CardHeader>
    <CardContent>
      {simLoading && (
        <div className="flex items-center gap-2">
          <Loader className="animate-spin h-5 w-5 text-emerald-600" /> {/* Spinner */}
          <p className="text-muted-foreground">Finding matches…</p>
        </div>
      )}
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
            <Card className="mb-6 border-0 shadow-md bg-white/70 backdrop-blur-sm ring-1 ring-emerald-100">
              <CardHeader>
                <CardDescription>Multi‑criteria, privacy‑safe search.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex gap-2">
                    <Input placeholder="Age min" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                    <Input placeholder="Age max" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                  </div>
  
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
  
                  {/* Family History of CKD */}
                  <Select value={familyHistory} onValueChange={(v: any) => setFamilyHistory(v)}>
                    <SelectTrigger><SelectValue placeholder="Family History of CKD" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Family History</SelectItem>
                      <SelectItem value="yes">Family History: Yes</SelectItem>
                      <SelectItem value="no">Family History: No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* CKD Stage */}
                <Select value={ckd} onValueChange={(v: any) => setCkd(v)}>
                  <SelectTrigger><SelectValue placeholder="Select CKD Stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any CKD Stage</SelectItem>
                    <SelectItem value="no_disease">CKD: No Disease</SelectItem>
                    <SelectItem value="low_risk">CKD: Low Risk</SelectItem>
                    <SelectItem value="moderate_risk">CKD: Moderate Risk</SelectItem>
                    <SelectItem value="high_risk">CKD: High Risk</SelectItem>
                    <SelectItem value="severe_disease">CKD: Severe Disease</SelectItem>
                  </SelectContent>
                </Select>
  
                  {/* Activity Level - Only One Selection Allowed */}
                  <div className="col-span-2 text-sm rounded-lg border border-emerald-100 p-3 bg-emerald-50/40">
                    <div className="font-medium mb-2 text-emerald-800">Activity level</div>
                    <div className="flex gap-4 text-slate-700">
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={activityLevel === "low"} onChange={() => setActivityLevel("low")} /> low
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={activityLevel === "moderate"} onChange={() => setActivityLevel("moderate")} /> moderate
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={activityLevel === "high"} onChange={() => setActivityLevel("high")} /> high
                      </label>
                    </div>
                  </div>
  
                  <div className="md:col-span-2 flex gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={fetchCohort}>
                      Search 
                    </Button>
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        setAgeMin(""); setAgeMax(""); setSmoking("any");
                        setDiabetes("any"); setHypertension("any");
                        setFamilyHistory("any"); setCkd("any");
                        setActivityLevel("low");
                        fetchCohort();
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            {/* Results */}
            {loading ? (
              <div className="text-muted-foreground">Loading cohort…</div>
            ) : error ? (
              <div className="text-destructive">Error: {error}</div>
            ) : patients.length > 0 ? (
              renderCards(patients)
            ) : (
              <Card className="text-center py-12 border-0 shadow-sm ring-1 ring-emerald-100 bg-white/70 backdrop-blur-sm mt-6">
                <CardContent>
                  <Users className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-slate-900">No matching profiles found</h3>
                  <p className="text-muted-foreground">Try adjusting filters to broaden your cohort.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
  
        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-3xl rounded-2xl p-0 overflow-hidden">
            {selected && (
              <>
                <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-slate-900">{selected.name}</DialogTitle>
                    <DialogDescription className="text-slate-600">
                      {selected.age ? `${selected.age} years old` : "—"}
                    </DialogDescription>
                  </DialogHeader>
                </div>
  
                <ScrollArea className="max-h-[70vh]">
                  <div className="p-6 space-y-6">
                    {selected.diagnosis && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-rose-500" />
                        <span className="font-medium text-slate-800">
                          {prettyStage(selected.diagnosis) ?? selected.diagnosis}
                        </span>
                      </div>
                    )}
  
  {selected.vitals && (
  <div>
    <h4 className="text-sm font-semibold mb-2 text-slate-900">Vitals</h4>
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
        <div className="text-xs text-emerald-700/90">BMI</div>
        <div className="font-medium text-slate-900">
          {fmtNum(selected.vitals.bmi) ?? "—"}
        </div>
      </div>
      <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
        <div className="text-xs text-emerald-700/90">eGFR</div>
        <div className="font-medium text-slate-900">
          {fmtNum(selected.vitals.egfr) ?? "—"}
        </div>
      </div>
      <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
        <div className="text-xs text-emerald-700/90">Blood Urea</div>
        <div className="font-medium text-slate-900">
          {fmtNum(selected.vitals.bloodUrea) ?? "—"}
        </div>
      </div>
    </div>
  </div>
)}

  
                    {(() => {
                      const details = buildDetails(selected.raw ?? selected);
                      return (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-slate-900">Clinical details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {RAW_FIELDS.map(({ key, label, type }) => {
                          const v = (details as any)[key];

                          const display =
                            type === "yn"
                              ? yesNo(v)
                              : type === "albumin"
                              ? albuminLabel(v)
                              : TWO_DP_FIELDS.has(key)
                              ? fmtNum(v, 2)
                              : fmt(v); // default string-ish fallback

                          return (
                            <div key={key} className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                              <div className="text-xs text-emerald-700/90">{label}</div>
                              <div className="font-medium text-slate-900">{display}</div>
                            </div>
                          );
                        })}
                          </div>
                        </div>
                      );
                    })()}
  
                    {selected.riskFactors && selected.riskFactors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-900">Risk Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {selected.riskFactors.map((rf, i) => (
                            <Chip key={i} label={rf} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
  
                <div className="p-4 border-t border-emerald-100 flex justify-end">
                  <Button onClick={() => setOpen(false)} className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}