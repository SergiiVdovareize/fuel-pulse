import { describe, expect, it, vi } from 'vitest';
import { initWebMCP, webMcpTools } from './webmcp';

// Mock fetch for fuel API
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/history')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          startDate: '2026-09-19',
          endDate: '2026-09-19',
          items: []
        })
    });
  }
  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        date: '2026-09-19',
        prices: {
          a95Premium: 61.5,
          a95: 58.2,
          a92: 55.1,
          diesel: 58.0,
          gas: 33.4
        },
        delta: {
          a95: 0.1
        },
        currency: 'UAH',
        unit: 'грн/л'
      })
  });
});

describe('WebMCP Module', () => {
  it('should define exactly 3 WebMCP tools', () => {
    expect(webMcpTools).toHaveLength(3);
    const names = webMcpTools.map((t) => t.name);
    expect(names).toContain('get_fuel_prices');
    expect(names).toContain('calculate_full_tank');
    expect(names).toContain('calculate_trip_cost');
  });

  it('get_fuel_prices tool handler should return formatted prices', async () => {
    const tool = webMcpTools.find((t) => t.name === 'get_fuel_prices')!;
    const result = await tool.handler({ date: '2026-09-19' });

    expect(result.prices['A-95']).toBe(58.2);
    expect(result.prices['Автогаз']).toBe(33.4);
    expect(result.currency).toBe('UAH');
  });

  it('calculate_full_tank tool handler should calculate tank filling cost', async () => {
    const tool = webMcpTools.find((t) => t.name === 'calculate_full_tank')!;
    const result = await tool.handler({ tankVolumeLiters: 50, fuelType: 'a95' });

    expect(result.tankVolumeLiters).toBe(50);
    expect(result.pricePerLiter).toBe(58.2);
    expect(result.totalCost).toBe(2910);
  });

  it('calculate_trip_cost tool handler should calculate trip expenses', async () => {
    const tool = webMcpTools.find((t) => t.name === 'calculate_trip_cost')!;
    const result = await tool.handler({ distanceKm: 200, consumptionPer100km: 10, fuelType: 'gas' });

    expect(result.distanceKm).toBe(200);
    expect(result.fuelNeededLiters).toBe(20);
    expect(result.pricePerLiter).toBe(33.4);
    expect(result.totalCost).toBe(668);
  });

  it('initWebMCP should register tools when window.navigator.modelContext is present', () => {
    const mockRegisterTool = vi.fn();
    (global as any).window = {
      navigator: {
        modelContext: {
          registerTool: mockRegisterTool
        }
      }
    };

    const success = initWebMCP();
    expect(success).toBe(true);
    expect(mockRegisterTool).toHaveBeenCalledTimes(3);
  });
});
