import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CreateExerciseDialog } from "./CreateExerciseDialog";

interface Exercise {
  id: string;
  name: string;
  type: string;
  category: string;
  userid: string | null;
  notes: string | null;
}

interface WorkoutEntry {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}

interface CreateWorkoutDialogProps {
  onWorkoutCreated: () => void;
}

export const CreateWorkoutDialog = ({ onWorkoutCreated }: CreateWorkoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutEntry[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("Exercise")
        .select("*")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (selectedExercises.some(e => e.exerciseId === exercise.id)) return;
    
    setSelectedExercises([...selectedExercises, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 1,
      reps: 1,
      weight: 0,
      notes: ""
    }]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.exerciseId !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId: string, field: string, value: any) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.exerciseId === exerciseId ? { ...e, [field]: value } : e
    ));
  };

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedExercises.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create workout session
      const workoutSessionId = crypto.randomUUID();
      const { error: sessionError } = await supabase
        .from("WorkoutSession")
        .insert({
          id: workoutSessionId,
          userid: user.id,
          date: new Date().toISOString(),
          duration: duration ? parseInt(duration) : null,
          caloriesburned: caloriesBurned ? parseInt(caloriesBurned) : null,
          notes: notes || null,
        });

      if (sessionError) throw sessionError;

      // Create workout entries
      const workoutEntries = selectedExercises.map(exercise => ({
        id: crypto.randomUUID(),
        workoutsessionid: workoutSessionId,
        exerciseid: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        notes: exercise.notes || null,
      }));

      const { error: entriesError } = await supabase
        .from("WorkoutEntry")
        .insert(workoutEntries);

      if (entriesError) throw entriesError;

      toast({
        title: "Workout Created!",
        description: `Your workout with ${selectedExercises.length} exercises has been created successfully.`,
      });

      // Reset form
      setOpen(false);
      setDuration("");
      setCaloriesBurned("");
      setNotes("");
      setSelectedExercises([]);
      onWorkoutCreated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateWorkout} className="space-y-6">
          {/* Exercise Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Exercises</Label>
              <CreateExerciseDialog onExerciseCreated={fetchExercises} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {exercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 justify-start"
                  onClick={() => handleAddExercise(exercise)}
                  disabled={selectedExercises.some(e => e.exerciseId === exercise.id)}
                >
                  <div className="text-left w-full">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="font-medium text-xs">{exercise.name}</div>
                      {exercise.userid && (
                        <User className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {exercise.category}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Exercises */}
          {selectedExercises.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Your Exercises</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedExercises.map((exercise) => (
                  <Card key={exercise.exerciseId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(exercise.exerciseId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleUpdateExercise(exercise.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => handleUpdateExercise(exercise.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Weight (kg)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight}
                            onChange={(e) => handleUpdateExercise(exercise.exerciseId, 'weight', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Notes</Label>
                          <Input
                            placeholder="Optional"
                            value={exercise.notes}
                            onChange={(e) => handleUpdateExercise(exercise.exerciseId, 'notes', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Workout Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g., 320"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Workout Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedExercises.length === 0}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};