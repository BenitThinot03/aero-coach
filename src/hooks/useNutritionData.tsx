import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Activity {
  id: string;
  type: 'meal' | 'workout';
  title: string;
  details: string;
  date: Date;
  icon: 'Apple' | 'Dumbbell';
}

export const useNutritionData = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [todayNutrition, setTodayNutrition] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Default targets if user hasn't set custom ones
  const nutritionTargets = {
    calories: profile?.target_calories || 2200,
    protein: profile?.target_protein || 150,
    carbs: 275, // No target_carbs in profile table
    fats: profile?.target_fats || 73
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Get today's nutrition
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: nutritionData } = await supabase
        .from('NutritionEntry')
        .select('calories, protein, carbs, fats, date, mealtype, fooditems')
        .eq('userid', user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      if (nutritionData) {
        const totals = nutritionData.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fats: acc.fats + entry.fats
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
        setTodayNutrition(totals);
      }

      // Get recent activities (meals and workouts)
      const activities: Activity[] = [];

      // Add recent meals
      const { data: recentMeals } = await supabase
        .from('NutritionEntry')
        .select('id, date, mealtype, fooditems, calories')
        .eq('userid', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (recentMeals) {
        recentMeals.forEach(meal => {
          activities.push({
            id: meal.id,
            type: 'meal',
            title: `${meal.mealtype} - ${meal.fooditems}`,
            details: `${Math.round(meal.calories)} cal`,
            date: new Date(meal.date),
            icon: 'Apple'
          });
        });
      }

      // Add recent workouts
      const { data: recentWorkouts } = await supabase
        .from('WorkoutSession')
        .select('id, date, duration, caloriesburned')
        .eq('userid', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (recentWorkouts) {
        recentWorkouts.forEach(workout => {
          activities.push({
            id: workout.id,
            type: 'workout',
            title: 'Workout Session',
            details: `${workout.duration || 0} min • ${workout.caloriesburned || 0} cal`,
            date: new Date(workout.date),
            icon: 'Dumbbell'
          });
        });
      }

      // Sort all activities by date and take the 5 most recent
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentActivities(activities.slice(0, 5));
      
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return { todayNutrition, recentActivities, loading, nutritionTargets };
};