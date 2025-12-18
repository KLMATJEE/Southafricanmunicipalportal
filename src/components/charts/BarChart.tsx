import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartDataItem {
  name: string;
  value: number;
  color?: string;
  [key: string]: any; // Allow additional properties for multi-series
}

interface BarChartProps {
  data: BarChartDataItem[];
  title?: string;
  description?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  height?: number;
  dataKeys?: string[]; // For multi-series bar charts
  colors?: string[];
  layout?: 'horizontal' | 'vertical';
  xAxisLabel?: string;
  yAxisLabel?: string;
  stacked?: boolean;
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  height = 300,
  dataKeys = ['value'],
  colors,
  layout = 'horizontal',
  xAxisLabel,
  yAxisLabel,
  stacked = false,
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

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        )}

        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && dataKeys.length > 1 && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        )}

        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartColors[index % chartColors.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={[8, 8, 0, 0]}
          >
            {/* Apply individual colors if specified in data */}
            {key === 'value' &&
              data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color || chartColors[index % chartColors.length]}
                />
              ))}
          </Bar>
        ))}
      </RechartsBarChart>
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

export default BarChart;
