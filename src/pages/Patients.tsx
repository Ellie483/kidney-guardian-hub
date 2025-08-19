// src/pages/Patients.tsx
import { useEffect, useMemo, useState } from "react";
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
import { Heart, Search, Filter, Users } from "lucide-react";

type PatientCard = {
  id?: number;
  name?: string;
  age?: number | null;
  gender?: string;
  stage?: string;
  diagnosis?: string;
  story?: string;
  lifestyle?: {
    diabetic?: boolean; exercise?: boolean; smokes?: boolean; highBP?: boolean;
  };
  riskFactors?: string[];
  improvements?: string[];
  vitals?: { bmi?: number | null; egfr?: number | null; hemoglobin?: number | null };
  labFlags?: string[];
  matchScore?: number;
  _id?: string;
};

// Prefer .env value; fall back to /api so you can use a Vite proxy in dev
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function Patients() {
  const [patients, setPatients] = useState<PatientCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  // modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PatientCard | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/patients?limit=9`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PatientCard[] = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Failed to load patients");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = p.name ?? "";
      const story = p.story ?? "";
      const stage = p.stage ?? "";
      const gender = p.gender ?? "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage =
        stageFilter === "all" || stage.toLowerCase().includes(stageFilter.toLowerCase());
      const matchesGender =
        genderFilter === "all" || gender.toLowerCase() === genderFilter.toLowerCase();
      return matchesSearch && matchesStage && matchesGender;
    });
  }, [patients, searchTerm, stageFilter, genderFilter]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Stage 1": return "bg-secondary text-secondary-foreground";
      case "Stage 2": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Stage 3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Stage 4": return "bg-warning/10 text-warning-foreground";
      case "Stage 5": return "bg-destructive/10 text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const topN = (arr: string[] | undefined, n: number) =>
    Array.isArray(arr) ? arr.slice(0, n) : [];

  const openModal = (p: PatientCard) => {
    setSelected(p);
    setOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-muted-foreground">Loading patients…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

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

        {/* Patient Cards (compact preview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p, index) => {
            const stage = p.stage || "Unknown";
            const vitals = p.vitals || {};
            const previewRisks = topN(p.riskFactors, 2);
            const previewFlags = topN(p.labFlags, 1);
            return (
              <Card
                key={p._id || p.id || index}
                className="shadow-card border-0 hover:shadow-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{p.name || `Patient ${index + 1}`}</CardTitle>
                      <CardDescription>
                        {p.age ? `${p.age} years old • ${p.gender ?? "—"}` : p.gender ?? "—"}
                      </CardDescription>
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
                  {/* minimal preview */}
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

                  <div className="pt-2">
                    <Button className="bg-green-500 w-full text-white px-4 py-2 rounded-lg 
                   hover:bg-green-600 transition-colors"
                      variant="outline"
                      onClick={() => openModal(p)}>
                      View details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="text-center py-12 shadow-card border-0 mt-6">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria to find more patient stories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ---------- Details Modal ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
          {selected && (
            <>
              <div className="bg-gradient-primary/10 px-6 py-5 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selected.age ? `${selected.age} years old • ${selected.gender ?? "—"}` : selected.gender ?? "—"}
                  </DialogDescription>
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

                  {/* vitals */}
                  {selected.vitals && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Vitals</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg bg-muted px-3 py-2">
                          <div className="text-xs text-muted-foreground">BMI</div>
                          <div className="font-medium">{selected.vitals.bmi ?? "—"}</div>
                        </div>
                        <div className="rounded-lg bg-muted px-3 py-2">
                          <div className="text-xs text-muted-foreground">eGFR</div>
                          <div className="font-medium">{selected.vitals.egfr ?? "—"}</div>
                        </div>
                        <div className="rounded-lg bg-muted px-3 py-2">
                          <div className="text-xs text-muted-foreground">Hemoglobin</div>
                          <div className="font-medium">{selected.vitals.hemoglobin ?? "—"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* risk factors */}
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

                  {/* lab flags */}
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

                  {/* similarity */}
                  {typeof selected.matchScore === "number" && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Similarity Match</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary rounded-full"
                            style={{ width: `${selected.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{selected.matchScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex justify-end">
                <Button onClick={() => setOpen(false)} className="px-6">
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
