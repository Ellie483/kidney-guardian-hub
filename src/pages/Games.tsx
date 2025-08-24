import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Apple, Heart, Zap } from "lucide-react";

// Import your game components here once separated
import PlateGame from "./PlateGame";
import DoctorGame from "./DoctorGame";
import RunnerGame from "./RunnerGame";

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Play & Learn</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fun, interactive games to learn about kidney health and make better
            lifestyle choices.
          </p>
        </div>

        {/* Game Selection */}
        {!activeGame ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              onClick={() => setActiveGame("plate")}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Apple className="h-12 w-12 text-secondary" />
                </div>
                <CardTitle>Build a Kidney-Safe Plate</CardTitle>
                <CardDescription>
                  Drag and drop foods to create the perfect kidney-friendly meal
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="secondary" className="mb-4">
                  Nutrition Game
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Learn which foods support kidney health and which to avoid.
                </p>
              </CardContent>
            </Card>

            <Card
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: "150ms" }}
              onClick={() => setActiveGame("doctor")}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Doctor for a Day</CardTitle>
                <CardDescription>
                  Diagnose patient cases and provide the right treatment advice
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="default" className="mb-4">
                  Medical Simulation
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Experience medical decision-making and learn about CKD
                  diagnosis.
                </p>
              </CardContent>
            </Card>

            <Card
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: "300ms" }}
              onClick={() => setActiveGame("runner")}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-warning" />
                </div>
                <CardTitle>Kidney Shield Runner</CardTitle>
                <CardDescription>
                  Collect healthy items and avoid harmful ones in this action
                  game
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-4">
                  Action Game
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Test your reflexes while learning about lifestyle choices.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setActiveGame(null)}
              className="flex items-center space-x-2"
            >
              <span>← Back to Games</span>
            </Button>

            {activeGame === "plate" && <PlateGame />}
            {activeGame === "doctor" && <DoctorGame />}
            {activeGame === "runner" && <RunnerGame />}
          </div>
        )}
      </div>
    </div>
  );
}
