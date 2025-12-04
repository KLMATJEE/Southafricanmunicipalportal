import React, { useState } from 'react';
import { CalculatorHub } from '@/pages/CalculatorHub';
import UIFBenefitsCalculator from '@/components/calculators/UIFBenefitsCalculator';
import ImportDutyCalculator from '@/components/calculators/ImportDutyCalculator';
import TaxiFareCalculator from '@/components/calculators/TaxiFareCalculator';
import APSCalculator from '@/components/calculators/APSCalculator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type CalculatorType = 'hub' | 'uif' | 'import-duty' | 'taxi-fare' | 'aps';

export const CalculatorView: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('hub');

  const handleNavigate = (path: string) => {
    // Extract calculator type from path
    const calculatorType = path.split('/').pop() as CalculatorType;
    setActiveCalculator(calculatorType || 'hub');
  };

  const handleBack = () => {
    setActiveCalculator('hub');
  };

  // Render the appropriate calculator
  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'uif':
        return (
          <>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator Hub
            </Button>
            <UIFBenefitsCalculator />
          </>
        );
      case 'import-duty':
        return (
          <>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator Hub
            </Button>
            <ImportDutyCalculator />
          </>
        );
      case 'taxi-fare':
        return (
          <>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator Hub
            </Button>
            <TaxiFareCalculator />
          </>
        );
      case 'aps':
        return (
          <>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator Hub
            </Button>
            <APSCalculator />
          </>
        );
      case 'hub':
      default:
        // Create a modified CalculatorHub that uses our navigation handler
        return <ModifiedCalculatorHub onNavigate={handleNavigate} />;
    }
  };

  return <div className="min-h-screen">{renderCalculator()}</div>;
};

// Modified Calculator Hub that works with internal navigation
const ModifiedCalculatorHub: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const calculators = [
    {
      id: 'uif',
      title: 'UIF Benefits',
      description: 'Calculate your Unemployment Insurance Fund benefits and eligibility',
      icon: '💼',
      path: '/calculators/uif',
      category: 'government',
      color: 'bg-green-50 border-green-200 hover:border-green-400',
      available: true,
    },
    {
      id: 'import-duty',
      title: 'Import Duty & VAT',
      description: 'Calculate import duties, VAT, and total costs for imported goods',
      icon: '📦',
      path: '/calculators/import-duty',
      category: 'finance',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      available: true,
    },
    {
      id: 'taxi-fare',
      title: 'Taxi Fare & Fuel Split',
      description: 'Calculate taxi fares and split costs among passengers',
      icon: '🚗',
      path: '/calculators/taxi-fare',
      category: 'transport',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      available: true,
    },
    {
      id: 'aps',
      title: 'APS Score',
      description: 'Calculate your Admission Point Score for university applications',
      icon: '🎓',
      path: '/calculators/aps',
      category: 'education',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-gray-900">South African Calculators</h1>
          <p className="text-gray-600">
            Access various calculators for government services, financial planning, education, and
            more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {calculators.map((calculator) => (
            <div
              key={calculator.id}
              onClick={() => calculator.available && onNavigate(calculator.path)}
              className={`${calculator.color} border-2 transition-all cursor-pointer p-6 rounded-lg hover:shadow-lg ${
                !calculator.available ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-4xl mb-4">{calculator.icon}</div>
              <h3 className="text-gray-900 mb-2">{calculator.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{calculator.description}</p>
              {calculator.available ? (
                <div className="text-sm text-green-600">Calculate Now →</div>
              ) : (
                <div className="text-sm text-gray-400">Coming Soon</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-900 mb-4">About These Calculators</h3>
          <p className="text-gray-700 mb-4">
            These calculators are designed to help South African citizens estimate various costs,
            benefits, and requirements. All calculations are based on current regulations and rates
            as of 2024.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div className="space-y-2">
              <h4 className="text-gray-900">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>All estimates are for informational purposes only</li>
                <li>Verify calculations with official government sources</li>
                <li>Rates and regulations may change</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-gray-900">Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time calculations with detailed breakdowns</li>
                <li>Save and share your calculation results</li>
                <li>Mobile-friendly and accessible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
