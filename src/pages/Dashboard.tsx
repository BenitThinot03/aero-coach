import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame, Target, TrendingUp, Dumbbell, Apple } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to crush your fitness goals?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-fitness-blue to-fitness-blue-dark text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">This Week</p>
                <p className="text-xl font-bold">4 Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Calories</p>
                <p className="text-xl font-bold text-foreground">285</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-xl font-bold text-foreground">72.5 kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-xl font-bold text-foreground">12 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Upper Body Strength</p>
              <p className="text-sm text-muted-foreground">45 min • 320 cal</p>
            </div>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Cardio Session</p>
              <p className="text-sm text-muted-foreground">30 min • 280 cal</p>
            </div>
            <span className="text-xs text-muted-foreground">Yesterday</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Leg Day</p>
              <p className="text-sm text-muted-foreground">50 min • 350 cal</p>
            </div>
            <span className="text-xs text-muted-foreground">2 days ago</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Start Workout</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <Apple className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Log Meal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};