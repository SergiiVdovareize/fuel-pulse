import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatDateISO,
  isValidDateFormat,
  formatDateUkrainian,
  getPreviousDateISO,
  calculateDeltas,
  generateHistoryMock,
  fetchFuelPrices,
  fetchFuelHistory,
  formatHistoryItemsToPoints
} from './fuelApi';

describe('fuelApi service', () => {
  describe('formatDateISO', () => {
    it('should format a date correctly to YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 18);
      expect(formatDateISO(date)).toBe('2026-09-18');
    });

    it('should pad single-digit month and day with zeros', () => {
      const date = new Date(2026, 0, 5);
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

  describe('formatHistoryItemsToPoints', () => {
    it('should format API items into history points with Ukrainian dates', () => {
      const items = [
        { date: '2026-09-18', prices: { a95: 57.0 } },
        { date: '2026-09-19', prices: { a95: 57.2 } }
      ];

      const points = formatHistoryItemsToPoints(items);
      expect(points.length).toBe(2);
      expect(points[0].formattedDate).toBe('18 вересня');
      expect(points[1].formattedDate).toBe('19 вересня');
    });
  });

  describe('fetchFuelHistory', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch history from /fuel/history API endpoint', async () => {
      const mockHistoryResponse = {
        startDate: '2026-09-12',
        endDate: '2026-09-18',
        days: 7,
        currency: 'UAH',
        unit: 'грн/л',
        items: [
          { date: '2026-09-12', prices: { a95: 56.8 } },
          { date: '2026-09-18', prices: { a95: 57.0 } }
        ],
        source: 'https://index.minfin.com.ua/ua/markets/fuel/'
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistoryResponse
      } as Response);

      const result = await fetchFuelHistory('2026-09-18', 7);
      expect(result.days).toBe(7);
      expect(result.items.length).toBe(2);
    });

    it('should cap days at 30 max according to spec', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      } as Response);

      await fetchFuelHistory('2026-09-18', 50);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('days=30'),
        expect.anything()
      );
    });
  });

  describe('fetchFuelPrices', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch prices and return history + deltas', async () => {
      const mockSingleData = {
        requestedDate: '2026-09-18',
        effectiveDate: '2026-09-18',
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
        json: async () => mockSingleData
      } as Response);

      const result = await fetchFuelPrices('2026-09-18');
      expect(result.requestedDate).toBe('2026-09-18');
      expect(result.prices.a95).toBe(57.0);
    });

    it('should return hasError: true and empty prices when API fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFuelPrices('2026-09-18');
      expect(result.hasError).toBe(true);
      expect(result.requestedDate).toBe('2026-09-18');
      expect(result.prices).toEqual({});
      expect(result.deltas).toEqual({});
    });
  });
});
