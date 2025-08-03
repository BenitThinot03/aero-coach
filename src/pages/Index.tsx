import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Dashboard } from "./Dashboard";
import { WorkoutPage } from "./WorkoutPage";
import { NutritionPage } from "./NutritionPage";
import { ProgressPage } from "./ProgressPage";
import { ProfilePage } from "./ProfilePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "workout":
        return <WorkoutPage />;
      case "nutrition":
        return <NutritionPage />;
      case "progress":
        return <ProgressPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
