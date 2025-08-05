import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Timer, Flame } from "lucide-react";
import { CreateWorkoutDialog } from "@/components/CreateWorkoutDialog";
import { WorkoutSessionDetails } from "@/components/WorkoutSessionDetails";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const WorkoutPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { user } = useAuth();

  const fetchWorkouts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("WorkoutSession")
        .select("*")
        .eq("userid", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setWorkoutSessions(data || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const filteredSessions = workoutSessions.filter(session =>
    searchTerm === "" || 
    session.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(session.date).toLocaleDateString().includes(searchTerm)
  );

  if (selectedSession) {
    return (
      <WorkoutSessionDetails
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        onUpdate={fetchWorkouts}
      />
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <CreateWorkoutDialog onWorkoutCreated={fetchWorkouts} />
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
        
        {workoutSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No workouts yet. Create your first workout to get started!
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((workout) => (
            <Card 
              key={workout.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedSession(workout)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Workout Session</h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  {workout.duration && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Timer className="w-4 h-4 mr-1" />
                      {workout.duration} min
                    </div>
                  )}
                  {workout.caloriesburned && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Flame className="w-4 h-4 mr-1" />
                      {workout.caloriesburned} cal
                    </div>
                  )}
                </div>
                
                {workout.notes && (
                  <p className="text-sm text-muted-foreground">{workout.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};