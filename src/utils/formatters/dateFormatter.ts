// Date Formatting Utilities for South African Portal

/**
 * Format a date in South African format (DD/MM/YYYY)
 */
export const formatDateSA = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format a date in ISO format (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Format a date with time in South African format
 */
export const formatDateTimeSA = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const dateStr = formatDateSA(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Format a date in a human-readable format
 */
export const formatDateHuman = (date: Date | string, locale: string = 'en-ZA'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export const formatDateRelative = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Format a date range
 */
export const formatDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  separator: string = ' - '
): string => {
  const start = formatDateSA(startDate);
  const end = formatDateSA(endDate);
  
  return `${start}${separator}${end}`;
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: Date | string): number => {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Get financial year for South Africa (April - March)
 */
export const getFinancialYearSA = (date: Date | string = new Date()): {
  start: Date;
  end: Date;
  label: string;
} => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const currentYear = d.getFullYear();
  const currentMonth = d.getMonth();
  
  // SA financial year runs from 1 April to 31 March
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1; // April is month 3 (0-indexed)
  const endYear = startYear + 1;
  
  return {
    start: new Date(startYear, 3, 1), // April 1st
    end: new Date(endYear, 2, 31), // March 31st
    label: `${startYear}/${endYear}`,
  };
};

/**
 * Parse a South African date string (DD/MM/YYYY)
 */
export const parseDateSA = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month, day);
  
  // Validate the date
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  
  return date;
};

/**
 * Get the start and end of a month
 */
export const getMonthBounds = (date: Date | string = new Date()): {
  start: Date;
  end: Date;
} => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  
  return { start, end };
};

/**
 * Format date for bill due dates with urgency indicator
 */
export const formatBillDueDate = (dueDate: Date | string): {
  formatted: string;
  urgency: 'overdue' | 'urgent' | 'upcoming' | 'future';
  daysRemaining: number;
} => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future';
  if (daysRemaining < 0) urgency = 'overdue';
  else if (daysRemaining <= 3) urgency = 'urgent';
  else if (daysRemaining <= 7) urgency = 'upcoming';
  else urgency = 'future';
  
  return {
    formatted: formatDateSA(due),
    urgency,
    daysRemaining: Math.abs(daysRemaining),
  };
};
