import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FitnessChatbot } from "@/components/FitnessChatbot";
import { Dashboard } from "./Dashboard";
import { WorkoutPage } from "./WorkoutPage";
import { NutritionPage } from "./NutritionPage";
import { ProgressPage } from "./ProgressPage";
import { ProfilePage } from "./ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fitness-blue" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onTabChange={setActiveTab} />;
      case "workout":
        return <WorkoutPage />;
      case "nutrition":
        return <NutritionPage />;
      case "progress":
        return <ProgressPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <FitnessChatbot />
    </div>
  );
};

export default Index;
