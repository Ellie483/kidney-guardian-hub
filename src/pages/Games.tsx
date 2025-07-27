import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gamepad2, Trophy, Heart, Apple, Zap, Target, Clock, Star } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Food items for the plate game
const foodItems = [
  { id: 'salmon', name: 'Salmon', type: 'good', points: 10, category: 'protein' },
  { id: 'broccoli', name: 'Broccoli', type: 'good', points: 8, category: 'vegetable' },
  { id: 'rice', name: 'Brown Rice', type: 'good', points: 6, category: 'grain' },
  { id: 'apple', name: 'Apple', type: 'good', points: 7, category: 'fruit' },
  { id: 'water', name: 'Water', type: 'good', points: 10, category: 'drink' },
  { id: 'nuts', name: 'Almonds', type: 'good', points: 8, category: 'snack' },
  { id: 'chips', name: 'Potato Chips', type: 'bad', points: -5, category: 'snack' },
  { id: 'soda', name: 'Soda', type: 'bad', points: -8, category: 'drink' },
  { id: 'bacon', name: 'Bacon', type: 'bad', points: -7, category: 'protein' },
  { id: 'candy', name: 'Candy', type: 'bad', points: -6, category: 'snack' },
  { id: 'fastfood', name: 'Fast Food Burger', type: 'bad', points: -10, category: 'meal' },
  { id: 'fries', name: 'French Fries', type: 'bad', points: -8, category: 'side' },
];

// Patient cases for doctor simulator
const patientCases = [
  {
    id: 1,
    name: "Maria, 45",
    symptoms: ["Fatigue", "Swollen ankles", "Frequent urination", "High blood pressure"],
    correctTests: ["Blood creatinine", "BUN", "Urinalysis", "eGFR"],
    correctDiagnosis: "Stage 3 CKD",
    correctAdvice: "Dietary changes, blood pressure control, regular monitoring",
    backstory: "Type 2 diabetic for 10 years, recent routine bloodwork shows kidney concerns."
  },
  {
    id: 2,
    name: "John, 62",
    symptoms: ["Back pain", "Blood in urine", "Nausea", "Loss of appetite"],
    correctTests: ["CT scan", "Urinalysis", "Blood creatinine", "Kidney biopsy"],
    correctDiagnosis: "Acute kidney injury",
    correctAdvice: "Immediate hospitalization, IV fluids, medication review",
    backstory: "Recently started new medication, experiencing severe symptoms for 3 days."
  },
  {
    id: 3,
    name: "Sarah, 28",
    symptoms: ["Protein in urine", "High blood pressure", "Mild swelling"],
    correctTests: ["24-hour urine protein", "Blood pressure monitoring", "Kidney function tests"],
    correctDiagnosis: "Early CKD - Stage 1",
    correctAdvice: "Lifestyle modifications, blood pressure control, follow-up in 3 months",
    backstory: "Family history of kidney disease, found protein in routine pregnancy screening."
  }
];

// Runner game items
const runnerItems = [
  { id: 'water-bottle', name: 'Water Bottle', type: 'good', points: 10 },
  { id: 'apple-fruit', name: 'Apple', type: 'good', points: 8 },
  { id: 'exercise', name: 'Exercise Equipment', type: 'good', points: 12 },
  { id: 'vegetables', name: 'Fresh Vegetables', type: 'good', points: 9 },
  { id: 'cigarette', name: 'Cigarette', type: 'bad', points: -15 },
  { id: 'junk-food', name: 'Junk Food', type: 'bad', points: -10 },
  { id: 'alcohol', name: 'Alcohol', type: 'bad', points: -12 },
  { id: 'salt', name: 'Excess Salt', type: 'bad', points: -8 },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  
  // Plate Game State
  const [plateItems, setPlateItems] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState(foodItems);
  const [plateScore, setPlateScore] = useState(0);
  const [plateGameComplete, setPlateGameComplete] = useState(false);

  // Doctor Game State
  const [currentCase, setCurrentCase] = useState(0);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [selectedAdvice, setSelectedAdvice] = useState("");
  const [doctorScore, setDoctorScore] = useState(0);
  const [gameStep, setGameStep] = useState("case"); // case, tests, diagnosis, advice, results

  // Runner Game State
  const [runnerScore, setRunnerScore] = useState(0);
  const [runnerLife, setRunnerLife] = useState(100);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [runnerGameActive, setRunnerGameActive] = useState(false);

  // Plate Game Functions
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === "available" && destination.droppableId === "plate") {
      const item = availableItems[source.index];
      if (plateItems.length < 5) {
        setPlateItems([...plateItems, item]);
        setAvailableItems(availableItems.filter((_, index) => index !== source.index));
        setPlateScore(plateScore + item.points);
      }
    } else if (source.droppableId === "plate" && destination.droppableId === "available") {
      const item = plateItems[source.index];
      setAvailableItems([...availableItems, item]);
      setPlateItems(plateItems.filter((_, index) => index !== source.index));
      setPlateScore(plateScore - item.points);
    }
  };

  const finishPlateGame = () => {
    setPlateGameComplete(true);
  };

  const resetPlateGame = () => {
    setPlateItems([]);
    setAvailableItems(foodItems);
    setPlateScore(0);
    setPlateGameComplete(false);
  };

  // Doctor Game Functions
  const toggleTest = (test: string) => {
    setSelectedTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const submitDoctorGame = () => {
    const case_ = patientCases[currentCase];
    let score = 0;
    
    // Score tests (40 points max)
    const correctTests = selectedTests.filter(test => case_.correctTests.includes(test));
    score += correctTests.length * 10;
    
    // Score diagnosis (30 points max)
    if (selectedDiagnosis === case_.correctDiagnosis) score += 30;
    
    // Score advice (30 points max)  
    if (selectedAdvice === case_.correctAdvice) score += 30;

    setDoctorScore(score);
    setGameStep("results");
  };

  const nextCase = () => {
    if (currentCase < patientCases.length - 1) {
      setCurrentCase(currentCase + 1);
      setSelectedTests([]);
      setSelectedDiagnosis("");
      setSelectedAdvice("");
      setGameStep("case");
    }
  };

  // Runner Game Functions
  const collectItem = (item: any) => {
    setCollectedItems([...collectedItems, item.id]);
    setRunnerScore(runnerScore + Math.abs(item.points));
    
    if (item.type === 'bad') {
      setRunnerLife(Math.max(0, runnerLife - Math.abs(item.points)));
    } else {
      setRunnerLife(Math.min(100, runnerLife + 5));
    }
  };

  const startRunnerGame = () => {
    setRunnerGameActive(true);
    setRunnerScore(0);
    setRunnerLife(100);
    setCollectedItems([]);
  };

  const resetRunnerGame = () => {
    setRunnerGameActive(false);
    setRunnerScore(0);
    setRunnerLife(100);
    setCollectedItems([]);
  };

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
            Fun, interactive games to learn about kidney health and make better lifestyle choices.
          </p>
        </div>

        {!activeGame ? (
          /* Game Selection */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              onClick={() => setActiveGame('plate')}
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
                <Badge variant="secondary" className="mb-4">Nutrition Game</Badge>
                <p className="text-sm text-muted-foreground">
                  Learn which foods support kidney health and which to avoid.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: '150ms' }}
              onClick={() => setActiveGame('doctor')}
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
                <Badge variant="default" className="mb-4">Medical Simulation</Badge>
                <p className="text-sm text-muted-foreground">
                  Experience medical decision-making and learn about CKD diagnosis.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="shadow-card border-0 hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: '300ms' }}
              onClick={() => setActiveGame('runner')}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-warning" />
                </div>
                <CardTitle>Kidney Shield Runner</CardTitle>
                <CardDescription>
                  Collect healthy items and avoid harmful ones in this action game
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-4">Action Game</Badge>
                <p className="text-sm text-muted-foreground">
                  Test your reflexes while learning about lifestyle choices.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Game Content */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveGame(null)}
                className="flex items-center space-x-2"
              >
                <span>← Back to Games</span>
              </Button>
            </div>

            {/* Plate Game */}
            {activeGame === 'plate' && (
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Apple className="h-5 w-5" />
                        <span>Available Foods</span>
                      </CardTitle>
                      <CardDescription>Drag foods to your plate (max 5 items)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId="available">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-2 gap-2 min-h-[200px]"
                          >
                            {availableItems.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 rounded-lg border-2 text-center cursor-grab transition-colors ${
                                      item.type === 'good' 
                                        ? 'border-secondary bg-secondary/10 hover:bg-secondary/20' 
                                        : 'border-destructive bg-destructive/10 hover:bg-destructive/20'
                                    }`}
                                  >
                                    <div className="text-sm font-medium">{item.name}</div>
                                    <div className={`text-xs ${item.type === 'good' ? 'text-secondary' : 'text-destructive'}`}>
                                      {item.points > 0 ? '+' : ''}{item.points} pts
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <span>Your Plate</span>
                        </div>
                        <Badge variant={plateScore >= 30 ? "default" : plateScore >= 10 ? "secondary" : "destructive"}>
                          Score: {plateScore}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Build your kidney-safe meal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId="plate">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="border-2 border-dashed border-muted rounded-lg p-4 min-h-[200px] bg-muted/10"
                          >
                            {plateItems.length === 0 && (
                              <div className="text-center text-muted-foreground py-8">
                                Drag foods here to build your plate
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-2">
                              {plateItems.map((item, index) => (
                                <Draggable key={`${item.id}-plate`} draggableId={`${item.id}-plate`} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-2 rounded border ${
                                        item.type === 'good' ? 'border-secondary bg-secondary/10' : 'border-destructive bg-destructive/10'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">{item.name}</span>
                                        <span className="text-xs font-medium">{item.points > 0 ? '+' : ''}{item.points}</span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      
                      {plateItems.length > 0 && !plateGameComplete && (
                        <Button onClick={finishPlateGame} className="w-full mt-4">
                          Finish Meal
                        </Button>
                      )}

                      {plateGameComplete && (
                        <div className="mt-4 p-4 border rounded-lg bg-card">
                          <h4 className="font-medium mb-2">Meal Review</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Score:</span>
                              <span className="font-bold">{plateScore} points</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {plateScore >= 30 && "Excellent! This is a kidney-friendly meal."}
                              {plateScore >= 10 && plateScore < 30 && "Good choice! Consider swapping some items for even better kidney health."}
                              {plateScore < 10 && "This meal could be improved. Try adding more kidney-friendly foods."}
                            </div>
                          </div>
                          <Button onClick={resetPlateGame} variant="outline" className="w-full mt-3">
                            Try Again
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </DragDropContext>
            )}

            {/* Doctor Game */}
            {activeGame === 'doctor' && (
              <Card className="shadow-card border-0 max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Doctor for a Day - Case {currentCase + 1}</span>
                  </CardTitle>
                  <CardDescription>
                    {patientCases[currentCase].backstory}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {gameStep === "case" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Patient: {patientCases[currentCase].name}</h3>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Presenting Symptoms:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {patientCases[currentCase].symptoms.map(symptom => (
                              <Badge key={symptom} variant="outline">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setGameStep("tests")} className="w-full">
                        Order Tests
                      </Button>
                    </div>
                  )}

                  {gameStep === "tests" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Select Tests to Order:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "Blood creatinine", "BUN", "Urinalysis", "eGFR", 
                          "CT scan", "Kidney biopsy", "24-hour urine protein",
                          "Blood pressure monitoring", "Ultrasound", "MRI"
                        ].map(test => (
                          <div
                            key={test}
                            onClick={() => toggleTest(test)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTests.includes(test)
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="text-sm">{test}</div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => setGameStep("diagnosis")}
                        disabled={selectedTests.length === 0}
                        className="w-full"
                      >
                        Review Results & Diagnose
                      </Button>
                    </div>
                  )}

                  {gameStep === "diagnosis" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Based on test results, what's your diagnosis?</h3>
                        <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select diagnosis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Stage 1 CKD">Stage 1 CKD</SelectItem>
                            <SelectItem value="Stage 2 CKD">Stage 2 CKD</SelectItem>
                            <SelectItem value="Stage 3 CKD">Stage 3 CKD</SelectItem>
                            <SelectItem value="Acute kidney injury">Acute kidney injury</SelectItem>
                            <SelectItem value="Early CKD - Stage 1">Early CKD - Stage 1</SelectItem>
                            <SelectItem value="Kidney stones">Kidney stones</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={() => setGameStep("advice")}
                        disabled={!selectedDiagnosis}
                        className="w-full"
                      >
                        Provide Treatment Advice
                      </Button>
                    </div>
                  )}

                  {gameStep === "advice" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">What's your treatment recommendation?</h3>
                        <Select value={selectedAdvice} onValueChange={setSelectedAdvice}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment advice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dietary changes, blood pressure control, regular monitoring">
                              Dietary changes, blood pressure control, regular monitoring
                            </SelectItem>
                            <SelectItem value="Immediate hospitalization, IV fluids, medication review">
                              Immediate hospitalization, IV fluids, medication review
                            </SelectItem>
                            <SelectItem value="Lifestyle modifications, blood pressure control, follow-up in 3 months">
                              Lifestyle modifications, blood pressure control, follow-up in 3 months
                            </SelectItem>
                            <SelectItem value="Surgery consultation, pain management">
                              Surgery consultation, pain management
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={submitDoctorGame}
                        disabled={!selectedAdvice}
                        className="w-full"
                      >
                        Submit Case
                      </Button>
                    </div>
                  )}

                  {gameStep === "results" && (
                    <div className="space-y-6 text-center">
                      <div className="flex justify-center">
                        <Trophy className="h-16 w-16 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Case Complete!</h3>
                        <div className="text-3xl font-bold text-primary mb-4">{doctorScore}/100 points</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Correct tests: {selectedTests.filter(test => patientCases[currentCase].correctTests.includes(test)).length}/{patientCases[currentCase].correctTests.length}</p>
                          <p>Diagnosis: {selectedDiagnosis === patientCases[currentCase].correctDiagnosis ? "Correct!" : "Incorrect"}</p>
                          <p>Treatment: {selectedAdvice === patientCases[currentCase].correctAdvice ? "Correct!" : "Needs improvement"}</p>
                        </div>
                      </div>
                      {currentCase < patientCases.length - 1 ? (
                        <Button onClick={nextCase} className="w-full">
                          Next Case
                        </Button>
                      ) : (
                        <Button onClick={() => setActiveGame(null)} className="w-full">
                          Complete Training
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Runner Game */}
            {activeGame === 'runner' && (
              <Card className="shadow-card border-0 max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Kidney Shield Runner</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="default">Score: {runnerScore}</Badge>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <Progress value={runnerLife} className="w-20 h-2" />
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Collect healthy items (green) and avoid harmful ones (red) to protect your kidneys!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!runnerGameActive ? (
                    <div className="text-center space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                            <Apple className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-xs">Healthy Foods<br/>+Points +Health</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-xs">Harmful Items<br/>-Health</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-xs">Collect Items<br/>Click to Grab</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-xs">High Score<br/>Stay Healthy!</p>
                        </div>
                      </div>
                      <Button onClick={startRunnerGame} size="lg" className="w-full">
                        Start Game
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {runnerItems.map((item, index) => (
                          <div
                            key={`${item.id}-${index}`}
                            onClick={() => collectItem(item)}
                            className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-transform hover:scale-105 ${
                              item.type === 'good'
                                ? 'border-secondary bg-secondary/10 hover:bg-secondary/20'
                                : 'border-destructive bg-destructive/10 hover:bg-destructive/20'
                            } ${collectedItems.includes(item.id) ? 'opacity-50' : ''}`}
                            style={{
                              animationDelay: `${index * 200}ms`,
                              animation: collectedItems.includes(item.id) ? 'none' : 'pulse-gentle 2s infinite'
                            }}
                          >
                            <div className="text-sm font-medium mb-1">{item.name}</div>
                            <div className={`text-xs ${item.type === 'good' ? 'text-secondary' : 'text-destructive'}`}>
                              {item.points > 0 ? '+' : ''}{Math.abs(item.points)} pts
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {runnerLife <= 0 && (
                        <div className="text-center space-y-4 p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                          <h3 className="text-xl font-bold text-destructive">Game Over!</h3>
                          <p>Your kidney health reached critical levels. Final Score: {runnerScore}</p>
                          <Button onClick={resetRunnerGame} variant="outline">
                            Play Again
                          </Button>
                        </div>
                      )}

                      {runnerLife > 0 && (
                        <div className="flex justify-center space-x-4">
                          <Button onClick={resetRunnerGame} variant="outline">
                            Reset Game
                          </Button>
                          <Button onClick={() => setActiveGame(null)}>
                            Finish Game
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}