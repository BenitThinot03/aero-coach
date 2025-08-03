import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";

export const ProgressPage = () => {
  const progressStats = [
    {
      label: "Weight",
      current: "72.5 kg",
      change: "-1.2 kg",
      trend: "down",
      period: "This month"
    },
    {
      label: "Body Fat",
      current: "15.3%",
      change: "-2.1%",
      trend: "down",
      period: "This month"
    },
    {
      label: "Workouts",
      current: "16",
      change: "+4",
      trend: "up",
      period: "This month"
    },
    {
      label: "Avg Calories",
      current: "285",
      change: "+25",
      trend: "up",
      period: "Per workout"
    }
  ];

  const recentMeasurements = [
    { date: "Today", weight: 72.5, bodyFat: 15.3, waist: 82, chest: 102 },
    { date: "1 week ago", weight: 73.1, bodyFat: 15.8, waist: 83, chest: 101 },
    { date: "2 weeks ago", weight: 73.8, bodyFat: 16.2, waist: 84, chest: 100 },
  ];

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress</h1>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-4">
        {progressStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-xl font-bold text-foreground">{stat.current}</p>
              <div className="flex items-center space-x-1 mt-1">
                <span 
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-fitness-gray rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="w-12 h-12 text-fitness-blue mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chart visualization</p>
              <p className="text-xs text-muted-foreground">Weight trend over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Target Weight</p>
              <p className="text-sm text-muted-foreground">70 kg</p>
            </div>
            <Badge variant="secondary">2.5 kg to go</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Weekly Workouts</p>
              <p className="text-sm text-muted-foreground">5 sessions</p>
            </div>
            <Badge className="bg-green-100 text-green-700">Achieved</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-fitness-gray rounded-lg">
            <div>
              <p className="font-medium">Body Fat</p>
              <p className="text-sm text-muted-foreground">12%</p>
            </div>
            <Badge variant="secondary">3.3% to go</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentMeasurements.map((measurement, index) => (
            <div key={index} className="p-3 bg-fitness-gray rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{measurement.date}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                <div>
                  <p className="font-medium">{measurement.weight} kg</p>
                  <p className="text-muted-foreground">Weight</p>
                </div>
                <div>
                  <p className="font-medium">{measurement.bodyFat}%</p>
                  <p className="text-muted-foreground">Body Fat</p>
                </div>
                <div>
                  <p className="font-medium">{measurement.waist} cm</p>
                  <p className="text-muted-foreground">Waist</p>
                </div>
                <div>
                  <p className="font-medium">{measurement.chest} cm</p>
                  <p className="text-muted-foreground">Chest</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};