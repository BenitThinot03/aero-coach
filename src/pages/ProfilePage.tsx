import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, LogOut, Trash2, Edit, Scale, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { WeightMeasurementDialog } from "@/components/WeightMeasurementDialog";

export const ProfilePage = () => {
  const { signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    fitness_goal: "",
    units_preference: "",
    target_calories: "",
    target_protein: "",
    target_fats: "",
    target_sugar: ""
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        fitness_goal: profile.fitness_goal || "",
        units_preference: profile.units_preference || "metric",
        target_calories: profile.target_calories?.toString() || "",
        target_protein: profile.target_protein?.toString() || "",
        target_fats: profile.target_fats?.toString() || "",
        target_sugar: profile.target_sugar?.toString() || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const updates: any = {};
    
    if (editForm.name) updates.name = editForm.name;
    if (editForm.age) updates.age = parseInt(editForm.age);
    if (editForm.height) updates.height = parseFloat(editForm.height);
    if (editForm.weight) updates.weight = parseFloat(editForm.weight);
    if (editForm.fitness_goal) updates.fitness_goal = editForm.fitness_goal;
    if (editForm.units_preference) updates.units_preference = editForm.units_preference;
    if (editForm.target_calories) updates.target_calories = parseFloat(editForm.target_calories);
    if (editForm.target_protein) updates.target_protein = parseFloat(editForm.target_protein);
    if (editForm.target_fats) updates.target_fats = parseFloat(editForm.target_fats);
    if (editForm.target_sugar) updates.target_sugar = parseFloat(editForm.target_sugar);

    await updateProfile(updates);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <Badge className="mt-2 bg-primary text-primary-foreground">
                {profile?.fitness_goal || 'Not Set'}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={isEditing ? editForm.name : profile?.name || ""} 
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={isEditing ? editForm.age : profile?.age?.toString() || ""} 
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height" 
                  type="number"
                  step="0.1"
                  value={isEditing ? editForm.height : profile?.height?.toString() || ""} 
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input 
                  id="weight" 
                  type="number"
                  step="0.1"
                  value={isEditing ? editForm.weight : profile?.weight?.toString() || ""} 
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fitness_goal">Fitness Goal</Label>
                {isEditing ? (
                  <Select 
                    value={editForm.fitness_goal} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, fitness_goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Athletic Performance">Athletic Performance</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={profile?.fitness_goal || ""} 
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="units">Units</Label>
                {isEditing ? (
                  <Select 
                    value={editForm.units_preference} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, units_preference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric</SelectItem>
                      <SelectItem value="imperial">Imperial</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={profile?.units_preference || ""} 
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Nutrition Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_calories">Target Calories</Label>
              <Input 
                id="target_calories" 
                type="number"
                value={isEditing ? editForm.target_calories : profile?.target_calories?.toString() || ""} 
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                placeholder="e.g., 2200"
                onChange={(e) => setEditForm(prev => ({ ...prev, target_calories: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="target_protein">Target Protein (g)</Label>
              <Input 
                id="target_protein" 
                type="number"
                value={isEditing ? editForm.target_protein : profile?.target_protein?.toString() || ""} 
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                placeholder="e.g., 150"
                onChange={(e) => setEditForm(prev => ({ ...prev, target_protein: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_fats">Target Fats (g)</Label>
              <Input 
                id="target_fats" 
                type="number"
                value={isEditing ? editForm.target_fats : profile?.target_fats?.toString() || ""} 
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                placeholder="e.g., 73"
                onChange={(e) => setEditForm(prev => ({ ...prev, target_fats: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="target_sugar">Target Sugar (g)</Label>
              <Input 
                id="target_sugar" 
                type="number"
                value={isEditing ? editForm.target_sugar : profile?.target_sugar?.toString() || ""} 
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                placeholder="e.g., 50"
                onChange={(e) => setEditForm(prev => ({ ...prev, target_sugar: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Weight Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Weight</p>
              <p className="text-2xl font-bold">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</p>
            </div>
            <WeightMeasurementDialog>
              <Button variant="outline">
                <Scale className="w-4 h-4 mr-2" />
                Add Measurement
              </Button>
            </WeightMeasurementDialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-fitness-gray rounded-lg">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </div>
            <div className="text-center p-4 bg-fitness-gray rounded-lg">
              <p className="text-2xl font-bold text-primary">18.5</p>
              <p className="text-sm text-muted-foreground">Hours Trained</p>
            </div>
            <div className="text-center p-4 bg-fitness-gray rounded-lg">
              <p className="text-2xl font-bold text-primary">6.8k</p>
              <p className="text-sm text-muted-foreground">Calories Burned</p>
            </div>
            <div className="text-center p-4 bg-fitness-gray rounded-lg">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Units</span>
            <Badge variant="secondary">{profile?.units_preference || 'metric'}</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Theme</span>
            <Badge variant="secondary">Light</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Language</span>
            <Badge variant="secondary">English</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
        
        <Button variant="destructive" className="w-full justify-start">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  );
};