/**
 * Data Validation & Sanitization Utilities
 * Production-grade validation for security and compliance
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove any HTML/script tags
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return clean.trim();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate South African ID number
 */
export function validateSAIDNumber(idNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = idNumber.replace(/[\s-]/g, '');
  
  // Must be 13 digits
  if (!/^\d{13}$/.test(cleaned)) return false;
  
  // Validate date portion (YYMMDD)
  const year = parseInt(cleaned.substring(0, 2));
  const month = parseInt(cleaned.substring(2, 4));
  const day = parseInt(cleaned.substring(4, 6));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Luhn algorithm check (checksum)
  let sum = 0;
  let alt = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (alt) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    alt = !alt;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate South African phone number
 */
export function validateSAPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s()-]/g, '');
  
  // Accept formats: +27XXXXXXXXX, 0XXXXXXXXX, 27XXXXXXXXX
  const phoneRegex = /^(\+27|27|0)[0-9]{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${options.maxSizeMB}MB limit`
    };
  }
  
  // Check file type
  const fileType = file.type.toLowerCase();
  const isAllowed = options.allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.replace('/*', ''));
    }
    return fileType === type;
  });
  
  if (!isAllowed) {
    return {
      valid: false,
      error: `File type ${fileType} not allowed. Allowed: ${options.allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate workflow comment
 */
export function validateWorkflowComment(comment: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(comment);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Comment cannot be empty' };
  }
  
  if (sanitized.length < 10) {
    return { valid: false, error: 'Comment must be at least 10 characters' };
  }
  
  if (sanitized.length > 5000) {
    return { valid: false, error: 'Comment cannot exceed 5000 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate amount (currency)
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || !isFinite(amount)) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (amount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }
  
  if (amount > 1000000000) {
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }
  
  // Check for more than 2 decimal places
  if ((amount * 100) % 1 !== 0) {
    return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  
  return { valid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  from: Date,
  to: Date
): { valid: boolean; error?: string } {
  if (!(from instanceof Date) || isNaN(from.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }
  
  if (!(to instanceof Date) || isNaN(to.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }
  
  if (from > to) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  // Check if range exceeds 5 years
  const maxRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in ms
  if (to.getTime() - from.getTime() > maxRange) {
    return { valid: false, error: 'Date range cannot exceed 5 years' };
  }
  
  return { valid: true };
}

/**
 * Validate API key format
 */
export function validateAPIKey(key: string): { valid: boolean; error?: string } {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }
  
  if (key.length < 16) {
    return { valid: false, error: 'API key too short' };
  }
  
  if (key.length > 512) {
    return { valid: false, error: 'API key too long' };
  }
  
  // Check for suspicious patterns
  if (key.includes('<script>') || key.includes('javascript:')) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  return { valid: true };
}

/**
 * Validate coordinates (latitude, longitude)
 */
export function validateCoordinates(
  lat: number,
  lng: number
): { valid: boolean; error?: string } {
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Invalid coordinates' };
  }
  
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true };
}

/**
 * Sanitize object for logging (remove sensitive data)
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password',
    'apiKey',
    'api_key',
    'secret',
    'token',
    'accessToken',
    'access_token',
    'merchantKey',
    'merchant_key',
    'passphrase',
    'privateKey',
    'private_key',
    'secretKey',
    'secret_key',
    'idNumber',
    'id_number',
    'bankAccount',
    'bank_account',
    'creditCard',
    'credit_card'
  ];
  
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if request is within rate limit
   * @param key - Unique identifier (e.g., user ID, IP address)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }
  
  /**
   * Clean up old entries periodically
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Clean up every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}
