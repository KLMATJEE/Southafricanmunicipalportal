// APS Score Calculator Service

import { Subject, APSCalculationResult } from '@/types/calculator.types';

// Grade to APS points conversion table (South African system)
const GRADE_TO_APS: Array<{
  min: number;
  max: number;
  grade: string;
  points: number;
}> = [
  { min: 80, max: 100, grade: '7', points: 7 },
  { min: 70, max: 79, grade: '6', points: 6 },
  { min: 60, max: 69, grade: '5', points: 5 },
  { min: 50, max: 59, grade: '4', points: 4 },
  { min: 40, max: 49, grade: '3', points: 3 },
  { min: 30, max: 39, grade: '2', points: 2 },
  { min: 0, max: 29, grade: '1', points: 1 },
];

export const calculateAPS = (subjects: Subject[]): APSCalculationResult => {
  // Validate we have at least 6 subjects
  if (subjects.length < 6) {
    throw new Error('APS calculation requires at least 6 subjects');
  }

  // Calculate points for each subject
  const subjectResults = subjects.map((subject) => {
    const gradeInfo = GRADE_TO_APS.find(
      (g) => subject.finalMark >= g.min && subject.finalMark <= g.max
    );

    if (!gradeInfo) {
      throw new Error(`Invalid mark for subject ${subject.name}: ${subject.finalMark}`);
    }

    return {
      name: subject.name,
      mark: subject.finalMark,
      grade: gradeInfo.grade,
      points: gradeInfo.points,
    };
  });

  // APS is calculated from best 6 subjects (or 7 for some universities)
  const bestSix = [...subjectResults]
    .sort((a, b) => b.points - a.points)
    .slice(0, 6);

  const totalAPS = bestSix.reduce((sum, s) => sum + s.points, 0);

  // Calculate grade distribution
  const gradeDistribution = subjectResults.reduce((dist, s) => {
    dist[s.grade] = (dist[s.grade] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  // SA Universities minimum APS requirements (general - varies by program)
  const universities = [
    { name: 'University of Cape Town (UCT)', minimumAPS: 38, tier: 'top' },
    { name: 'Wits University', minimumAPS: 35, tier: 'top' },
    { name: 'Stellenbosch University', minimumAPS: 34, tier: 'top' },
    { name: 'University of Pretoria', minimumAPS: 32, tier: 'mid' },
    { name: 'Rhodes University', minimumAPS: 30, tier: 'mid' },
    { name: 'University of Johannesburg', minimumAPS: 28, tier: 'mid' },
    { name: 'University of KwaZulu-Natal', minimumAPS: 28, tier: 'mid' },
    { name: 'North-West University', minimumAPS: 26, tier: 'mid' },
    { name: 'University of the Free State', minimumAPS: 25, tier: 'mid' },
    { name: 'Nelson Mandela University', minimumAPS: 24, tier: 'accessible' },
    { name: 'University of the Western Cape', minimumAPS: 24, tier: 'accessible' },
    { name: 'Walter Sisulu University', minimumAPS: 22, tier: 'accessible' },
  ];

  const qualifyingUniversities = universities.map((uni) => ({
    ...uni,
    qualifies: totalAPS >= uni.minimumAPS,
  }));

  // Generate recommendations
  const recommendations: string[] = [];

  if (totalAPS >= 38) {
    recommendations.push(
      '🎓 Excellent! You qualify for top-tier universities and competitive programs'
    );
  } else if (totalAPS >= 32) {
    recommendations.push(
      '✓ Strong performance - you qualify for most university programs'
    );
  } else if (totalAPS >= 26) {
    recommendations.push(
      'You qualify for many university programs - check specific faculty requirements'
    );
  } else if (totalAPS >= 20) {
    recommendations.push(
      'Consider diploma programs or foundation years to strengthen your application'
    );
  } else {
    recommendations.push(
      'Explore TVET colleges, learnerships, or gap year programs to improve your results'
    );
  }

  // Check for critical subjects
  const hasLanguage = subjects.some(
    (s) => s.isLanguage && subjectResults.find((r) => r.name === s.name)!.points >= 4
  );
  const hasMath = subjects.some(
    (s) => s.isMath && subjectResults.find((r) => r.name === s.name)!.points >= 4
  );

  if (!hasLanguage) {
    recommendations.push(
      '⚠️ Note: Most universities require at least 50% (Level 4) in a language'
    );
  }

  if (hasMath) {
    recommendations.push('✓ Mathematics pass opens doors to STEM programs');
  }

  recommendations.push(
    'Remember: APS is just one criterion - check specific program requirements'
  );
  recommendations.push('Visit www.usaf.ac.za for detailed university requirements');

  return {
    totalAPS,
    subjects: subjectResults,
    gradeDistribution,
    qualifyingUniversities,
    recommendations,
  };
};

// Common South African school subjects
export const SA_SUBJECTS = [
  { name: 'English Home Language', isLanguage: true, isMath: false },
  { name: 'English First Additional Language', isLanguage: true, isMath: false },
  { name: 'Afrikaans Home Language', isLanguage: true, isMath: false },
  { name: 'Afrikaans First Additional Language', isLanguage: true, isMath: false },
  { name: 'isiZulu Home Language', isLanguage: true, isMath: false },
  { name: 'Mathematics', isLanguage: false, isMath: true },
  { name: 'Mathematical Literacy', isLanguage: false, isMath: false },
  { name: 'Physical Sciences', isLanguage: false, isMath: false },
  { name: 'Life Sciences', isLanguage: false, isMath: false },
  { name: 'Accounting', isLanguage: false, isMath: false },
  { name: 'Business Studies', isLanguage: false, isMath: false },
  { name: 'Economics', isLanguage: false, isMath: false },
  { name: 'Geography', isLanguage: false, isMath: false },
  { name: 'History', isLanguage: false, isMath: false },
  { name: 'Life Orientation', isLanguage: false, isMath: false },
  { name: 'Information Technology', isLanguage: false, isMath: false },
  { name: 'Agricultural Sciences', isLanguage: false, isMath: false },
  { name: 'Visual Arts', isLanguage: false, isMath: false },
  { name: 'Dramatic Arts', isLanguage: false, isMath: false },
  { name: 'Music', isLanguage: false, isMath: false },
];

export const getSubjectByName = (name: string): Subject | undefined => {
  const subject = SA_SUBJECTS.find((s) => s.name === name);
  if (!subject) return undefined;

  return {
    name: subject.name,
    finalMark: 0,
    isLanguage: subject.isLanguage,
    isMath: subject.isMath,
  };
};
