import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  title?: string;
  description?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  customColors?: string[];
}

const DEFAULT_COLORS = [
  '#10b981', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  showLegend = true,
  showTooltip = true,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  customColors,
}) => {
  const colors = customColors || DEFAULT_COLORS;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = (
        (data.value / data.payload.payload.total) *
        100
      ).toFixed(1);

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map((item) => ({ ...item, total }));

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {dataWithTotal.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  if (title || description) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className="w-full">{content}</div>;
};

export default PieChart;
