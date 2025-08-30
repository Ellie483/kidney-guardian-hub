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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Apple, Target } from "lucide-react";

const foodItems = [
  { id: "apple", name: "Apple", emoji: "🍎", type: "good", points: 7 },
  { id: "avocado", name: "Avocado", emoji: "🥑", type: "good", points: 7 },
  { id: "bacon", name: "Bacon", emoji: "🥓", type: "bad", points: -7 },
  { id: "banana", name: "Banana", emoji: "🍌", type: "good", points: 6 },
  { id: "beer", name: "Beer", emoji: "🍺", type: "bad", points: -10 },
  { id: "bento", name: "Bento Box", emoji: "🍱", type: "good", points: 6 },
  {
    id: "blueberries",
    name: "Blueberries",
    emoji: "🫐",
    type: "good",
    points: 9,
  },
  { id: "bread", name: "Bread", emoji: "🍞", type: "good", points: 4 },
  { id: "broccoli", name: "Broccoli", emoji: "🥦", type: "good", points: 8 },
  { id: "burger", name: "Burger", emoji: "🍔", type: "bad", points: -7 },
  { id: "butter", name: "Butter", emoji: "🧈", type: "bad", points: -4 },
  { id: "cake", name: "Cake", emoji: "🍰", type: "bad", points: -8 },
  { id: "candy", name: "Candy", emoji: "🍬", type: "bad", points: -9 },
  { id: "carrot", name: "Carrot", emoji: "🥕", type: "good", points: 7 },
  { id: "cheese", name: "Cheese", emoji: "🧀", type: "bad", points: -3 },
  { id: "chicken", name: "Chicken", emoji: "🍗", type: "good", points: 8 },
  { id: "chips", name: "Potato Chips", emoji: "🍟", type: "bad", points: -5 },
  { id: "chocolate", name: "Chocolate", emoji: "🍫", type: "bad", points: -6 },
  { id: "coconut", name: "Coconut", emoji: "🥥", type: "good", points: 5 },
  { id: "coffee", name: "Coffee", emoji: "☕", type: "bad", points: -2 },
  { id: "cookie", name: "Cookie", emoji: "🍪", type: "bad", points: -6 },
  { id: "corn", name: "Corn", emoji: "🌽", type: "good", points: 5 },
  { id: "cucumber", name: "Cucumber", emoji: "🥒", type: "good", points: 5 },
  { id: "curry", name: "Curry", emoji: "🍛", type: "good", points: 5 },
  { id: "donut", name: "Donut", emoji: "🍩", type: "bad", points: -6 },
  { id: "egg", name: "Boiled Egg", emoji: "🥚", type: "good", points: 7 },
  {
    id: "energy_drink",
    name: "Energy Drink",
    emoji: "⚡",
    type: "bad",
    points: -9,
  },
  { id: "fishcake", name: "Fish Cake", emoji: "🍥", type: "good", points: 6 },
  { id: "garlic", name: "Garlic", emoji: "🧄", type: "good", points: 4 },
  { id: "grapes", name: "Grapes", emoji: "🍇", type: "good", points: 6 },
  { id: "green_tea", name: "Green Tea", emoji: "🍵", type: "good", points: 5 },
  { id: "honey", name: "Honey", emoji: "🍯", type: "good", points: 4 },
  { id: "hotdog", name: "Hot Dog", emoji: "🌭", type: "bad", points: -6 },
  { id: "icecream", name: "Ice Cream", emoji: "🍨", type: "bad", points: -7 },
  { id: "juice", name: "Juice", emoji: "🧃", type: "bad", points: -4 },
  { id: "kiwi", name: "Kiwi", emoji: "🥝", type: "good", points: 7 },
  { id: "lemon", name: "Lemon", emoji: "🍋", type: "good", points: 5 },
  { id: "meat", name: "Meat", emoji: "🍖", type: "bad", points: -4 },
  { id: "milk", name: "Milk", emoji: "🥛", type: "good", points: 5 },
  { id: "mushroom", name: "Mushroom", emoji: "🍄", type: "good", points: 6 },
  { id: "onion", name: "Onion", emoji: "🧅", type: "good", points: 5 },
  { id: "orange", name: "Orange", emoji: "🍊", type: "good", points: 6 },
  { id: "pancakes", name: "Pancakes", emoji: "🥞", type: "bad", points: -4 },
  { id: "peach", name: "Peach", emoji: "🍑", type: "good", points: 6 },
  { id: "pear", name: "Pear", emoji: "🍐", type: "good", points: 6 },
  { id: "pineapple", name: "Pineapple", emoji: "🍍", type: "good", points: 6 },
  { id: "pizza", name: "Pizza", emoji: "🍕", type: "bad", points: -6 },
  { id: "ramen", name: "Ramen", emoji: "🍜", type: "bad", points: -7 },
  { id: "rice", name: "Brown Rice", emoji: "🍚", type: "good", points: 6 },
  { id: "riceball", name: "Rice Ball", emoji: "🍙", type: "good", points: 5 },
  { id: "salad", name: "Salad", emoji: "🥗", type: "good", points: 9 },
  { id: "salmon", name: "Salmon", emoji: "🐟", type: "good", points: 10 },
  { id: "sandwich", name: "Sandwich", emoji: "🥪", type: "good", points: 5 },
  { id: "shrimp", name: "Shrimp", emoji: "🦐", type: "good", points: 9 },
  { id: "soda", name: "Soda", emoji: "🥤", type: "bad", points: -8 },
  { id: "soup", name: "Soup", emoji: "🍲", type: "good", points: 6 },
  { id: "spinach", name: "Spinach", emoji: "🥬", type: "good", points: 8 },
  { id: "steak", name: "Steak", emoji: "🥩", type: "bad", points: -5 },
  {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    type: "good",
    points: 7,
  },
  { id: "tea", name: "Tea", emoji: "🍵", type: "good", points: 4 },
  { id: "tomato", name: "Tomato", emoji: "🍅", type: "good", points: 6 },
  { id: "turkey", name: "Turkey", emoji: "🦃", type: "good", points: 7 },
  { id: "water", name: "Water", emoji: "💧", type: "good", points: 10 },
  { id: "wine", name: "Wine", emoji: "🍷", type: "bad", points: -8 },
  { id: "yogurt", name: "Yogurt", emoji: "🥣", type: "good", points: 6 },
  { id: "tofu", name: "Tofu", emoji: "🧈", type: "good", points: 7 }, // emoji reused
  { id: "lentils", name: "Lentils", emoji: "🥣", type: "good", points: 8 },
  {
    id: "sweet_potato",
    name: "Sweet Potato",
    emoji: "🍠",
    type: "good",
    points: 7,
  },
  { id: "noodles", name: "Noodles", emoji: "🍜", type: "bad", points: -5 },
  {
    id: "fried_rice",
    name: "Fried Rice",
    emoji: "🍚",
    type: "bad",
    points: -5,
  },
  { id: "dumplings", name: "Dumplings", emoji: "🥟", type: "bad", points: -5 },
  {
    id: "spring_roll",
    name: "Spring Roll",
    emoji: "🥟",
    type: "bad",
    points: -4,
  },
  { id: "samosa", name: "Samosa", emoji: "🥟", type: "bad", points: -6 },
  { id: "pickles", name: "Pickles", emoji: "🥒", type: "bad", points: -3 },
  {
    id: "mayonnaise",
    name: "Mayonnaise",
    emoji: "🧴",
    type: "bad",
    points: -5,
  },
  { id: "ketchup", name: "Ketchup", emoji: "🧃", type: "bad", points: -4 },
  { id: "jam", name: "Jam", emoji: "🍓", type: "bad", points: -5 },
  { id: "oats", name: "Oats", emoji: "🥣", type: "good", points: 7 },
  { id: "cereal", name: "Cereal", emoji: "🥣", type: "bad", points: -3 },
  {
    id: "buttermilk",
    name: "Buttermilk",
    emoji: "🥛",
    type: "good",
    points: 6,
  },
  { id: "chapati", name: "Chapati", emoji: "🍞", type: "good", points: 5 },
  { id: "naan", name: "Naan", emoji: "🍞", type: "good", points: 4 },
  { id: "dal", name: "Dal", emoji: "🥣", type: "good", points: 8 },
  {
    id: "green_beans",
    name: "Green Beans",
    emoji: "🫘",
    type: "good",
    points: 6,
  },
  { id: "eggplant", name: "Eggplant", emoji: "🍆", type: "good", points: 6 },
  { id: "pork", name: "Pork", emoji: "🍖", type: "bad", points: -5 },
  { id: "beef", name: "Beef", emoji: "🥩", type: "bad", points: -6 },
  { id: "sausage", name: "Sausage", emoji: "🌭", type: "bad", points: -6 },
];

export default function PlateGame() {
  const [plateItems, setPlateItems] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState(foodItems);
  const [plateScore, setPlateScore] = useState(0);
  const [plateGameComplete, setPlateGameComplete] = useState(false);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === "available" &&
      destination.droppableId === "plate"
    ) {
      const item = availableItems[source.index];
      if (plateItems.length < 15) {
        setPlateItems([...plateItems, item]);
        setAvailableItems(
          availableItems.filter((_, index) => index !== source.index),
        );
        setPlateScore(plateScore + item.points);
      }
    } else if (
      source.droppableId === "plate" &&
      destination.droppableId === "available"
    ) {
      const item = plateItems[source.index];
      setAvailableItems([...availableItems, item]);
      setPlateItems(plateItems.filter((_, index) => index !== source.index));
      setPlateScore(plateScore - item.points);
    }
  };

  const finishPlateGame = () => setPlateGameComplete(true);
  const resetPlateGame = () => {
    setPlateItems([]);
    setAvailableItems(foodItems);
    setPlateScore(0);
    setPlateGameComplete(false);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
        {/* Available Foods */}
        <div className="overflow-y-auto h-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5" />
                <span>Available Foods</span>
              </CardTitle>
              <CardDescription>
                Drag foods to your plate (max 15 items)
              </CardDescription>
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
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 rounded-lg border text-center cursor-grab bg-muted"
                          >
                            <div className="text-2xl mb-1">{item.emoji}</div>
                            <div className="text-sm font-medium">
                              {item.name}
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
        </div>

        {/* Your Plate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Your Plate</span>
              </div>
            </CardTitle>
            <CardDescription>Check your daily eating habit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="plate">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="sticky top-0 border-2 border-dashed rounded-lg p-4 min-h-[500px] bg-center bg-no-repeat bg-cover relative"
                  style={{
                    backgroundImage: 'url("/a.jpeg")', // Replace with your actual image path
                  }}
                >
                  {plateItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-center">
                      Drag foods here to build your plate
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 flex flex-wrap justify-center items-center gap-2 p-4">
                    {plateItems.map((item, index) => (
                      <Draggable
                        key={`${item.id}-plate`}
                        draggableId={`${item.id}-plate`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`w-[80px] h-[80px] flex flex-col justify-center items-center rounded-lg border text-center p-2 shadow-md hover:scale-105 transition-transform
                              ${plateGameComplete ? (item.type === "good" ? "bg-green-200" : "bg-red-200") : "bg-muted"}`}
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="text-sm">{item.name}</span>
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
                Check Diet
              </Button>
            )}

            {plateGameComplete && (
              <div className="mt-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium mb-2">Meal Review</h4>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {plateScore >= 30 &&
                      "Good choice of diet for kidney safety"}
                    {plateScore >= 10 &&
                      plateScore < 30 &&
                      "Good choice of diet for kidney safety"}
                    {plateScore < 10 &&
                      "This diet could harm your kidney.You should reconsider and change your diet!"}
                  </div>
                </div>
                <Button
                  onClick={resetPlateGame}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DragDropContext>
  );
}
