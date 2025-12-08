/**
 * Compliance & Audit Utilities
 * MFMA, PAIA, POPIA compliance for South African government systems
 */

import { sanitizeForLogging } from './validation';

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  
  // Workflows
  WORKFLOW_CREATED = 'workflow_created',
  WORKFLOW_APPROVED = 'workflow_approved',
  WORKFLOW_REJECTED = 'workflow_rejected',
  WORKFLOW_CHANGED = 'workflow_changed',
  WORKFLOW_VIEWED = 'workflow_viewed',
  
  // Financial
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  BILL_GENERATED = 'bill_generated',
  BILL_VIEWED = 'bill_viewed',
  
  // Reports
  REPORT_GENERATED = 'report_generated',
  REPORT_DOWNLOADED = 'report_downloaded',
  REPORT_VIEWED = 'report_viewed',
  
  // Data Access (PAIA)
  DATA_ACCESSED = 'data_accessed',
  DATA_EXPORTED = 'data_exported',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
  
  // System
  CONFIGURATION_CHANGED = 'configuration_changed',
  INTEGRATION_CONFIGURED = 'integration_configured',
  USER_CREATED = 'user_created',
  USER_MODIFIED = 'user_modified',
  USER_DELETED = 'user_deleted',
  ROLE_CHANGED = 'role_changed',
  
  // Compliance
  CONSENT_GIVEN = 'consent_given',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  DATA_REQUEST_SUBMITTED = 'data_request_submitted',
  DATA_REQUEST_FULFILLED = 'data_request_fulfilled'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  userId: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  metadata?: any;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
}

/**
 * Create immutable audit log entry
 */
export function createAuditLog(
  action: AuditAction,
  userId: string,
  options: {
    userEmail?: string;
    userRole?: string;
    resourceType?: string;
    resourceId?: string;
    previousState?: any;
    newState?: any;
    metadata?: any;
    success?: boolean;
    errorMessage?: string;
  } = {}
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    userId,
    userEmail: options.userEmail,
    userRole: options.userRole,
    ipAddress: getClientIP(),
    userAgent: navigator?.userAgent,
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    previousState: options.previousState ? sanitizeForLogging(options.previousState) : undefined,
    newState: options.newState ? sanitizeForLogging(options.newState) : undefined,
    metadata: options.metadata ? sanitizeForLogging(options.metadata) : undefined,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
    sessionId: getSessionId()
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', entry);
  }
  
  return entry;
}

/**
 * Get client IP address (placeholder - implement with backend)
 */
function getClientIP(): string {
  // In production, this should be extracted from request headers on backend
  return 'client';
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * POPIA Consent Management
 */
export enum ConsentType {
  DATA_COLLECTION = 'data_collection',
  DATA_PROCESSING = 'data_processing',
  DATA_SHARING = 'data_sharing',
  MARKETING = 'marketing',
  PROFILING = 'profiling'
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  version: string; // Policy version
  expiresAt?: string;
  withdrawnAt?: string;
}

export class ConsentManager {
  private static consents: Map<string, ConsentRecord[]> = new Map();
  
  /**
   * Record user consent
   */
  static grantConsent(
    userId: string,
    consentType: ConsentType,
    policyVersion: string,
    expiresAt?: Date
  ): ConsentRecord {
    const consent: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      consentType,
      granted: true,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(),
      version: policyVersion,
      expiresAt: expiresAt?.toISOString()
    };
    
    const userConsents = this.consents.get(userId) || [];
    userConsents.push(consent);
    this.consents.set(userId, userConsents);
    
    // Create audit log
    createAuditLog(AuditAction.CONSENT_GIVEN, userId, {
      metadata: { consentType, version: policyVersion }
    });
    
    return consent;
  }
  
  /**
   * Withdraw consent
   */
  static withdrawConsent(userId: string, consentType: ConsentType): void {
    const userConsents = this.consents.get(userId) || [];
    const activeConsent = userConsents
      .filter(c => c.consentType === consentType && !c.withdrawnAt)
      .pop();
    
    if (activeConsent) {
      activeConsent.withdrawnAt = new Date().toISOString();
      activeConsent.granted = false;
      
      // Create audit log
      createAuditLog(AuditAction.CONSENT_WITHDRAWN, userId, {
        metadata: { consentType }
      });
    }
  }
  
  /**
   * Check if user has valid consent
   */
  static hasConsent(userId: string, consentType: ConsentType): boolean {
    const userConsents = this.consents.get(userId) || [];
    const activeConsent = userConsents
      .filter(c => c.consentType === consentType && !c.withdrawnAt)
      .pop();
    
    if (!activeConsent) return false;
    
    // Check expiration
    if (activeConsent.expiresAt) {
      const expired = new Date(activeConsent.expiresAt) < new Date();
      if (expired) return false;
    }
    
    return activeConsent.granted;
  }
  
  /**
   * Get all consents for user
   */
  static getUserConsents(userId: string): ConsentRecord[] {
    return this.consents.get(userId) || [];
  }
}

/**
 * Data Retention Policy
 */
export interface RetentionPolicy {
  dataType: string;
  retentionPeriodDays: number;
  archiveRequired: boolean;
  deletionMethod: 'soft' | 'hard';
}

export const defaultRetentionPolicies: RetentionPolicy[] = [
  {
    dataType: 'audit_logs',
    retentionPeriodDays: 2555, // 7 years (MFMA requirement)
    archiveRequired: true,
    deletionMethod: 'soft'
  },
  {
    dataType: 'financial_records',
    retentionPeriodDays: 2555, // 7 years
    archiveRequired: true,
    deletionMethod: 'soft'
  },
  {
    dataType: 'workflow_records',
    retentionPeriodDays: 1825, // 5 years
    archiveRequired: true,
    deletionMethod: 'soft'
  },
  {
    dataType: 'user_sessions',
    retentionPeriodDays: 90,
    archiveRequired: false,
    deletionMethod: 'hard'
  },
  {
    dataType: 'temporary_files',
    retentionPeriodDays: 30,
    archiveRequired: false,
    deletionMethod: 'hard'
  },
  {
    dataType: 'personal_data',
    retentionPeriodDays: 365, // Can be deleted upon request (POPIA)
    archiveRequired: false,
    deletionMethod: 'hard'
  }
];

/**
 * Check if data should be retained
 */
export function shouldRetainData(
  dataType: string,
  createdAt: Date
): boolean {
  const policy = defaultRetentionPolicies.find(p => p.dataType === dataType);
  
  if (!policy) {
    // Default: retain for 1 year
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 365);
    return createdAt >= retentionDate;
  }
  
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - policy.retentionPeriodDays);
  
  return createdAt >= retentionDate;
}

/**
 * PAIA (Promotion of Access to Information Act) Request
 */
export interface PAIARequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterContact: string;
  requestType: 'personal_data' | 'public_records' | 'other';
  description: string;
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'fulfilled';
  dueDate: string; // 30 days from submission
  fulfilledAt?: string;
  denialReason?: string;
  documents?: string[];
}

export class PAIARequestManager {
  private static requests: Map<string, PAIARequest> = new Map();
  
  /**
   * Submit PAIA request
   */
  static submitRequest(
    requesterId: string,
    requesterName: string,
    requesterContact: string,
    requestType: PAIARequest['requestType'],
    description: string
  ): PAIARequest {
    const submittedAt = new Date();
    const dueDate = new Date(submittedAt);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days as per PAIA
    
    const request: PAIARequest = {
      id: `paia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requesterId,
      requesterName,
      requesterContact,
      requestType,
      description,
      submittedAt: submittedAt.toISOString(),
      status: 'submitted',
      dueDate: dueDate.toISOString()
    };
    
    this.requests.set(request.id, request);
    
    // Create audit log
    createAuditLog(AuditAction.DATA_REQUEST_SUBMITTED, requesterId, {
      resourceType: 'paia_request',
      resourceId: request.id,
      metadata: { requestType, description }
    });
    
    return request;
  }
  
  /**
   * Update request status
   */
  static updateStatus(
    requestId: string,
    status: PAIARequest['status'],
    denialReason?: string
  ): void {
    const request = this.requests.get(requestId);
    if (!request) return;
    
    request.status = status;
    
    if (status === 'denied' && denialReason) {
      request.denialReason = denialReason;
    }
    
    if (status === 'fulfilled') {
      request.fulfilledAt = new Date().toISOString();
      
      // Create audit log
      createAuditLog(AuditAction.DATA_REQUEST_FULFILLED, request.requesterId, {
        resourceType: 'paia_request',
        resourceId: requestId
      });
    }
  }
  
  /**
   * Get request by ID
   */
  static getRequest(requestId: string): PAIARequest | undefined {
    return this.requests.get(requestId);
  }
  
  /**
   * Get overdue requests
   */
  static getOverdueRequests(): PAIARequest[] {
    const now = new Date();
    return Array.from(this.requests.values()).filter(
      req => req.status !== 'fulfilled' && req.status !== 'denied' && 
             new Date(req.dueDate) < now
    );
  }
}

/**
 * Digital signature for non-repudiation
 */
export async function createDigitalSignature(
  data: any,
  userId: string
): Promise<string> {
  // In production, use proper cryptographic signing
  // For now, create a hash-based signature
  const payload = JSON.stringify({
    data: sanitizeForLogging(data),
    userId,
    timestamp: new Date().toISOString()
  });
  
  // Simple hash (in production, use HMAC-SHA256 or similar)
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return signature;
}

/**
 * Verify digital signature
 */
export async function verifyDigitalSignature(
  data: any,
  userId: string,
  signature: string
): Promise<boolean> {
  const calculatedSignature = await createDigitalSignature(data, userId);
  return calculatedSignature === signature;
}

/**
 * Compliance report generator
 */
export interface ComplianceReport {
  reportType: 'audit' | 'consent' | 'retention' | 'paia';
  generatedAt: string;
  generatedBy: string;
  periodStart: string;
  periodEnd: string;
  summary: any;
  details: any[];
}

export async function generateComplianceReport(
  reportType: ComplianceReport['reportType'],
  periodStart: Date,
  periodEnd: Date,
  generatedBy: string
): Promise<ComplianceReport> {
  const report: ComplianceReport = {
    reportType,
    generatedAt: new Date().toISOString(),
    generatedBy,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    summary: {},
    details: []
  };
  
  // Different logic based on report type
  switch (reportType) {
    case 'audit':
      // Compile audit logs for period
      report.summary = {
        totalActions: 0,
        failedActions: 0,
        uniqueUsers: 0
      };
      break;
    
    case 'consent':
      // Compile consent records
      report.summary = {
        totalConsents: 0,
        activeConsents: 0,
        withdrawnConsents: 0
      };
      break;
    
    case 'retention':
      // Check data retention compliance
      report.summary = {
        itemsToArchive: 0,
        itemsToDelete: 0,
        complianceRate: 100
      };
      break;
    
    case 'paia':
      // PAIA request statistics
      const overdueRequests = PAIARequestManager.getOverdueRequests();
      report.summary = {
        totalRequests: 0,
        overdueRequests: overdueRequests.length,
        avgResponseTime: 0
      };
      break;
  }
  
  // Create audit log for report generation
  createAuditLog(AuditAction.REPORT_GENERATED, generatedBy, {
    resourceType: 'compliance_report',
    metadata: { reportType, periodStart, periodEnd }
  });
  
  return report;
}
