import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CreateWorkoutDialogProps {
  onWorkoutCreated: () => void;
}

export const CreateWorkoutDialog = ({ onWorkoutCreated }: CreateWorkoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("WorkoutSession")
        .insert({
          id: crypto.randomUUID(),
          userid: user.id,
          date: new Date().toISOString(),
          duration: duration ? parseInt(duration) : null,
          caloriesburned: caloriesBurned ? parseInt(caloriesBurned) : null,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Workout Created!",
        description: "Your workout session has been created successfully.",
      });

      setOpen(false);
      setDuration("");
      setCaloriesBurned("");
      setNotes("");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateWorkout} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};