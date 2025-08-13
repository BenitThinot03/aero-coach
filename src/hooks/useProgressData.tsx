import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ProgressMetric = 'weight' | 'calories' | 'protein' | 'carbs' | 'fat';

interface ProgressDataPoint {
  date: string;
  value: number;
}

interface MonthlyAverage {
  currentMonth: number;
  previousMonth: number;
  difference: number;
}

export const useProgressData = (metric: ProgressMetric) => {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressDataPoint[]>([]);
  const [monthlyAverage, setMonthlyAverage] = useState<MonthlyAverage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      
      if (metric === 'weight') {
        // Fetch from Measurement table
        const { data: weightData } = await supabase
          .from('Measurement')
          .select('weight, date')
          .eq('userid', user.id)
          .not('weight', 'is', null)
          .order('date', { ascending: true })
          .limit(30);

        if (weightData) {
          const formattedData = weightData.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Number(item.weight)
          }));
          setData(formattedData);
        }
      } else {
        // Fetch nutrition data and group by day
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: nutritionData } = await supabase
          .from('NutritionEntry')
          .select('date, calories, protein, carbs, fats')
          .eq('userid', user.id)
          .gte('date', thirtyDaysAgo.toISOString())
          .order('date', { ascending: true });

        if (nutritionData) {
          // Group by date and sum values
          const groupedData = nutritionData.reduce((acc, entry) => {
            const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) {
              acc[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            }
            acc[date].calories += entry.calories;
            acc[date].protein += entry.protein;
            acc[date].carbs += entry.carbs;
            acc[date].fats += entry.fats;
            return acc;
          }, {} as Record<string, any>);

          const formattedData = Object.entries(groupedData).map(([date, values]) => ({
            date,
            value: values[metric === 'fat' ? 'fats' : metric] || 0
          }));
          
          setData(formattedData);

          // Calculate monthly averages for nutrition metrics
          const nutritionMetric = metric === 'fat' ? 'fats' : metric;
          if (nutritionMetric === 'calories' || nutritionMetric === 'protein' || nutritionMetric === 'carbs' || nutritionMetric === 'fats') {
            await calculateMonthlyAverages(nutritionMetric);
          }
        }
      }
      
      setLoading(false);
    };

    const calculateMonthlyAverages = async (nutritionMetric: 'calories' | 'protein' | 'carbs' | 'fats') => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month data
      const { data: currentMonthData } = await supabase
        .from('NutritionEntry')
        .select('date, calories, protein, carbs, fats')
        .eq('userid', user.id)
        .gte('date', currentMonthStart.toISOString())
        .lte('date', now.toISOString());

      // Previous month data
      const { data: previousMonthData } = await supabase
        .from('NutritionEntry')
        .select('date, calories, protein, carbs, fats')
        .eq('userid', user.id)
        .gte('date', previousMonthStart.toISOString())
        .lte('date', previousMonthEnd.toISOString());

      if (currentMonthData && previousMonthData) {
        // Group and sum current month
        const currentGrouped = currentMonthData.reduce((acc, entry) => {
          const date = new Date(entry.date).toDateString();
          if (!acc[date]) {
            acc[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
          }
          acc[date][nutritionMetric] += entry[nutritionMetric];
          return acc;
        }, {} as Record<string, any>);

        // Group and sum previous month
        const previousGrouped = previousMonthData.reduce((acc, entry) => {
          const date = new Date(entry.date).toDateString();
          if (!acc[date]) {
            acc[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
          }
          acc[date][nutritionMetric] += entry[nutritionMetric];
          return acc;
        }, {} as Record<string, any>);

        const currentDays = Object.keys(currentGrouped).length || 1;
        const previousDays = Object.keys(previousGrouped).length || 1;

        const currentTotal = Object.values(currentGrouped).reduce((sum: number, day: any) => sum + day[nutritionMetric], 0);
        const previousTotal = Object.values(previousGrouped).reduce((sum: number, day: any) => sum + day[nutritionMetric], 0);

        const currentAvg = currentTotal / currentDays;
        const previousAvg = previousTotal / previousDays;

        setMonthlyAverage({
          currentMonth: Math.round(currentAvg),
          previousMonth: Math.round(previousAvg),
          difference: Math.round(currentAvg - previousAvg)
        });
      }
    };

    fetchData();
  }, [user, metric]);

  return { data, loading, monthlyAverage };
};