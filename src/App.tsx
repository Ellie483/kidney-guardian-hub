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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  name: string;
  email: string;
  lifestyle: Record<string, boolean>;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('kidneyguard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    // Mock user data for demo
    const mockUser = {
      name: "John Doe",
      email: email,
      lifestyle: {
        smokes: false,
        diabetic: true,
        highBP: false,
        exercise: true,
        familyHistory: true,
      }
    };
    setUser(mockUser);
    localStorage.setItem('kidneyguard_user', JSON.stringify(mockUser));
  };

  const handleSignup = async (userData: User) => {
  try {
    console.log("➡️ Sending signup data:", userData);

    // Send data to backend
    const response = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to store user in MongoDB");
    }

    const result = await response.json();
    console.log("✅ Server response:", result);

    // Save in React state + localStorage
    setUser(result.user);
    localStorage.setItem("kidneyguard_user", JSON.stringify(result.user));

    alert("Registration complete!");
  } catch (error) {
    console.error("❌ Signup error:", error);
    alert("Signup failed. Please try again.");
  }
};

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kidneyguard_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
        <div className="animate-pulse-gentle">
          <div className="h-12 w-12 bg-primary rounded-full"></div>
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
                element={
                  user ? (
                    <Dashboard user={user} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/login" 
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                } 
              />
              <Route 
                path="/signup" 
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Signup onSignup={handleSignup} />
                  )
                } 
              />
              <Route 
                path="/patients" 
                element={
                  user ? (
                    <Patients />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/awareness" 
                element={
                  user ? (
                    <Awareness />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/games" 
                element={
                  user ? (
                    <Games />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/analysis" 
                element={
                  user ? (
                    <LabAnalysis />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
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