// Taxi Fare & Fuel Cost Calculator Service

import { TaxiFareInput, TaxiFareResult } from '@/types/calculator.types';

export const calculateTaxiFare = (
  input: TaxiFareInput,
  estimatedMinutes?: number
): TaxiFareResult => {
  // SA Taxi rates (typical averages as of 2024)
  const baseRatePerKm = 12.50; // R per km
  const timeRatePerMin = 0.75; // R per minute

  // Estimate travel time if not provided (average 40 km/h in urban areas)
  const travelMinutes = estimatedMinutes || Math.ceil((input.distanceKm / 40) * 60);

  // Calculate distance cost
  const distanceCost = input.distanceKm * baseRatePerKm;

  // Calculate time cost
  const timeCost = travelMinutes * timeRatePerMin;

  // Peak hour surcharge (06:00-09:00, 16:00-19:00)
  const peakCharge = input.isPeakHour ? 25.0 : 0;

  // Calculate fuel cost
  const fuelNeeded = input.distanceKm / input.fuelEfficiency;
  const fuelCost = fuelNeeded * input.currentFuelPrice;

  // Total fare
  const totalFare = distanceCost + timeCost + peakCharge;

  // Cost per person (split fare)
  const costPerPerson = totalFare / Math.max(input.passengers, 1);

  // Driver revenue (fare minus fuel cost)
  const driverRevenue = totalFare - fuelCost;

  // Suggested tip (10% of total fare)
  const suggestedTip = totalFare * 0.1;

  return {
    baseFarePerKm: baseRatePerKm,
    totalDistance: input.distanceKm,
    distanceCost,
    timeCost,
    peakCharge,
    fuelCost,
    totalFare,
    costPerPerson,
    driverRevenue,
    breakdown: {
      distance: distanceCost,
      time: timeCost,
      peak: peakCharge,
      fuel: fuelCost,
      tip: suggestedTip,
    },
  };
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check if current time is peak hour
export const isPeakHour = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  return (hour >= 6 && hour < 9) || (hour >= 16 && hour < 19);
};

// Get current fuel price (mock - would normally come from API)
export const getCurrentFuelPrice = (): number => {
  // As of late 2024, average petrol price in SA
  return 23.5; // R per liter
};

// Common SA city coordinates for quick selection
export const SA_CITIES = [
  { name: 'Johannesburg CBD', lat: -26.2041, lng: 28.0473 },
  { name: 'Sandton', lat: -26.1076, lng: 28.0567 },
  { name: 'Pretoria CBD', lat: -25.7479, lng: 28.2293 },
  { name: 'Cape Town CBD', lat: -33.9249, lng: 18.4241 },
  { name: 'Durban CBD', lat: -29.8587, lng: 31.0218 },
  { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022 },
  { name: 'Bloemfontein', lat: -29.1211, lng: 26.2142 },
  { name: 'East London', lat: -33.0153, lng: 27.9116 },
];
