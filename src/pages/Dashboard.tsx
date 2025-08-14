import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Apple } from "lucide-react";
import { useNutritionData } from "@/hooks/useNutritionData";
import { NutritionDonutChart } from "@/components/NutritionDonutChart";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export const Dashboard = ({ onTabChange }: DashboardProps) => {
  const { todayNutrition, recentActivities, loading, nutritionTargets } = useNutritionData();

  if (loading) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to crush your fitness goals?</p>
      </div>

      {/* Nutrition Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <NutritionDonutChart
              label="Calories"
              current={todayNutrition.calories}
              target={nutritionTargets.calories}
              color="hsl(var(--fitness-blue))"
              unit=" cal"
            />
            <NutritionDonutChart
              label="Protein"
              current={todayNutrition.protein}
              target={nutritionTargets.protein}
              color="hsl(120, 70%, 50%)"
              unit="g"
            />
            <NutritionDonutChart
              label="Carbs"
              current={todayNutrition.carbs}
              target={nutritionTargets.carbs}
              color="hsl(45, 90%, 55%)"
              unit="g"
            />
            <NutritionDonutChart
              label="Fat"
              current={todayNutrition.fats}
              target={nutritionTargets.fats}
              color="hsl(15, 80%, 60%)"
              unit="g"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activities</p>
              <p className="text-xs text-muted-foreground">Start logging meals or workouts!</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const Icon = activity.icon === 'Apple' ? Apple : Dumbbell;
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onTabChange('workout')}
        >
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Start Workout</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onTabChange('nutrition')}
        >
          <CardContent className="p-4 text-center">
            <Apple className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Log Meal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};