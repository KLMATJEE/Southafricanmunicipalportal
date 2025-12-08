/**
 * Server-side Middleware for Security, Validation, and Compliance
 * Production-grade middleware for Supabase Edge Functions
 */

import { Context } from 'npm:hono'

/**
 * Rate limiting middleware
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: () => Promise<void>) => {
    const identifier = c.req.header('Authorization') || c.req.header('X-Forwarded-For') || 'anonymous';
    const now = Date.now();
    
    const record = rateLimitStore.get(identifier);
    
    if (record) {
      if (now < record.resetAt) {
        if (record.count >= maxRequests) {
          return c.json({
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((record.resetAt - now) / 1000)
          }, 429);
        }
        record.count++;
      } else {
        rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
      }
    } else {
      rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    }
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance per request
      const entries = Array.from(rateLimitStore.entries());
      entries.forEach(([key, value]) => {
        if (now > value.resetAt + windowMs) {
          rateLimitStore.delete(key);
        }
      });
    }
    
    await next();
  };
}

/**
 * Input validation middleware
 */
export function validateInput(schema: {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
}) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json();
      const errors: string[] = [];
      
      // Check required fields
      Object.entries(schema).forEach(([key, rules]) => {
        const value = body[key];
        
        // Check if required
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`Field '${key}' is required`);
          return;
        }
        
        // Skip validation if value is not provided and not required
        if (value === undefined || value === null) {
          return;
        }
        
        // Type validation
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`Field '${key}' must be of type ${rules.type}`);
          return;
        }
        
        // String validation
        if (rules.type === 'string' && typeof value === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Field '${key}' must be at least ${rules.minLength} characters`);
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Field '${key}' cannot exceed ${rules.maxLength} characters`);
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`Field '${key}' has invalid format`);
          }
        }
        
        // Number validation
        if (rules.type === 'number' && typeof value === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            errors.push(`Field '${key}' must be at least ${rules.min}`);
          }
          if (rules.max !== undefined && value > rules.max) {
            errors.push(`Field '${key}' cannot exceed ${rules.max}`);
          }
        }
        
        // Custom validation
        if (rules.custom && !rules.custom(value)) {
          errors.push(`Field '${key}' failed custom validation`);
        }
      });
      
      if (errors.length > 0) {
        return c.json({ error: 'Validation failed', details: errors }, 400);
      }
      
      await next();
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 10000); // Max length
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles: string[]) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    
    const userRole = user.user_metadata?.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`Access denied: User ${user.id} with role ${userRole} attempted to access ${c.req.path}`);
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    await next();
  };
}

/**
 * Audit logging middleware
 */
export function auditLog(action: string) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user');
    const startTime = Date.now();
    
    try {
      await next();
      
      const duration = Date.now() - startTime;
      
      // Log successful action
      console.log(JSON.stringify({
        type: 'audit',
        action,
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        path: c.req.path,
        method: c.req.method,
        success: true,
        duration,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed action
      console.error(JSON.stringify({
        type: 'audit',
        action,
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        path: c.req.path,
        method: c.req.method,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString()
      }));
      
      throw error;
    }
  };
}

/**
 * Error handling middleware
 */
export function errorHandler() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error('Error handling request:', error);
      
      // Don't expose internal errors to client
      return c.json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred processing your request'
      }, 500);
    }
  };
}

/**
 * Validate SA ID number server-side
 */
export function validateSAIDNumber(idNumber: string): boolean {
  const cleaned = idNumber.replace(/[\s-]/g, '');
  
  if (!/^\d{13}$/.test(cleaned)) return false;
  
  const year = parseInt(cleaned.substring(0, 2));
  const month = parseInt(cleaned.substring(2, 4));
  const day = parseInt(cleaned.substring(4, 6));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
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
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate amount (currency)
 */
export function validateAmount(amount: number): boolean {
  if (isNaN(amount) || !isFinite(amount)) return false;
  if (amount < 0) return false;
  if (amount > 1000000000) return false;
  if ((amount * 100) % 1 !== 0) return false; // More than 2 decimal places
  return true;
}

/**
 * CORS helper with proper security headers
 */
export function securityHeaders() {
  return async (c: Context, next: () => Promise<void>) => {
    await next();
    
    // Add security headers to response
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('Content-Security-Policy', "default-src 'self'");
  };
}

/**
 * Request timeout middleware
 */
export function requestTimeout(timeoutMs: number = 30000) {
  return async (c: Context, next: () => Promise<void>) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });
    
    try {
      await Promise.race([next(), timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        return c.json({ error: 'Request timeout' }, 408);
      }
      throw error;
    }
  };
}

/**
 * Sanitize data for logging (remove sensitive fields)
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
 * Enhanced audit log creation with full context
 */
export async function createEnhancedAuditLog(
  kv: any,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes: any,
  context?: {
    userEmail?: string;
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
  }
) {
  const timestamp = new Date().toISOString();
  const logId = `audit_${timestamp.replace(/[:.]/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;
  
  const auditLog = {
    id: logId,
    userId,
    userEmail: context?.userEmail,
    userRole: context?.userRole,
    action,
    entityType,
    entityId,
    changes: sanitizeForLogging(changes),
    ipAddress: context?.ipAddress || 'unknown',
    userAgent: context?.userAgent || 'unknown',
    success: context?.success ?? true,
    errorMessage: context?.errorMessage,
    timestamp,
    // Add immutability marker
    _immutable: true,
    _version: '1.0'
  };
  
  await kv.set(logId, auditLog);
  
  console.log(`[AUDIT] ${action} on ${entityType}:${entityId} by ${userId} at ${timestamp}`);
  
  return auditLog;
}
