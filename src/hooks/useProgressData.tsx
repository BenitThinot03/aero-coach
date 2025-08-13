import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ProgressMetric = 'weight' | 'calories' | 'protein' | 'carbs' | 'fat';

interface ProgressDataPoint {
  date: string;
  value: number;
}

export const useProgressData = (metric: ProgressMetric) => {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressDataPoint[]>([]);
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
            date: new Date(item.date).toLocaleDateString(),
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
            const date = new Date(entry.date).toLocaleDateString();
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
            value: values[metric] || 0
          }));
          
          setData(formattedData);
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, [user, metric]);

  return { data, loading };
};