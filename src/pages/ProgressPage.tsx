import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProgressData, ProgressMetric } from "@/hooks/useProgressData";

export const ProgressPage = () => {
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>('weight');
  const { data, loading } = useProgressData(selectedMetric);

  const metricOptions = [
    { value: 'weight', label: 'Weight (kg)' },
    { value: 'calories', label: 'Daily Calories' },
    { value: 'protein', label: 'Daily Protein (g)' },
    { value: 'carbs', label: 'Daily Carbs (g)' },
    { value: 'fat', label: 'Daily Fat (g)' }
  ];

  const getMetricUnit = (metric: ProgressMetric) => {
    switch (metric) {
      case 'weight': return 'kg';
      case 'calories': return 'cal';
      default: return 'g';
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress</h1>
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as ProgressMetric)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metricOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {metricOptions.find(opt => opt.value === selectedMetric)?.label} Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 bg-fitness-gray rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="h-64 bg-fitness-gray rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No data available</p>
                <p className="text-xs text-muted-foreground">Start tracking to see your progress</p>
              </div>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => [`${value} ${getMetricUnit(selectedMetric)}`, selectedMetric]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--fitness-blue))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--fitness-blue))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--fitness-blue))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};