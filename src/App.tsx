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

  const handleSignup = (userData: User) => {
    setUser(userData);
    localStorage.setItem('kidneyguard_user', JSON.stringify(userData));
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
                    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Did You Know? - Coming Soon</h1>
                        <p className="text-muted-foreground">CKD insights and educational content</p>
                      </div>
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/games" 
                element={
                  user ? (
                    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Play & Learn - Coming Soon</h1>
                        <p className="text-muted-foreground">Interactive games for kidney health education</p>
                      </div>
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/analysis" 
                element={
                  user ? (
                    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Lab Analysis - Coming Soon</h1>
                        <p className="text-muted-foreground">Upload and analyze your lab results</p>
                      </div>
                    </div>
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