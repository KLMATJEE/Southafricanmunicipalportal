import React from 'react';
import { formatCurrency } from '@/utils/formatters/currencyFormatter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  primaryAmount: number;
  currency?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  breakdown?: Array<{
    label: string;
    value: number;
  }>;
}

interface ComparisonCardProps {
  title: string;
  description?: string;
  scenarios: Scenario[];
  highlightBest?: boolean;
  showDifference?: boolean;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  description,
  scenarios,
  highlightBest = true,
  showDifference = true,
}) => {
  if (scenarios.length === 0) {
    return null;
  }

  // Find the best (highest value) scenario
  const bestScenario = highlightBest
    ? scenarios.reduce((prev, current) =>
        current.primaryAmount > prev.primaryAmount ? current : prev
      )
    : null;

  // Calculate differences if there are exactly 2 scenarios
  const difference =
    showDifference && scenarios.length === 2
      ? scenarios[1].primaryAmount - scenarios[0].primaryAmount
      : null;

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario, index) => {
            const isBest = bestScenario?.id === scenario.id;

            return (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isBest
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Scenario Header */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-neutral-900">{scenario.name}</h4>
                  {scenario.badge && (
                    <Badge variant={scenario.badgeVariant || 'default'}>
                      {scenario.badge}
                    </Badge>
                  )}
                  {isBest && !scenario.badge && (
                    <Badge variant="default" className="bg-green-600">
                      Best
                    </Badge>
                  )}
                </div>

                {/* Primary Amount */}
                <div
                  className={`text-3xl mb-3 ${
                    isBest ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {formatCurrency(scenario.primaryAmount, scenario.currency || 'ZAR')}
                </div>

                {/* Breakdown */}
                {scenario.breakdown && scenario.breakdown.length > 0 && (
                  <div className="space-y-1 pt-3 border-t border-gray-200">
                    {scenario.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{item.label}</span>
                        <span className="text-gray-900">
                          {formatCurrency(item.value, scenario.currency || 'ZAR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show difference for second scenario */}
                {index === 1 && difference !== null && (
                  <div
                    className={`flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 ${getDifferenceColor(
                      difference
                    )}`}
                  >
                    {getDifferenceIcon(difference)}
                    <span className="text-sm">
                      {difference > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(difference), scenario.currency || 'ZAR')}
                      {' vs '}
                      {scenarios[0].name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Summary for 3+ scenarios */}
        {scenarios.length > 2 && difference !== null && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Range:</span>
              <span className="text-gray-900">
                {formatCurrency(
                  Math.min(...scenarios.map((s) => s.primaryAmount)),
                  scenarios[0].currency || 'ZAR'
                )}
                {' - '}
                {formatCurrency(
                  Math.max(...scenarios.map((s) => s.primaryAmount)),
                  scenarios[0].currency || 'ZAR'
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonCard;
