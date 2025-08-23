import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import type { AppUser  } from "@/App";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface SignupProps {
  onSignup: (u: AppUser ) => void;
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
    medications: "",
    smokeAlcohol: "",
  });
  const [isLoading, setIsLoading] = useState(false);
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
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
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
        credentials: "include", // receive cookie if server sets one
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Signup failed (HTTP ${res.status})`);
      }

      const data = await res.json(); // { message, id, user }
      const created: AppUser  = data.user || {};
      if (data.id) created._id = data.id;

      // persist
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
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-secondary rounded-full shadow-glow animate-glow-pulse">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-secondary bg-clip-text text-transparent">KidneyGuard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Join us in protecting your kidney health</p>
        </div>

        <Card className="shadow-glow border-0 bg-gradient-card hover:shadow-warm transition-all duration-300">
          <CardHeader className="space-y-4">
            <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent font-bold">
              {step === 1 ? "Create Account" : "Health Assessment"}
            </CardTitle>
            <CardDescription className="text-center text-lg">
              {step === 1
                ? "Enter your basic information to get started"
                : "Provide your health details for personalized recommendations"}
            </CardDescription>
            <div className="flex justify-center space-x-3 mt-6">
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-primary shadow-glow' : 'bg-muted'}`} />
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-secondary shadow-glow' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          {step === 1 ? (
            <form onSubmit={handleBasicInfo}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                      className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                      className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData((p: any) => ({ ...p, password: e.target.value }))}
                        className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((p: any) => ({ ...p, confirmPassword: e.target.value }))}
                        className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 pb-6 space-y-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:shadow-glow text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  Continue to Health Assessment →
                </Button>
                <p className="text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:text-secondary font-medium transition-colors duration-300 hover:underline">Sign in here</Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleComplete}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        type="number" 
                        placeholder="Age" 
                        min={0}
                        value={formData.age} 
                        onChange={(e) => setFormData((p:any)=>({ ...p, age: e.target.value }))} 
                        className="h-12 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                        required 
                      />
                      <select 
                        className="h-12 w-full bg-background/50 border border-primary/20 rounded-md px-3 focus:border-primary transition-all duration-300" 
                        value={formData.gender}
                        onChange={(e) => setFormData((p:any)=>({ ...p, gender: e.target.value }))} 
                        required
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Height (ft)" 
                        min={0}
                        value={formData.heightFeet}
                        onChange={(e) => setFormData((p:any)=>({ ...p, heightFeet: e.target.value }))} 
                        className="h-12 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                        required 
                      />
                      <Input 
                        type="number" 
                        placeholder="Inches" 
                        min={0} 
                        max={11}
                        value={formData.heightInches}
                        onChange={(e) => setFormData((p:any)=>({ ...p, heightInches: e.target.value }))} 
                        className="h-12 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                        required 
                      />
                    </div>

                    <Input 
                      type="number" 
                      placeholder="Weight (lbs)"
                      value={formData.weight}
                      onChange={(e) => setFormData((p:any)=>({ ...p, weight: e.target.value }))} 
                      className="h-12 bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                      required 
                    />

                    <select 
                      className="h-12 w-full bg-background/50 border border-primary/20 rounded-md px-3 focus:border-primary transition-all duration-300" 
                      value={formData.bloodType}
                      onChange={(e) => setFormData((p:any)=>({ ...p, bloodType: e.target.value }))} 
                      required
                    >
                      <option value="">Blood Type</option>
                      {["A","B","AB","O"].map((t)=> <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-secondary">Health Information</h3>
                    
                    <div className="space-y-3">
                      <label className="block font-medium text-sm">Have you been diagnosed with:</label>
                      <div className="space-y-2 p-4 bg-gradient-to-r from-muted/30 to-primary/5 rounded-lg border border-primary/10">
                        {["Chronic Kidney Disease", "Hypertension", "Diabetes"].map((c) => (
                          <label key={c} className="flex items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              checked={formData.medicalConditions.includes(c)}
                              onChange={(e) => handleMedicalConditionChange(c, e.target.checked)}
                              className="w-4 h-4 text-primary border-primary/30 rounded focus:ring-primary/20"
                            />
                            <span>{c}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.medicalConditions.length === 0}
                            onChange={(e) => e.target.checked && setFormData((p:any)=>({ ...p, medicalConditions: [] }))}
                            className="w-4 h-4 text-primary border-primary/30 rounded focus:ring-primary/20"
                          />
                          <span>None</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-sm">Family history of kidney disease?</label>
                      <div className="flex gap-6">
                        {["Yes","No"].map((opt)=>(
                          <label key={opt} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="familyHistory" 
                              value={opt}
                              checked={formData.familyHistory===opt}
                              onChange={(e)=> setFormData((p:any)=>({ ...p, familyHistory: e.target.value }))} 
                              className="w-4 h-4 text-primary border-primary/30 focus:ring-primary/20"
                            /> 
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-sm">Smoking or alcohol consumption?</label>
                      <div className="flex gap-6">
                        {["Yes","No"].map((opt)=>(
                          <label key={opt} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="smokeAlcohol" 
                              value={opt}
                              checked={formData.smokeAlcohol===opt}
                              onChange={(e)=> setFormData((p:any)=>({ ...p, smokeAlcohol: e.target.value }))} 
                              className="w-4 h-4 text-primary border-primary/30 focus:ring-primary/20"
                            /> 
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <textarea 
                      className="w-full h-24 bg-background/50 border border-primary/20 rounded-md p-3 focus:border-primary transition-all duration-300 resize-none" 
                      placeholder="List medications (if any)"
                      value={formData.medications}
                      onChange={(e) => setFormData((p:any)=>({ ...p, medications: e.target.value }))} 
                    />
                  </div>
                </div>
              </CardContent>

              <div className="px-6 pb-6 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="flex-1 h-12 border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  ← Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 h-12 bg-gradient-secondary hover:shadow-glow text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
