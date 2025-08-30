import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import type { AppUser } from "@/App";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface SignupProps {
  onSignup: (u: AppUser) => void;
}

// 🔑 Password validation helper
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must contain at least one special character";
  return null;
}

export default function Signup({ onSignup }: SignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    medicalConditions: [] as string[],
    bloodType: "",
    familyHistory: "",
    physicalActivity: "",
    smoke: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setFormData((prev: any) => {
      const s = new Set(prev.medicalConditions);
      checked ? s.add(condition) : s.delete(condition);
      return { ...prev, medicalConditions: Array.from(s) };
    });
  };

  const handleBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate password strength
    const err = validatePassword(formData.password);
    if (err) {
      setPasswordError(err);
      toast.error(err);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordError(null);
    setStep(2);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age) || undefined,
        heightFeet: Number(formData.heightFeet) || undefined,
        heightInches: Number(formData.heightInches) || undefined,
        weight: Number(formData.weight) || undefined,
        registeredAt: new Date().toISOString(),
      };

      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Signup failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      const created: AppUser = data.user || {};
      if (data.id) created._id = data.id;

      localStorage.setItem("kidneyguard_user", JSON.stringify(created));
      if (created._id) localStorage.setItem("userId", created._id);

      onSignup(created);
      toast.success("Account created! Welcome to KidneyGuard.");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Heart className="h-12 w-12 text-primary" /></div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">KidneyGuard</h1>
          <p className="text-muted-foreground mt-2">Join us in protecting your kidney health</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Create Account" : "Lifestyle & Health Info"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Enter your basic information to get started"
                : "Provide your health details for personalized recommendations"}
            </CardDescription>
            <div className="flex justify-center space-x-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          {step === 1 ? (
            <form onSubmit={handleBasicInfo}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData((p: any) => ({ ...p, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((p: any) => ({ ...p, confirmPassword: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <div className="px-6 pb-6">
                <Button type="submit" className="w-full">Continue to Lifestyle Assessment</Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in here</Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleComplete}>
              <CardContent className="space-y-4">
                {/* Age + Gender */}
                <div className="flex gap-4">
                  <Input type="number" placeholder="Age" min={0}
                    value={formData.age}
                    onChange={(e) => setFormData((p: any) => ({ ...p, age: e.target.value }))}
                    required
                  />

                  <select className="w-full border rounded p-2" value={formData.gender}
                    onChange={(e) => setFormData((p: any) => ({ ...p, gender: e.target.value }))} required>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Height */}
                <div className="flex gap-2">
                  <Input type="number" placeholder="Feet" min={0}
                    value={formData.heightFeet}
                    onChange={(e) => setFormData((p: any) => ({ ...p, heightFeet: e.target.value }))} required />
                  <Input type="number" placeholder="Inches" min={0} max={11}
                    value={formData.heightInches}
                    onChange={(e) => setFormData((p: any) => ({ ...p, heightInches: e.target.value }))} required />
                </div>

                {/* Weight */}
                <Input type="number" placeholder="Weight (lb)" min={0} max={700}
                  value={formData.weight}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= 700) setFormData((p: any) => ({ ...p, weight: e.target.value }));
                  }}
                  required
                />

                {/* Medical Conditions */}
                <div>
                  <label className="block font-medium mb-1">Have you been diagnosed with:</label>
                  <div className="space-y-1">
                    {["Hypertension", "Diabetes"].map((c) => (
                      <label key={c} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.medicalConditions.includes(c)}
                          onChange={(e) => handleMedicalConditionChange(c, e.target.checked)}
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.medicalConditions.length === 0}
                        onChange={(e) => e.target.checked && setFormData((p: any) => ({ ...p, medicalConditions: [] }))}
                      />
                      <span>None</span>
                    </label>
                  </div>
                </div>

                {/* Blood Type */}
                <select className="w-full border rounded p-2" value={formData.bloodType}
                  onChange={(e) => setFormData((p: any) => ({ ...p, bloodType: e.target.value }))} required>
                  <option value="">Blood Type</option>
                  {["A", "B", "AB", "O"].map((t) => <option key={t}>{t}</option>)}
                </select>

                {/* Family History */}
                <div>
                  <label className="block font-medium mb-1">Family history of kidney disease?</label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt}>
                        <input type="radio" name="familyHistory" value={opt}
                          checked={formData.familyHistory === opt}
                          onChange={(e) => setFormData((p: any) => ({ ...p, familyHistory: e.target.value }))} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Physical Activity */}
                <div>
                  <label className="block font-medium mb-1">How active are you physically?</label>
                  <div className="flex gap-4">
                    {["Low", "Moderate", "High"].map((opt) => (
                      <label key={opt}>
                        <input
                          type="radio"
                          name="physicalActivity"
                          value={opt}
                          checked={formData.physicalActivity === opt}
                          onChange={(e) =>
                            setFormData((p: any) => ({ ...p, physicalActivity: e.target.value }))
                          }
                        />{" "}
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Smoking */}
                <div>
                  <label className="block font-medium mb-1">Do you smoke?</label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt}>
                        <input type="radio" name="smoke" value={opt}
                          checked={formData.smoke === opt}
                          onChange={(e) => setFormData((p: any) => ({ ...p, smoke: e.target.value }))} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>

              </CardContent>

              <div className="px-6 pb-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStep(1);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>

                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating Account..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
