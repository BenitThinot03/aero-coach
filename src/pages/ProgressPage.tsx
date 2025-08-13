import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProgressData, ProgressMetric } from "@/hooks/useProgressData";

export const ProgressPage = () => {
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>('calories');
  const { data, loading, monthlyAverage } = useProgressData(selectedMetric);

  const metricOptions = [
    { value: 'calories', label: 'Daily Calories' },
    { value: 'protein', label: 'Daily Protein (g)' },
    { value: 'carbs', label: 'Daily Carbs (g)' },
    { value: 'fat', label: 'Daily Fat (g)' },
    { value: 'weight', label: 'Weight (kg)' }
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

      {/* Monthly Averages for Nutrition Metrics */}
      {selectedMetric !== 'weight' && monthlyAverage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{monthlyAverage.currentMonth} {getMetricUnit(selectedMetric)}</p>
                <p className="text-sm text-muted-foreground">Current Month Average</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{monthlyAverage.previousMonth} {getMetricUnit(selectedMetric)}</p>
                <p className="text-sm text-muted-foreground">Previous Month Average</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthlyAverage.difference > 0 ? '+' : ''}{monthlyAverage.difference} {getMetricUnit(selectedMetric)} from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                    formatter={(value) => [`${value} ${getMetricUnit(selectedMetric)}`, metricOptions.find(opt => opt.value === selectedMetric)?.label]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};