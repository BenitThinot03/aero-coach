import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Timer, Flame } from "lucide-react";

export const WorkoutPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const workoutSessions = [
    {
      id: 1,
      name: "Upper Body Strength",
      date: "Today",
      duration: 45,
      calories: 320,
      exercises: ["Push-ups", "Pull-ups", "Bench Press"]
    },
    {
      id: 2,
      name: "Cardio Session",
      date: "Yesterday",
      duration: 30,
      calories: 280,
      exercises: ["Running", "Burpees", "Jump Rope"]
    },
    {
      id: 3,
      name: "Leg Day",
      date: "2 days ago",
      duration: 50,
      calories: 350,
      exercises: ["Squats", "Deadlifts", "Lunges"]
    }
  ];

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Workout
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-fitness-blue to-fitness-blue-dark text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <p className="text-sm opacity-90 mb-4">Start a workout with preset exercises</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" className="text-fitness-blue">
              Upper Body
            </Button>
            <Button variant="secondary" size="sm" className="text-fitness-blue">
              Lower Body
            </Button>
            <Button variant="secondary" size="sm" className="text-fitness-blue">
              Cardio
            </Button>
            <Button variant="secondary" size="sm" className="text-fitness-blue">
              Full Body
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Workouts</h2>
        
        {workoutSessions.map((workout) => (
          <Card key={workout.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{workout.name}</h3>
                <span className="text-sm text-muted-foreground">{workout.date}</span>
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 mr-1" />
                  {workout.duration} min
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 mr-1" />
                  {workout.calories} cal
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {workout.exercises.map((exercise, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {exercise}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};