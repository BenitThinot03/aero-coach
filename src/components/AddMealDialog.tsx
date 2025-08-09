import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface AddMealDialogProps {
  onMealAdded: () => void;
}

interface PreviousMeal {
  id: string;
  mealtype: string;
  fooditems: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number | null;
  notes: string | null;
  is_favorite: boolean;
}

export const AddMealDialog = ({ onMealAdded }: AddMealDialogProps) => {
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState("");
  const [foodItems, setFoodItems] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [sugar, setSugar] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previousMeals, setPreviousMeals] = useState<PreviousMeal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPreviousMeals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("NutritionEntry")
        .select("*")
        .eq("userid", user.id)
        .order("date", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Remove duplicates based on fooditems
      const uniqueMeals = data.reduce((acc: PreviousMeal[], meal) => {
        const existing = acc.find(m => m.fooditems === meal.fooditems && m.mealtype === meal.mealtype);
        if (!existing) {
          acc.push(meal);
        }
        return acc;
      }, []);

      setPreviousMeals(uniqueMeals);
    } catch (error) {
      console.error("Error fetching previous meals:", error);
    }
  };

  const handleSelectPreviousMeal = (mealId: string) => {
    const meal = previousMeals.find(m => m.id === mealId);
    if (meal) {
      setMealType(meal.mealtype);
      setFoodItems(JSON.parse(meal.fooditems).join(", "));
      setCalories(meal.calories.toString());
      setProtein(meal.protein.toString());
      setCarbs(meal.carbs.toString());
      setFats(meal.fats.toString());
      setSugar(meal.sugar?.toString() || "");
      setNotes(meal.notes || "");
      setIsFavorite(meal.is_favorite);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mealType || !foodItems || !calories || !protein || !carbs || !fats) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("NutritionEntry")
        .insert({
          id: crypto.randomUUID(),
          userid: user.id,
          date: new Date().toISOString(),
          mealtype: mealType,
          fooditems: JSON.stringify(foodItems.split(",").map(item => item.trim())),
          calories: parseFloat(calories),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fats: parseFloat(fats),
          sugar: sugar ? parseFloat(sugar) : null,
          notes: notes || null,
          is_favorite: isFavorite,
        });

      if (error) throw error;

      toast({
        title: "Meal Added!",
        description: "Your meal has been logged successfully.",
      });

      setOpen(false);
      setMealType("");
      setFoodItems("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      setSugar("");
      setNotes("");
      setIsFavorite(false);
      setSelectedMealId("");
      onMealAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPreviousMeals();
    }
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddMeal} className="space-y-4">
          {previousMeals.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Add from Previous Meals</Label>
              <Select value={selectedMealId} onValueChange={(value) => {
                setSelectedMealId(value);
                handleSelectPreviousMeal(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a previous meal" />
                </SelectTrigger>
                <SelectContent>
                  {previousMeals.filter(meal => meal.is_favorite).map((meal) => (
                    <SelectItem key={`fav-${meal.id}`} value={meal.id}>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{JSON.parse(meal.fooditems).join(", ")} ({meal.mealtype})</span>
                      </div>
                    </SelectItem>
                  ))}
                  {previousMeals.filter(meal => !meal.is_favorite).map((meal) => (
                    <SelectItem key={meal.id} value={meal.id}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{JSON.parse(meal.fooditems).join(", ")} ({meal.mealtype})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foodItems">Food Items (comma separated)</Label>
            <Input
              id="foodItems"
              placeholder="e.g., Chicken breast, Brown rice, Broccoli"
              value={foodItems}
              onChange={(e) => setFoodItems(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                placeholder="e.g., 420"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="e.g., 30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="e.g., 45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                placeholder="e.g., 15"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sugar">Sugar (g) - Optional</Label>
            <Input
              id="sugar"
              type="number"
              step="0.1"
              placeholder="e.g., 10"
              value={sugar}
              onChange={(e) => setSugar(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this meal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={isFavorite}
              onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
            />
            <Label htmlFor="favorite" className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>Mark as favorite</span>
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Meal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};