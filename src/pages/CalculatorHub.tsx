import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calculator,
  DollarSign,
  Car,
  GraduationCap,
  FileText,
  TrendingUp,
  Package,
  Wallet,
  Receipt,
} from 'lucide-react';

interface CalculatorCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: 'government' | 'finance' | 'education' | 'transport';
  color: string;
  available: boolean;
}

const calculators: CalculatorCard[] = [
  {
    id: 'uif',
    title: 'UIF Benefits',
    description: 'Calculate your Unemployment Insurance Fund benefits and eligibility',
    icon: <Wallet className="w-8 h-8" />,
    path: '/calculators/uif',
    category: 'government',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    available: true,
  },
  {
    id: 'import-duty',
    title: 'Import Duty & VAT',
    description: 'Calculate import duties, VAT, and total costs for imported goods',
    icon: <Package className="w-8 h-8" />,
    path: '/calculators/import-duty',
    category: 'finance',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    available: true,
  },
  {
    id: 'taxi-fare',
    title: 'Taxi Fare & Fuel Split',
    description: 'Calculate taxi fares and split costs among passengers',
    icon: <Car className="w-8 h-8" />,
    path: '/calculators/taxi-fare',
    category: 'transport',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    available: true,
  },
  {
    id: 'aps',
    title: 'APS Score',
    description: 'Calculate your Admission Point Score for university applications',
    icon: <GraduationCap className="w-8 h-8" />,
    path: '/calculators/aps',
    category: 'education',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    available: true,
  },
  {
    id: 'wage-rent',
    title: 'Wage & Rent Split',
    description: 'Calculate wage splits and rental cost sharing',
    icon: <DollarSign className="w-8 h-8" />,
    path: '/calculators/wage-rent',
    category: 'finance',
    color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
    available: false,
  },
  {
    id: 'tax',
    title: 'Tax Calculator',
    description: 'Estimate your PAYE and annual tax obligations',
    icon: <FileText className="w-8 h-8" />,
    path: '/calculators/tax',
    category: 'finance',
    color: 'bg-red-50 border-red-200 hover:border-red-400',
    available: false,
  },
  {
    id: 'bill-reminders',
    title: 'Bill Reminders',
    description: 'Track and manage your municipal bills and payments',
    icon: <Receipt className="w-8 h-8" />,
    path: '/bill-reminders',
    category: 'finance',
    color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
    available: false,
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    description: 'Monitor your monthly expenses and budget',
    icon: <TrendingUp className="w-8 h-8" />,
    path: '/expense-tracker',
    category: 'finance',
    color: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    available: false,
  },
];

const categories = [
  { id: 'all', label: 'All Calculators', icon: <Calculator className="w-4 h-4" /> },
  { id: 'government', label: 'Government Services', icon: <FileText className="w-4 h-4" /> },
  { id: 'finance', label: 'Finance & Money', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'transport', label: 'Transport', icon: <Car className="w-4 h-4" /> },
];

export const CalculatorHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredCalculators =
    selectedCategory === 'all'
      ? calculators
      : calculators.filter((calc) => calc.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-gray-900">South African Calculators</h1>
          <p className="text-gray-600">
            Access various calculators for government services, financial planning, education, and more
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-600'
              }`}
            >
              {category.icon}
              <span className="text-sm">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCalculators.map((calculator) => (
            <Card
              key={calculator.id}
              className={`${calculator.color} border-2 transition-all cursor-pointer relative overflow-hidden ${
                !calculator.available ? 'opacity-60' : ''
              }`}
            >
              {calculator.available ? (
                <Link to={calculator.path} className="block">
                  <CardHeader>
                    <div className="mb-3 text-gray-700">{calculator.icon}</div>
                    <CardTitle className="text-gray-900">{calculator.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <Calculator className="w-4 h-4" />
                      <span>Calculate Now</span>
                    </div>
                  </CardContent>
                </Link>
              ) : (
                <>
                  <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                    Coming Soon
                  </div>
                  <CardHeader>
                    <div className="mb-3 text-gray-400">{calculator.icon}</div>
                    <CardTitle className="text-gray-700">{calculator.title}</CardTitle>
                    <CardDescription className="text-gray-500">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-400">Available soon</div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>About These Calculators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              These calculators are designed to help South African citizens estimate various costs,
              benefits, and requirements. All calculations are based on current regulations and rates
              as of 2024.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalculatorHub;
