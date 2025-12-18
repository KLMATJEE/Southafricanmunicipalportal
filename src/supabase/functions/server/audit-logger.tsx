/**
 * Audit Logger - Comprehensive audit trail for all billing calculations
 * 
 * Implements POPIA-compliant audit logging with:
 * - Input/output hashing for tamper detection
 * - Tariff version tracking
 * - Request metadata (IP, user agent, etc.)
 * - Cryptographic verification
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

export interface AuditLogEntry {
  userId: string;
  calculationType: string;
  inputData: any;
  outputData: any;
  tariffVersions: Record<string, string>;
  requestMetadata?: {
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
  };
}

/**
 * Generate SHA-256 hash of an object for audit trail
 */
export function generateHash(data: any): string {
  const hash = createHash('sha256');
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  hash.update(dataString);
  return hash.digest('hex');
}

/**
 * Log a billing calculation to the audit trail
 */
export async function logCalculation(
  supabase: ReturnType<typeof createClient>,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const inputHash = generateHash(entry.inputData);
    const outputHash = generateHash(entry.outputData);
    
    const { error } = await supabase
      .from('audit_calculations')
      .insert({
        user_id: entry.userId,
        calculation_type: entry.calculationType,
        input_hash: inputHash,
        output_hash: outputHash,
        tariff_versions: entry.tariffVersions,
        request_metadata: entry.requestMetadata || {
          timestamp: new Date().toISOString()
        },
        response_data: entry.outputData
      });
    
    if (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit logging failure shouldn't block the response
    }
  } catch (error) {
    console.error('Unexpected audit logging error:', error);
  }
}

/**
 * Verify an audit entry by recalculating its hash
 */
export async function verifyAuditEntry(
  supabase: ReturnType<typeof createClient>,
  auditId: string
): Promise<{ valid: boolean; details?: string }> {
  const { data, error } = await supabase
    .from('audit_calculations')
    .select('*')
    .eq('id', auditId)
    .single();
  
  if (error || !data) {
    return { valid: false, details: 'Audit entry not found' };
  }
  
  // Recalculate output hash
  const calculatedHash = generateHash(data.response_data);
  
  if (calculatedHash !== data.output_hash) {
    return {
      valid: false,
      details: `Hash mismatch: expected ${data.output_hash}, got ${calculatedHash}`
    };
  }
  
  return { valid: true };
}

/**
 * Get audit trail for a user
 */
export async function getUserAuditTrail(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  limit: number = 100
): Promise<any[]> {
  const { data, error } = await supabase
    .from('audit_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Create a bill snapshot for historical record-keeping
 */
export async function createBillSnapshot(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  periodStart: Date,
  periodEnd: Date,
  totals: any,
  breakdown: any,
  tariffVersions: Record<string, string>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('bill_snapshots')
      .insert({
        user_id: userId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        totals,
        breakdown,
        tariff_versions: tariffVersions
      });
    
    if (error) {
      console.error('Error creating bill snapshot:', error);
    }
  } catch (error) {
    console.error('Unexpected error creating bill snapshot:', error);
  }
}

/**
 * Get billing history for a user
 */
export async function getUserBillingHistory(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  months: number = 12
): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const { data, error } = await supabase
    .from('bill_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', cutoffDate.toISOString())
    .order('period_start', { ascending: false });
  
  if (error) {
    console.error('Error fetching billing history:', error);
    return [];
  }
  
  return data || [];
}
