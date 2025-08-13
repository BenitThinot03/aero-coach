import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NutritionDonutChartProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export const NutritionDonutChart = ({ 
  label, 
  current, 
  target, 
  color,
  unit = 'g'
}: NutritionDonutChartProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  const data = [
    { name: 'current', value: current },
    { name: 'remaining', value: remaining }
  ];

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-20 h-20 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <h3 className="font-medium text-sm text-foreground">{label}</h3>
      <p className="text-xs text-muted-foreground">
        {Math.round(current)}{unit} / {target}{unit}
      </p>
    </div>
  );
};