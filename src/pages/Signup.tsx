import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

interface SignupProps {
  onSignup: (userData: any) => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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

  // Step 1: Basic Info
  const handleBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(2);
  };

  // Step 2: Handle checkbox changes for medical conditions
  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => {
      const updatedConditions = checked
        ? [...prev.medicalConditions, condition]
        : prev.medicalConditions.filter(c => c !== condition);
      return { ...prev, medicalConditions: updatedConditions };
    });
  };

  // Step 2: Complete Signup
  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const userData = { ...formData, registeredAt: new Date().toISOString() };
      onSignup(userData);
      toast.success("Account created successfully! Welcome to KidneyGuard.");
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            KidneyGuard
          </h1>
          <p className="text-muted-foreground mt-2">
            Join us in protecting your kidney health
          </p>
        </div>

        {/* Card */}
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

          {/* Form */}
          {step === 1 ? (
            <form onSubmit={handleBasicInfo}>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                {/* Age */}
                <Input
                  type="number"
                  placeholder="Age"
                  min={0}
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  required
                />

                {/* Gender */}
                <select
                  className="w-full border rounded p-2"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>

                {/* Height */}
                <div className="flex space-x-2">
                  {/* Feet */}
                  <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Feet"
                    min={0}
                    value={formData.heightFeet}
                    onChange={(e) => setFormData(prev => ({ ...prev, heightFeet: e.target.value }))}
                    required
                  />
                  </div>

                  {/* Inches */}
                  <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Inches"
                    min={0}
                    max={11}
                    value={formData.heightInches}
                    onChange={(e) => setFormData(prev => ({ ...prev, heightInches: e.target.value }))}
                    required
                  />
                  </div>
                </div>


                {/* Weight */}
                <Input
                  type="number"
                  placeholder="Weight (lb)"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />

                {/* Medical Conditions */}
                <div>
                  <label className="block font-medium mb-1">Have you been diagnosed with:</label>
                  <div className="space-y-1">
                    {["Chronic Kidney Disease", "Hypertension", "Diabetes","None"].map(condition => (
                      <label key={condition} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.medicalConditions.includes(condition)}
                          onChange={(e) => handleMedicalConditionChange(condition, e.target.checked)}
                        />
                        <span>{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Blood Type */}
                <select
                  className="w-full border rounded p-2"
                  value={formData.bloodType}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                  required
                >
                  <option value="">Blood Type</option>
                  {["A", "B", "AB", "O"].map(type => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

                {/* Family History */}
                <div>
                  <label className="block font-medium mb-1">Family history of kidney disease?</label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map(option => (
                      <label key={option}>
                        <input
                          type="radio"
                          name="familyHistory"
                          value={option}
                          checked={formData.familyHistory === option}
                          onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
                        />{" "}
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Smoking / Alcohol */}
                <div>
                  <label className="block font-medium mb-1">Smoking or alcohol consumption?</label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map(option => (
                      <label key={option}>
                        <input
                          type="radio"
                          name="smokeAlcohol"
                          value={option}
                          checked={formData.smokeAlcohol === option}
                          onChange={(e) => setFormData(prev => ({ ...prev, smokeAlcohol: e.target.value }))}
                        />{" "}
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <textarea
                  className="w-full border rounded p-2"
                  placeholder="List medications affecting kidney function (if any)"
                  value={formData.medications}
                  onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                />

                
              </CardContent>

              <div className="px-6 pb-6 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
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

