// RSA ID Validator with Luhn Algorithm

import { RSAIDValidationResult } from '@/types/calculator.types';

export const validateRSAID = (idNumber: string): RSAIDValidationResult => {
  // Remove any spaces or non-numeric characters
  const cleanId = idNumber.replace(/\D/g, '');

  // Check length
  if (cleanId.length !== 13) {
    return {
      valid: false,
      error: 'RSA ID must be 13 digits',
    };
  }

  // Extract date of birth (YYMMDD)
  const year = parseInt(cleanId.substring(0, 2));
  const month = parseInt(cleanId.substring(2, 4));
  const day = parseInt(cleanId.substring(4, 6));

  // Determine century
  const currentYear = new Date().getFullYear() % 100;
  const century = year <= currentYear ? 2000 : 1900;
  const fullYear = century + year;

  // Validate date
  const dateOfBirth = new Date(fullYear, month - 1, day);
  if (
    dateOfBirth.getFullYear() !== fullYear ||
    dateOfBirth.getMonth() !== month - 1 ||
    dateOfBirth.getDate() !== day
  ) {
    return {
      valid: false,
      error: 'Invalid date of birth in ID number',
    };
  }

  // Extract gender (positions 7-10)
  const genderDigit = parseInt(cleanId.substring(6, 10));
  const gender = genderDigit < 5000 ? 'Female' : 'Male';

  // Extract citizenship (position 11)
  const citizenshipDigit = cleanId[10];
  const citizenshipStatus =
    citizenshipDigit === '0' ? 'SA Citizen' : 'Permanent Resident';

  // Luhn algorithm check (position 13)
  if (!luhnCheck(cleanId)) {
    return {
      valid: false,
      error: 'Invalid ID checksum',
    };
  }

  return {
    valid: true,
    dateOfBirth,
    gender,
    citizenshipStatus,
    sequenceNumber: genderDigit,
  };
};

function luhnCheck(idNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  // Loop through digits from right to left
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export const extractIDInfo = (idNumber: string) => {
  const validation = validateRSAID(idNumber);
  if (!validation.valid) {
    return null;
  }

  return {
    dateOfBirth: validation.dateOfBirth,
    gender: validation.gender,
    citizenship: validation.citizenshipStatus,
    age: validation.dateOfBirth
      ? Math.floor(
          (new Date().getTime() - validation.dateOfBirth.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null,
  };
};
