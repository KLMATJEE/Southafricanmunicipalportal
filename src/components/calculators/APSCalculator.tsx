import React, { useState } from 'react';
import { calculateAPS, SA_SUBJECTS, getSubjectByName } from '@/services/calculators/apsCalculator';
import { Subject } from '@/types/calculator.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Plus, Trash2, GraduationCap, Award } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const APSCalculator: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', finalMark: 0, isLanguage: false, isMath: false },
  ]);
  const [result, setResult] = useState<any>(null);

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', finalMark: 0, isLanguage: false, isMath: false }]);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleSubjectChange = (index: number, name: string) => {
    const subjectInfo = getSubjectByName(name);
    if (!subjectInfo) return;

    const newSubjects = [...subjects];
    newSubjects[index] = {
      ...newSubjects[index],
      name: subjectInfo.name,
      isLanguage: subjectInfo.isLanguage,
      isMath: subjectInfo.isMath,
    };
    setSubjects(newSubjects);
  };

  const handleMarkChange = (index: number, mark: number) => {
    const newSubjects = [...subjects];
    newSubjects[index].finalMark = Math.min(100, Math.max(0, mark));
    setSubjects(newSubjects);
  };

  const handleCalculate = () => {
    try {
      // Filter out subjects without names
      const validSubjects = subjects.filter((s) => s.name && s.finalMark > 0);

      if (validSubjects.length < 6) {
        alert('Please add at least 6 subjects with valid marks');
        return;
      }

      const calculationResult = calculateAPS(validSubjects);
      setResult(calculationResult);
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert(error.message || 'Error calculating APS. Please check your inputs.');
    }
  };

  const handleClear = () => {
    setSubjects([{ name: '', finalMark: 0, isLanguage: false, isMath: false }]);
    setResult(null);
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      '7': 'bg-green-100 text-green-800',
      '6': 'bg-blue-100 text-blue-800',
      '5': 'bg-cyan-100 text-cyan-800',
      '4': 'bg-yellow-100 text-yellow-800',
      '3': 'bg-orange-100 text-orange-800',
      '2': 'bg-red-100 text-red-800',
      '1': 'bg-red-200 text-red-900',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              APS Score Calculator
            </CardTitle>
            <CardDescription>
              Calculate your Admission Point Score for South African universities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subjects */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Your Subjects & Marks</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubject}
                  disabled={subjects.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-6 space-y-2">
                    <Label className="text-xs">Subject</Label>
                    <Select
                      value={subject.name}
                      onValueChange={(value) => handleSubjectChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SA_SUBJECTS.map((subj) => (
                          <SelectItem
                            key={subj.name}
                            value={subj.name}
                            disabled={subjects.some((s) => s.name === subj.name)}
                          >
                            {subj.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs">Mark (0-100)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={subject.finalMark || ''}
                      onChange={(e) =>
                        handleMarkChange(index, parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs">Points</Label>
                    <div className="h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md">
                      {subject.finalMark > 0 ? (
                        <span className="font-semibold">
                          {subject.finalMark >= 80
                            ? '7'
                            : subject.finalMark >= 70
                            ? '6'
                            : subject.finalMark >= 60
                            ? '5'
                            : subject.finalMark >= 50
                            ? '4'
                            : subject.finalMark >= 40
                            ? '3'
                            : subject.finalMark >= 30
                            ? '2'
                            : '1'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubject(index)}
                      disabled={subjects.length <= 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Alert>
              <AlertDescription>
                APS is calculated from your best 6 subjects. Most universities require a minimum
                APS plus specific subject requirements (e.g., Mathematics for engineering).
              </AlertDescription>
            </Alert>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear All
              </Button>
              <Button onClick={handleCalculate} className="flex-1">
                Calculate APS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 h-fit">
          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your APS Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl text-green-600 text-center py-4">
                {result.totalAPS}
              </div>
              <p className="text-center text-gray-600 text-sm">
                Out of maximum 42 points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.subjects.slice(0, 6).map((subject: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{subject.name}</span>
                    <div className="text-xs text-gray-500">{subject.mark}%</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getGradeColor(
                      subject.grade
                    )}`}
                  >
                    {subject.points} pts
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                University Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.qualifyingUniversities.map((uni: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-2 rounded ${
                    uni.qualifies ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{uni.name}</span>
                    <div className="text-xs text-gray-500">Min APS: {uni.minimumAPS}</div>
                  </div>
                  {uni.qualifies ? (
                    <span className="text-green-600 text-xl">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xl">○</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm space-y-2 text-gray-700">
                {result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default APSCalculator;
