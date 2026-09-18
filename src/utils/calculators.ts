/**
 * Utilities for fuel tank and trip calculations
 */

export interface TankCalculationResult {
  totalCost: number;
  liters: number;
  pricePerLiter: number;
}

export interface TripCalculationResult {
  totalCost: number;
  fuelNeededLiters: number;
  costPerKm: number;
}

/**
 * Calculates total cost for filling a fuel tank.
 */
export function calculateTankCost(liters: number, pricePerLiter: number): number {
  if (liters <= 0 || pricePerLiter <= 0 || isNaN(liters) || isNaN(pricePerLiter)) {
    return 0;
  }
  const total = liters * pricePerLiter;
  return Math.round(total * 100) / 100;
}

/**
 * Calculates total fuel cost and liters needed for a trip.
 */
export function calculateTripCost(
  distanceKm: number,
  consumptionPer100km: number,
  pricePerLiter: number
): TripCalculationResult {
  if (
    distanceKm <= 0 ||
    consumptionPer100km <= 0 ||
    pricePerLiter <= 0 ||
    isNaN(distanceKm) ||
    isNaN(consumptionPer100km) ||
    isNaN(pricePerLiter)
  ) {
    return {
      totalCost: 0,
      fuelNeededLiters: 0,
      costPerKm: 0
    };
  }

  const fuelNeededLiters = (distanceKm * consumptionPer100km) / 100;
  const totalCost = fuelNeededLiters * pricePerLiter;
  const costPerKm = totalCost / distanceKm;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    fuelNeededLiters: Math.round(fuelNeededLiters * 100) / 100,
    costPerKm: Math.round(costPerKm * 100) / 100
  };
}
