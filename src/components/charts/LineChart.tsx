import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LineChartDataItem {
  name: string;
  [key: string]: any;
}

interface LineChartProps {
  data: LineChartDataItem[];
  title?: string;
  description?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  showArea?: boolean; // Show filled area under line
  height?: number;
  dataKeys: string[];
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  curved?: boolean;
  dots?: boolean;
}

const DEFAULT_COLORS = [
  '#10b981', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  description,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showArea = false,
  height = 300,
  dataKeys,
  colors,
  xAxisLabel,
  yAxisLabel,
  curved = true,
  dots = true,
}) => {
  const chartColors = colors || DEFAULT_COLORS;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name}: {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : RechartsLineChart;

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />

        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        
        {showLegend && dataKeys.length > 1 && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        )}

        {showArea ? (
          dataKeys.map((key, index) => (
            <Area
              key={key}
              type={curved ? 'monotone' : 'linear'}
              dataKey={key}
              stroke={chartColors[index % chartColors.length]}
              fill={chartColors[index % chartColors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={dots ? { r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))
        ) : (
          dataKeys.map((key, index) => (
            <Line
              key={key}
              type={curved ? 'monotone' : 'linear'}
              dataKey={key}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={2}
              dot={dots ? { r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))
        )}
      </ChartComponent>
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

export default LineChart;
