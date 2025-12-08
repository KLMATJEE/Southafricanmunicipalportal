/**
 * Billing Routes - API endpoints for real-time billing system
 * 
 * Endpoints:
 * - POST /make-server-4c8674b4/billing/realtime - Calculate real-time billing
 * - GET /make-server-4c8674b4/billing/history - Get billing history
 * - GET /make-server-4c8674b4/billing/forecast - Get forecasted billing
 * - POST /make-server-4c8674b4/meters/register - Register a new meter
 * - GET /make-server-4c8674b4/meters/list - List user's meters
 */

import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  calcElectricity,
  calcWater,
  loadActiveTariffs,
  loadRecentReadings,
  loadContextSignals
} from './tariff-engine.tsx';
import {
  logCalculation,
  getUserAuditTrail,
  getUserBillingHistory,
  createBillSnapshot
} from './audit-logger.tsx';

export const billingRoutes = new Hono();

// Enable CORS
billingRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

/**
 * POST /billing/realtime
 * Calculate real-time billing for a user's meters
 * 
 * Body: { userId, horizonMinutes?: 60 }
 * Headers: Authorization: Bearer <access_token>
 */
billingRoutes.post('/billing/realtime', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Verify user authentication
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      // Anonymous access - use userId from body (for demo/testing)
      console.log('Anonymous access - using userId from request body');
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
    }
    
    const { userId, horizonMinutes = 60 } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    // Load user's meters
    const { data: meters, error: metersError } = await supabase
      .from('meters')
      .select('*')
      .eq('user_id', userId);
    
    if (metersError) {
      console.error('Error loading meters:', metersError);
      return c.json({ error: 'Failed to load meters', details: metersError.message }, 500);
    }
    
    if (!meters || meters.length === 0) {
      return c.json({
        userId,
        horizonMinutes,
        totalCost: 0,
        breakdown: [],
        generatedAt: new Date().toISOString(),
        message: 'No meters registered for this user'
      });
    }
    
    // Load tariffs for all providers
    const providers = meters.map(m => ({
      provider: m.provider,
      utility: m.meter_type as 'electricity' | 'water'
    }));
    const tariffsMap = await loadActiveTariffs(supabase, providers);
    
    // Load context signals
    const signals = await loadContextSignals(supabase);
    
    // Load recent readings
    const meterIds = meters.map(m => m.id);
    const readingsMap = await loadRecentReadings(supabase, meterIds, horizonMinutes);
    
    // Calculate billing for each meter
    const results = [];
    const tariffVersions: Record<string, string> = {};
    
    for (const meter of meters) {
      const tariff = tariffsMap.get(meter.provider)?.get(meter.meter_type);
      
      if (!tariff) {
        console.warn(`No tariff found for ${meter.provider}/${meter.meter_type}`);
        continue;
      }
      
      const readings = readingsMap.get(meter.id) || [];
      
      let calc;
      if (meter.meter_type === 'electricity') {
        calc = calcElectricity(readings, tariff, signals, horizonMinutes);
      } else {
        calc = calcWater(readings, tariff, signals, horizonMinutes);
      }
      
      results.push({
        meterId: meter.id,
        type: meter.meter_type,
        location: meter.location,
        ...calc
      });
      
      tariffVersions[`${meter.provider}_${meter.meter_type}`] = tariff.version;
    }
    
    const totalCost = results.reduce((acc, r) => acc + r.totalCost, 0);
    
    const responseData = {
      userId,
      horizonMinutes,
      totalCost,
      breakdown: results,
      generatedAt: new Date().toISOString(),
      signals: {
        loadSheddingStage: signals.load_shedding_stage,
        currentWindow: signals.current_window,
        carbonIntensity: signals.carbon_intensity_gco2_per_kwh
      }
    };
    
    // Audit log
    await logCalculation(supabase, {
      userId,
      calculationType: 'realtime_billing',
      inputData: { userId, horizonMinutes, meterIds },
      outputData: responseData,
      tariffVersions,
      requestMetadata: {
        ipAddress: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
    
    return c.json(responseData);
    
  } catch (error) {
    console.error('Real-time billing calculation error:', error);
    return c.json({
      error: 'Internal server error during billing calculation',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /billing/history
 * Get billing history for a user
 * 
 * Query: ?userId=<user_id>&months=<number>
 */
billingRoutes.get('/billing/history', async (c) => {
  try {
    const userId = c.req.query('userId');
    const months = parseInt(c.req.query('months') || '12');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const history = await getUserBillingHistory(supabase, userId, months);
    
    return c.json({
      userId,
      months,
      history
    });
    
  } catch (error) {
    console.error('Billing history error:', error);
    return c.json({
      error: 'Failed to fetch billing history',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /billing/forecast
 * Get forecasted billing based on current usage patterns
 * 
 * Query: ?userId=<user_id>&forecastDays=<number>
 */
billingRoutes.get('/billing/forecast', async (c) => {
  try {
    const userId = c.req.query('userId');
    const forecastDays = parseInt(c.req.query('forecastDays') || '30');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: meters } = await supabase
      .from('meters')
      .select('*')
      .eq('user_id', userId);
    
    if (!meters || meters.length === 0) {
      return c.json({
        userId,
        forecastDays,
        forecast: [],
        message: 'No meters registered'
      });
    }
    
    const meterIds = meters.map(m => m.id);
    const { data: readings } = await supabase
      .from('readings')
      .select('*')
      .in('meter_id', meterIds)
      .gte('timestamp', startOfMonth.toISOString());
    
    // Calculate daily averages
    const dailyAverages = new Map<string, number>();
    
    for (const meter of meters) {
      const meterReadings = readings?.filter(r => r.meter_id === meter.id) || [];
      const totalUsage = meterReadings.reduce((sum, r) => sum + r.value, 0);
      const days = Math.max(1, Math.floor((Date.now() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
      dailyAverages.set(meter.id, totalUsage / days);
    }
    
    return c.json({
      userId,
      forecastDays,
      dailyAverages: Object.fromEntries(dailyAverages),
      message: 'Forecast based on current month average'
    });
    
  } catch (error) {
    console.error('Billing forecast error:', error);
    return c.json({
      error: 'Failed to generate forecast',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * POST /meters/register
 * Register a new meter for a user
 * 
 * Body: { userId, meterType, provider, location, isSmart }
 */
billingRoutes.post('/meters/register', async (c) => {
  try {
    const { userId, meterType, provider, location, isSmart = false } = await c.req.json();
    
    if (!userId || !meterType || !provider) {
      return c.json({ error: 'userId, meterType, and provider are required' }, 400);
    }
    
    if (!['electricity', 'water'].includes(meterType)) {
      return c.json({ error: 'meterType must be electricity or water' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: meter, error } = await supabase
      .from('meters')
      .insert({
        user_id: userId,
        meter_type: meterType,
        provider,
        location,
        is_smart: isSmart
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error registering meter:', error);
      return c.json({ error: 'Failed to register meter', details: error.message }, 500);
    }
    
    return c.json({
      message: 'Meter registered successfully',
      meter
    });
    
  } catch (error) {
    console.error('Meter registration error:', error);
    return c.json({
      error: 'Failed to register meter',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /meters/list
 * List all meters for a user
 * 
 * Query: ?userId=<user_id>
 */
billingRoutes.get('/meters/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: meters, error } = await supabase
      .from('meters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error listing meters:', error);
      return c.json({ error: 'Failed to list meters', details: error.message }, 500);
    }
    
    return c.json({
      userId,
      meters: meters || []
    });
    
  } catch (error) {
    console.error('Meter listing error:', error);
    return c.json({
      error: 'Failed to list meters',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * POST /readings/ingest
 * Ingest meter readings (for IoT/smart meter data)
 * 
 * Body: { meterId, readings: [{ timestamp, value }] }
 */
billingRoutes.post('/readings/ingest', async (c) => {
  try {
    const { meterId, readings } = await c.req.json();
    
    if (!meterId || !Array.isArray(readings) || readings.length === 0) {
      return c.json({ error: 'meterId and readings array are required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Prepare readings for insertion
    const readingsToInsert = readings.map(r => ({
      meter_id: meterId,
      timestamp: r.timestamp,
      value: r.value,
      quality_flag: r.quality_flag || 'good'
    }));
    
    const { error } = await supabase
      .from('readings')
      .insert(readingsToInsert);
    
    if (error) {
      console.error('Error ingesting readings:', error);
      return c.json({ error: 'Failed to ingest readings', details: error.message }, 500);
    }
    
    return c.json({
      message: 'Readings ingested successfully',
      count: readings.length
    });
    
  } catch (error) {
    console.error('Reading ingestion error:', error);
    return c.json({
      error: 'Failed to ingest readings',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
