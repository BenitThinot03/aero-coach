import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, MessageCircle, Search } from "lucide-react";
import { AddMealDialog } from "@/components/AddMealDialog";
import { NutritionDonutChart } from "@/components/NutritionDonutChart";
import { useNutritionData } from "@/hooks/useNutritionData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const NutritionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const { todayNutrition, nutritionTargets, loading } = useNutritionData();
  const { user } = useAuth();

  const fetchMeals = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("NutritionEntry")
        .select("*")
        .eq("userid", user.id)
        .gte("date", today)
        .lt("date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .order("date", { ascending: false });

      if (error) throw error;
      
      setTodayMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

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
          <AddMealDialog onMealAdded={fetchMeals} />
        </div>
      </div>

      {/* Daily Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NutritionDonutChart
                label="Calories"
                current={todayNutrition.calories}
                target={nutritionTargets.calories}
                color="hsl(var(--primary))"
                unit="kcal"
              />
              <NutritionDonutChart
                label="Protein"
                current={todayNutrition.protein}
                target={nutritionTargets.protein}
                color="hsl(var(--secondary))"
                unit="g"
              />
              <NutritionDonutChart
                label="Carbs"
                current={todayNutrition.carbs}
                target={nutritionTargets.carbs}
                color="hsl(var(--accent))"
                unit="g"
              />
              <NutritionDonutChart
                label="Fat"
                current={todayNutrition.fats}
                target={nutritionTargets.fats}
                color="hsl(var(--destructive))"
                unit="g"
              />
            </div>
          )}
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
        
        {todayMeals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No meals logged today. Add your first meal to start tracking!
            </CardContent>
          </Card>
        ) : (
          todayMeals.map((meal) => {
            const foodItems = JSON.parse(meal.fooditems || '[]');
            return (
              <Card key={meal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{meal.mealtype}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {foodItems.map((food: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div>
                      <p className="font-medium">{Math.round(meal.calories)}</p>
                      <p className="text-muted-foreground">cal</p>
                    </div>
                    <div>
                      <p className="font-medium">{Math.round(meal.protein)}g</p>
                      <p className="text-muted-foreground">protein</p>
                    </div>
                    <div>
                      <p className="font-medium">{Math.round(meal.carbs)}g</p>
                      <p className="text-muted-foreground">carbs</p>
                    </div>
                    <div>
                      <p className="font-medium">{Math.round(meal.fats)}g</p>
                      <p className="text-muted-foreground">fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* AI Assistant Button */}
      <Button 
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 right-4 rounded-full w-14 h-14"
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