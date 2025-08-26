import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Patients from "./pages/Patients";
import Awareness from "./pages/Awareness";
import Games from "./pages/Games";
import LabAnalysis from "./pages/LabAnalysis";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Match your backend schema
export interface AppUser  {
  _id?: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  medicalConditions?: string[];
  bloodType?: string;
  familyHistory?: string;
  medications?: string;
  smokeAlcohol?: "Yes" | "No";
  registeredAt?: string;
}

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const App = () => {
  const [user, setUser] = useState<AppUser  | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kidneyguard_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("kidneyguard_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Called by <Signup />
  const handleSignup = (createdUser: AppUser ) => {
    setUser(createdUser);
    localStorage.setItem("kidneyguard_user", JSON.stringify(createdUser));
    if (createdUser._id) localStorage.setItem("userId", createdUser._id);
  };

  // Called by <Login />
  const handleLogin = (loggedInUser: AppUser ) => {
    setUser(loggedInUser);
    localStorage.setItem("kidneyguard_user", JSON.stringify(loggedInUser));
    if (loggedInUser._id) localStorage.setItem("userId", loggedInUser._id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("kidneyguard_user");
    localStorage.removeItem("userId");
    // optional: call backend to clear cookie
    fetch(`${API}/users/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
        <div className="animate-pulse-gentle">
          <div className="h-12 w-12 bg-primary rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar isAuthenticated={!!user} onLogout={handleLogout} />
            <Routes>
              <Route
                path="/"
                element={user ? <Dashboard user={user as any} /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
              />
              <Route
                path="/signup"
                element={user ? <Navigate to="/" replace /> : <Signup onSignup={handleSignup} />}
              />
              <Route
                path="/patients"
                element={user ? <Patients /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/awareness"
                element={user ? <Awareness /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/games"
                element={user ? <Games /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/analysis"
                element={user ? <LabAnalysis /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/profile"
                element={user ? <Profile /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/admin"
                element={user ? <AdminDashboard /> : <Navigate to="/login" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
