import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Save, X, Timer, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkoutEntry {
  id: string;
  exerciseid: string;
  reps: number;
  sets: number;
  weight: number;
  notes?: string;
  Exercise?: {
    name: string;
    category: string;
  };
}

interface WorkoutSession {
  id: string;
  date: string;
  duration?: number;
  caloriesburned?: number;
  notes?: string;
}

interface WorkoutSessionDetailsProps {
  session: WorkoutSession;
  onBack: () => void;
  onUpdate: () => void;
}

export const WorkoutSessionDetails = ({ session, onBack, onUpdate }: WorkoutSessionDetailsProps) => {
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkoutEntry>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkoutEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("WorkoutEntry")
        .select(`
          *,
          Exercise (
            name,
            category
          )
        `)
        .eq("workoutsessionid", session.id);

      if (error) throw error;
      setWorkoutEntries(data || []);
    } catch (error) {
      console.error("Error fetching workout entries:", error);
      toast({
        title: "Error",
        description: "Failed to load workout details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutEntries();
  }, [session.id]);

  const startEditing = (entry: WorkoutEntry) => {
    setEditingEntry(entry.id);
    setEditForm({
      reps: entry.reps,
      sets: entry.sets,
      weight: entry.weight,
      notes: entry.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditForm({});
  };

  const saveEntry = async () => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from("WorkoutEntry")
        .update({
          reps: editForm.reps,
          sets: editForm.sets,
          weight: editForm.weight,
          notes: editForm.notes,
        })
        .eq("id", editingEntry);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout entry updated successfully",
      });

      setEditingEntry(null);
      setEditForm({});
      fetchWorkoutEntries();
      onUpdate();
    } catch (error) {
      console.error("Error updating workout entry:", error);
      toast({
        title: "Error",
        description: "Failed to update workout entry",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Workout Details</h1>
        </div>
      </div>

      {/* Session Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Session Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date:</span>
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
            {session.duration && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 mr-1" />
                  Duration:
                </div>
                <span>{session.duration} minutes</span>
              </div>
            )}
            {session.caloriesburned && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 mr-1" />
                  Calories:
                </div>
                <span>{session.caloriesburned} cal</span>
              </div>
            )}
            {session.notes && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="text-sm">{session.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises ({workoutEntries.length})</h2>
        
        {workoutEntries.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No exercises found for this workout session.
            </CardContent>
          </Card>
        ) : (
          workoutEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{entry.Exercise?.name || "Unknown Exercise"}</h3>
                    {entry.Exercise?.category && (
                      <Badge variant="secondary" className="mt-1">
                        {entry.Exercise.category}
                      </Badge>
                    )}
                  </div>
                  {editingEntry !== entry.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(entry)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {editingEntry === entry.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Sets</label>
                        <Input
                          type="number"
                          value={editForm.sets || ""}
                          onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Reps</label>
                        <Input
                          type="number"
                          value={editForm.reps || ""}
                          onChange={(e) => setEditForm({ ...editForm, reps: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Weight (lbs)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editForm.weight || ""}
                          onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Notes</label>
                      <Textarea
                        value={editForm.notes || ""}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Optional notes..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={saveEntry}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sets:</span>
                        <span className="ml-2 font-medium">{entry.sets}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reps:</span>
                        <span className="ml-2 font-medium">{entry.reps}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-2 font-medium">{entry.weight} lbs</span>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};