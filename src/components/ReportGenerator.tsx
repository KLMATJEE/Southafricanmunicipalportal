import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  File,
  FileCode,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../utils/api';

// Format date helper
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export interface ReportConfig {
  type: 'audit' | 'compliance' | 'financial' | 'operational' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    department?: string[];
    status?: string[];
    category?: string[];
    user?: string[];
  };
  includeCharts: boolean;
  includeRawData: boolean;
  groupBy?: string;
  sortBy?: string;
}

interface ReportGeneratorProps {
  userRole: string;
}

export function ReportGenerator({ userRole }: ReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'audit',
    format: 'pdf',
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date()
    },
    filters: {},
    includeCharts: true,
    includeRawData: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  const reportTypes = [
    { value: 'audit', label: 'Audit Trail Report', icon: FileText },
    { value: 'compliance', label: 'Compliance Report', icon: CheckCircle },
    { value: 'financial', label: 'Financial Report', icon: TrendingUp },
    { value: 'operational', label: 'Operational Metrics', icon: BarChart3 },
    { value: 'custom', label: 'Custom Report', icon: Filter }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: File },
    { value: 'csv', label: 'CSV File', icon: File },
    { value: 'json', label: 'JSON Data', icon: FileCode }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const response = await api.post('/reports/generate', { config });
      
      // Simulate report generation
      const reportId = `report_${Date.now()}`;
      const newReport = {
        id: reportId,
        type: config.type,
        format: config.format,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        downloadUrl: response.downloadUrl || '#'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
      // Auto-download if enabled
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateFilter = (filterKey: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterKey]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Generator
          </CardTitle>
          <CardDescription>
            Create comprehensive reports with data visualizations and analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      config.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => updateConfig('type', type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(config.dateRange.from)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.from}
                    onSelect={(date) => date && updateConfig('dateRange', { ...config.dateRange, from: date })}
                  />
                </PopoverContent>
              </Popover>
              
              <span className="flex items-center">to</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(config.dateRange.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.to}
                    onSelect={(date) => date && updateConfig('dateRange', { ...config.dateRange, to: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formats.map(fmt => {
                const Icon = fmt.icon;
                return (
                  <Card
                    key={fmt.value}
                    className={`cursor-pointer transition-all ${
                      config.format === fmt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => updateConfig('format', fmt.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                        <span className="text-xs">{fmt.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Report Options */}
          <div className="space-y-3">
            <Label>Report Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={config.includeCharts}
                onCheckedChange={(checked) => updateConfig('includeCharts', checked)}
              />
              <label htmlFor="charts" className="text-sm cursor-pointer">
                Include data visualizations and charts
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rawdata"
                checked={config.includeRawData}
                onCheckedChange={(checked) => updateConfig('includeRawData', checked)}
              />
              <label htmlFor="rawdata" className="text-sm cursor-pointer">
                Include raw data tables
              </label>
            </div>
          </div>

          <Separator />

          {/* Generate Button */}
          <div className="space-y-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Reports include audit trails, compliance metrics, and are digitally signed for authenticity.
                All report generation is logged for regulatory compliance.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports History */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Reports</CardTitle>
            <CardDescription>Previously generated reports available for download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">
                        {report.type.replace('_', ' ').toUpperCase()} Report
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {report.format.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Generated: {new Date(report.generatedAt).toLocaleString('en-ZA')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
