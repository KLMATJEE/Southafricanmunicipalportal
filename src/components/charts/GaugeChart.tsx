import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GaugeChartProps {
  value: number;
  max: number;
  min?: number;
  title?: string;
  description?: string;
  label?: string;
  unit?: string;
  showValue?: boolean;
  color?: string;
  size?: number;
  thickness?: number;
  ranges?: Array<{
    min: number;
    max: number;
    color: string;
    label?: string;
  }>;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max,
  min = 0,
  title,
  description,
  label,
  unit = '',
  showValue = true,
  color,
  size = 200,
  thickness = 20,
  ranges,
}) => {
  // Calculate percentage
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Determine color based on ranges or use default
  const getColor = () => {
    if (color) return color;
    
    if (ranges) {
      const range = ranges.find((r) => value >= r.min && value <= r.max);
      return range?.color || '#10b981';
    }

    // Default color gradient based on percentage
    if (clampedPercentage < 33) return '#ef4444'; // red
    if (clampedPercentage < 66) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  const activeColor = getColor();

  // SVG gauge parameters
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = `${(clampedPercentage / 100) * circumference} ${circumference}`;

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        {/* Background arc */}
        <svg
          width={size}
          height={size / 2 + 40}
          viewBox={`0 0 ${size} ${size / 2 + 40}`}
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
            fill="none"
            stroke={activeColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: 'center',
            }}
          />

          {/* Center indicator dot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={6}
            fill={activeColor}
          />
        </svg>

        {/* Value display */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className="text-4xl text-gray-900">
              {value.toLocaleString()}
              {unit && <span className="text-2xl text-gray-500 ml-1">{unit}</span>}
            </div>
            {label && (
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            )}
          </div>
        )}
      </div>

      {/* Range indicators */}
      {ranges && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {ranges.map((range, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: range.color }}
              />
              <span className="text-xs text-gray-600">
                {range.label || `${range.min}-${range.max}${unit}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Min/Max labels */}
      <div className="flex justify-between w-full px-4 mt-2 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
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

export default GaugeChart;
