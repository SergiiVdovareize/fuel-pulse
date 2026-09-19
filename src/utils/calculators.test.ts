import { describe, it, expect } from 'vitest';
import { calculateTankCost, calculateTripCost, calculateTodayComparison } from './calculators';

describe('calculators utility', () => {
  describe('calculateTankCost', () => {
    it('should correctly calculate total tank cost', () => {
      expect(calculateTankCost(50, 56.81)).toBe(2840.5);
      expect(calculateTankCost(40, 37.07)).toBe(1482.8);
    });

    it('should round result to 2 decimal places', () => {
      expect(calculateTankCost(55.5, 59.99)).toBe(3329.45);
    });

    it('should return 0 for non-positive or NaN values', () => {
      expect(calculateTankCost(0, 50)).toBe(0);
      expect(calculateTankCost(50, 0)).toBe(0);
      expect(calculateTankCost(-10, 50)).toBe(0);
      expect(calculateTankCost(50, -5)).toBe(0);
      expect(calculateTankCost(NaN, 50)).toBe(0);
    });
  });

  describe('calculateTripCost', () => {
    it('should calculate fuel needed, total cost, and cost per km for a trip', () => {
      const result = calculateTripCost(500, 8, 56.81);
      expect(result.fuelNeededLiters).toBe(40);
      expect(result.totalCost).toBe(2272.4);
      expect(result.costPerKm).toBe(4.54);
    });

    it('should handle fractional values correctly', () => {
      const result = calculateTripCost(150, 6.5, 55.22);
      expect(result.fuelNeededLiters).toBe(9.75);
      expect(result.totalCost).toBe(538.4);
    });

    it('should return zeros for invalid input values', () => {
      expect(calculateTripCost(0, 8, 50)).toEqual({
        totalCost: 0,
        fuelNeededLiters: 0,
        costPerKm: 0
      });
      expect(calculateTripCost(100, -5, 50)).toEqual({
        totalCost: 0,
        fuelNeededLiters: 0,
        costPerKm: 0
      });
    });
  });

  describe('calculateTodayComparison', () => {
    it('should correctly format cheaper comparison label when past price is lower than today', () => {
      const result = calculateTodayComparison(52.0, 56.8);
      expect(result).toBeDefined();
      expect(result?.type).toBe('cheaper');
      expect(result?.text).toBe('📉 на 4.80 грн дешевше, ніж сьогодні');
    });

    it('should correctly format expensive comparison label when past price is higher than today', () => {
      const result = calculateTodayComparison(58.3, 56.8);
      expect(result).toBeDefined();
      expect(result?.type).toBe('expensive');
      expect(result?.text).toBe('📈 на 1.50 грн дорожче, ніж сьогодні');
    });

    it('should correctly format equal comparison label when prices match', () => {
      const result = calculateTodayComparison(56.8, 56.8);
      expect(result).toBeDefined();
      expect(result?.type).toBe('equal');
      expect(result?.text).toBe('⚖️ ціна така сама, як і сьогодні');
    });

    it('should return null for invalid or missing inputs', () => {
      expect(calculateTodayComparison(undefined, 56.8)).toBeNull();
      expect(calculateTodayComparison(52.0, 0)).toBeNull();
    });
  });
});
