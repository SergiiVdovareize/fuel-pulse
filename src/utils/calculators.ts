/**
 * Utilities for fuel tank, trip calculations, and today's price comparisons
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

export interface TodayComparisonResult {
  diff: number;
  type: 'cheaper' | 'expensive' | 'equal';
  text: string;
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

/**
 * Compares a historical price with today's price (Variant A).
 */
export function calculateTodayComparison(
  pastPrice?: number,
  todayPrice?: number
): TodayComparisonResult | null {
  if (
    typeof pastPrice !== 'number' ||
    typeof todayPrice !== 'number' ||
    pastPrice <= 0 ||
    todayPrice <= 0 ||
    isNaN(pastPrice) ||
    isNaN(todayPrice)
  ) {
    return null;
  }

  const diff = Math.round((pastPrice - todayPrice) * 100) / 100;
  const absDiff = Math.abs(diff).toFixed(2);

  if (diff < 0) {
    return {
      diff,
      type: 'cheaper',
      text: `📉 на ${absDiff} грн дешевше, ніж сьогодні`
    };
  } else if (diff > 0) {
    return {
      diff,
      type: 'expensive',
      text: `📈 на ${absDiff} грн дорожче, ніж сьогодні`
    };
  } else {
    return {
      diff: 0,
      type: 'equal',
      text: `⚖️ ціна така сама, як і сьогодні`
    };
  }
}
