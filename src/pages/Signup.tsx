import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, User, Mail, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SignupProps {
  onSignup: (userData: any) => void;
}

const lifestyleQuestions = [
  { id: "smokes", label: "Do you smoke or use tobacco?" },
  { id: "diabetic", label: "Do you have diabetes?" },
  { id: "highBP", label: "Do you have high blood pressure?" },
  { id: "exercise", label: "Do you exercise regularly (3+ times per week)?" },
  { id: "familyHistory", label: "Does your family have a history of kidney disease?" },
  { id: "heartDisease", label: "Do you have heart disease?" },
];

export default function Signup({ onSignup }: SignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    lifestyle: {} as Record<string, boolean>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleLifestyleChange = (questionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [questionId]: checked
      }
    }));
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const userData = {
        name: formData.name,
        email: formData.email,
        lifestyle: formData.lifestyle,
        registeredAt: new Date().toISOString(),
      };
      
      onSignup(userData);
      toast.success("Account created successfully! Welcome to KidneyGuard.");
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
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

        <Card className="shadow-card border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Create Account" : "Lifestyle Assessment"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "Enter your basic information to get started"
                : "Help us personalize your experience"
              }
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
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button type="submit" className="w-full">
                  Continue to Lifestyle Assessment
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleComplete}>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Please answer these questions to help us provide personalized recommendations:
                </p>
                {lifestyleQuestions.map((question) => (
                  <div key={question.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={question.id}
                      checked={formData.lifestyle[question.id] || false}
                      onCheckedChange={(checked) => 
                        handleLifestyleChange(question.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={question.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {question.label}
                    </Label>
                  </div>
                ))}
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