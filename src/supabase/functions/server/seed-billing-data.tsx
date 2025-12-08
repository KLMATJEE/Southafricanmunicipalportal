/**
 * Seed Billing Data
 * 
 * Utility script to populate sample billing data for testing
 * This generates:
 * - Sample meters for a user
 * - Realistic meter readings over time
 * - Context signals (load-shedding, peak schedules, etc.)
 * 
 * Usage: Call the POST /make-server-4c8674b4/billing/seed endpoint
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const seedRoutes = new Hono();

/**
 * POST /billing/seed
 * Seeds sample billing data for testing
 * Body: { userId }
 */
seedRoutes.post('/billing/seed', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Create sample electricity meter
    const { data: electricityMeter, error: e1 } = await supabase
      .from('meters')
      .insert({
        user_id: userId,
        meter_type: 'electricity',
        provider: 'city_power_jhb',
        location: { name: 'Main House' },
        is_smart: true
      })
      .select()
      .single();
    
    if (e1) {
      console.error('Error creating electricity meter:', e1);
      return c.json({ error: 'Failed to create electricity meter', details: e1.message }, 500);
    }
    
    // Create sample water meter
    const { data: waterMeter, error: e2 } = await supabase
      .from('meters')
      .insert({
        user_id: userId,
        meter_type: 'water',
        provider: 'jhb_water',
        location: { name: 'Main House' },
        is_smart: true
      })
      .select()
      .single();
    
    if (e2) {
      console.error('Error creating water meter:', e2);
      return c.json({ error: 'Failed to create water meter', details: e2.message }, 500);
    }
    
    // Generate electricity readings (last 60 minutes)
    const electricityReadings = [];
    const now = Date.now();
    
    for (let i = 60; i >= 0; i -= 5) {
      const timestamp = new Date(now - i * 60 * 1000);
      const baseUsage = 0.25; // kWh per 5 minutes
      const variation = (Math.random() - 0.5) * 0.1;
      const usage = baseUsage + variation;
      
      electricityReadings.push({
        meter_id: electricityMeter.id,
        timestamp: timestamp.toISOString(),
        value: usage,
        quality_flag: 'good'
      });
    }
    
    // Generate water readings (last 60 minutes)
    const waterReadings = [];
    
    for (let i = 60; i >= 0; i -= 5) {
      const timestamp = new Date(now - i * 60 * 1000);
      const baseUsage = 0.01; // kL per 5 minutes
      const variation = (Math.random() - 0.5) * 0.005;
      const usage = baseUsage + variation;
      
      waterReadings.push({
        meter_id: waterMeter.id,
        timestamp: timestamp.toISOString(),
        value: usage,
        quality_flag: 'good'
      });
    }
    
    // Insert readings
    const { error: e3 } = await supabase
      .from('readings')
      .insert([...electricityReadings, ...waterReadings]);
    
    if (e3) {
      console.error('Error inserting readings:', e3);
      return c.json({ error: 'Failed to insert readings', details: e3.message }, 500);
    }
    
    // Update context signals
    await supabase
      .from('context_signals')
      .upsert([
        {
          signal_name: 'load_shedding_stage',
          signal_value: { stage: 0, updated_at: new Date().toISOString() },
          timestamp: new Date().toISOString()
        },
        {
          signal_name: 'peak_schedule',
          signal_value: {
            current_window: getTimeOfUseWindow(new Date()),
            next_change: getNextWindowChange(new Date()),
            updated_at: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
        {
          signal_name: 'carbon_intensity',
          signal_value: {
            gco2_per_kwh: 950,
            source: 'eskom_mix',
            updated_at: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
        {
          signal_name: 'drought_period',
          signal_value: { active: false, updated_at: new Date().toISOString() },
          timestamp: new Date().toISOString()
        }
      ]);
    
    return c.json({
      success: true,
      message: 'Sample billing data seeded successfully',
      meters: {
        electricity: electricityMeter.id,
        water: waterMeter.id
      },
      readings: {
        electricity: electricityReadings.length,
        water: waterReadings.length
      }
    });
    
  } catch (error) {
    console.error('Seed data error:', error);
    return c.json({
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * Helper: Get current time-of-use window
 */
function getTimeOfUseWindow(date: Date): string {
  const hour = date.getHours();
  
  if (hour >= 6 && hour < 9) return 'peak';
  if (hour >= 17 && hour < 21) return 'peak';
  if (hour >= 23 || hour < 6) return 'off';
  return 'standard';
}

/**
 * Helper: Get next window change time
 */
function getNextWindowChange(date: Date): string {
  const hour = date.getHours();
  const nextChange = new Date(date);
  
  if (hour < 6) {
    nextChange.setHours(6, 0, 0, 0);
  } else if (hour < 9) {
    nextChange.setHours(9, 0, 0, 0);
  } else if (hour < 17) {
    nextChange.setHours(17, 0, 0, 0);
  } else if (hour < 21) {
    nextChange.setHours(21, 0, 0, 0);
  } else if (hour < 23) {
    nextChange.setHours(23, 0, 0, 0);
  } else {
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(6, 0, 0, 0);
  }
  
  return nextChange.toISOString();
}
