import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, MessageCircle, Search } from "lucide-react";

export const NutritionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);

  const todayMeals = [
    {
      id: 1,
      type: "Breakfast",
      time: "8:30 AM",
      foods: ["Oatmeal", "Banana", "Almonds"],
      calories: 420,
      protein: 15,
      carbs: 65,
      fats: 12
    },
    {
      id: 2,
      type: "Lunch",
      time: "12:45 PM",
      foods: ["Grilled Chicken", "Brown Rice", "Broccoli"],
      calories: 580,
      protein: 45,
      carbs: 55,
      fats: 8
    }
  ];

  const totalNutrition = {
    calories: 1000,
    protein: 60,
    carbs: 120,
    fats: 20,
    goal: {
      calories: 2200,
      protein: 150,
      carbs: 275,
      fats: 73
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Calories</span>
              <span className="text-sm font-medium">
                {totalNutrition.calories} / {totalNutrition.goal.calories}
              </span>
            </div>
            <div className="w-full bg-fitness-gray rounded-full h-2">
              <div 
                className="bg-fitness-blue h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((totalNutrition.calories / totalNutrition.goal.calories) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{totalNutrition.protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-xs text-muted-foreground">/ {totalNutrition.goal.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{totalNutrition.carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-xs text-muted-foreground">/ {totalNutrition.goal.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-orange-600">{totalNutrition.fats}g</p>
              <p className="text-xs text-muted-foreground">Fats</p>
              <p className="text-xs text-muted-foreground">/ {totalNutrition.goal.fats}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Today's Meals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today's Meals</h2>
        
        {todayMeals.map((meal) => (
          <Card key={meal.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{meal.type}</h3>
                <span className="text-sm text-muted-foreground">{meal.time}</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {meal.foods.map((food, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {food}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                <div>
                  <p className="font-medium">{meal.calories}</p>
                  <p className="text-muted-foreground">cal</p>
                </div>
                <div>
                  <p className="font-medium">{meal.protein}g</p>
                  <p className="text-muted-foreground">protein</p>
                </div>
                <div>
                  <p className="font-medium">{meal.carbs}g</p>
                  <p className="text-muted-foreground">carbs</p>
                </div>
                <div>
                  <p className="font-medium">{meal.fats}g</p>
                  <p className="text-muted-foreground">fats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Assistant Button */}
      <Button 
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 right-4 rounded-full w-14 h-14 bg-fitness-blue hover:bg-fitness-blue-dark"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Simple Chat Placeholder */}
      {showChat && (
        <Card className="fixed bottom-40 left-4 right-4 max-h-60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nutrition Assistant</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Hello! I can help you with nutrition advice and meal planning. What would you like to know?</p>
            <Input placeholder="Ask me about nutrition..." className="mt-2" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};