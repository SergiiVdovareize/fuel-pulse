import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatDateISO,
  isValidDateFormat,
  formatDateUkrainian,
  getPreviousDateISO,
  calculateDeltas,
  generateHistoryMock,
  fetchFuelPrices
} from './fuelApi';

describe('fuelApi service', () => {
  describe('formatDateISO', () => {
    it('should format a date correctly to YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 18); // Month is 0-indexed (8 = September)
      expect(formatDateISO(date)).toBe('2026-09-18');
    });

    it('should pad single-digit month and day with zeros', () => {
      const date = new Date(2026, 0, 5); // Jan 5
      expect(formatDateISO(date)).toBe('2026-01-05');
    });
  });

  describe('isValidDateFormat', () => {
    it('should validate correct YYYY-MM-DD strings', () => {
      expect(isValidDateFormat('2026-09-18')).toBe(true);
      expect(isValidDateFormat('2024-12-31')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateFormat('18-09-2026')).toBe(false);
      expect(isValidDateFormat('invalid-date')).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
      expect(isValidDateFormat('2026-99-99')).toBe(false);
    });
  });

  describe('getPreviousDateISO', () => {
    it('should return previous day in YYYY-MM-DD format', () => {
      expect(getPreviousDateISO('2026-09-18')).toBe('2026-09-17');
      expect(getPreviousDateISO('2026-01-01')).toBe('2025-12-31');
    });
  });

  describe('calculateDeltas', () => {
    it('should calculate difference between current and previous prices', () => {
      const current = { a95: 57.00, diesel: 55.50, gas: 37.10 };
      const previous = { a95: 56.60, diesel: 55.80, gas: 37.10 };

      const deltas = calculateDeltas(current, previous);
      expect(deltas.a95).toBe(0.40);
      expect(deltas.diesel).toBe(-0.30);
      expect(deltas.gas).toBe(0);
    });
  });

  describe('generateHistoryMock', () => {
    it('should generate requested number of history points ending at endDate', () => {
      const basePrices = { a95: 56.81, diesel: 55.22, gas: 37.07 };
      const history = generateHistoryMock('2026-09-18', basePrices, 30);

      expect(history.length).toBe(30);
      expect(history[history.length - 1].date).toBe('2026-09-18');
      expect(history[0].date).toBe('2026-08-20');
    });
  });

  describe('formatDateUkrainian', () => {
    it('should format YYYY-MM-DD into Ukrainian genitive date representation', () => {
      expect(formatDateUkrainian('2026-09-18')).toBe('18 вересня 2026 року');
      expect(formatDateUkrainian('2026-01-01')).toBe('1 січня 2026 року');
      expect(formatDateUkrainian('2026-12-31')).toBe('31 грудня 2026 року');
    });

    it('should return original string if input format is invalid', () => {
      expect(formatDateUkrainian('invalid')).toBe('invalid');
    });
  });

  describe('fetchFuelPrices', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch prices and return history + deltas', async () => {
      const mockData = {
        requestedDate: '2026-09-18',
        effectiveDate: '2026-09-18',
        isFallback: false,
        currency: 'UAH',
        unit: 'грн/л',
        prices: {
          a95Premium: 60.5,
          a95: 57.0,
          a92: 54.0,
          diesel: 56.0,
          gas: 38.0
        },
        source: 'https://api.vdovareize.me/fuel'
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchFuelPrices('2026-09-18');
      expect(result.requestedDate).toBe('2026-09-18');
      expect(result.prices.a95).toBe(57.0);
      expect(result.history).toBeDefined();
      expect(result.history?.length).toBe(30);
      expect(result.deltas).toBeDefined();
    });

    it('should return fallback data with deltas when API fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFuelPrices('2026-09-18');
      expect(result.isFallback).toBe(true);
      expect(result.requestedDate).toBe('2026-09-18');
      expect(result.prices).toBeDefined();
      expect(result.deltas).toBeDefined();
    });
  });
});
