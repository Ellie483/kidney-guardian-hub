import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import type { AppUser } from "@/App";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface LoginProps {
  onLogin: (u: AppUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Login failed (HTTP ${res.status})`);
      }
      const data = await res.json(); // { ok: true, id, user }
      const u: AppUser = data.user || {};
      if (data.id) u._id = data.id;

      localStorage.setItem("kidneyguard_user", JSON.stringify(u));
      if (u._id) localStorage.setItem("userId", u._id);

      onLogin(u);
      toast.success("Welcome back! Logged in successfully.");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full shadow-glow animate-glow-pulse">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">KidneyGuard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your partner in kidney health</p>
        </div>

        <Card className="shadow-glow border-0 bg-gradient-card hover:shadow-warm transition-all duration-300">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-3xl bg-gradient-secondary bg-clip-text text-transparent font-bold">Welcome back</CardTitle>
            <CardDescription className="text-lg">Continue your kidney health journey</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-primary hover:shadow-glow text-white font-medium transition-all duration-300 hover:scale-105" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
              <p className="text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-secondary font-medium transition-colors duration-300 hover:underline">Sign up here</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
