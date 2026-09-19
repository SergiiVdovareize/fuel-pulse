import '@mcp-b/webmcp-polyfill';
import { calculateTankCost, calculateTripCost } from './calculators';
import { fetchFuelPrices } from '../services/fuelApi';
import type { FuelPrices } from '../types/fuel';

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (params: any) => Promise<any> | any;
}

declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: WebMCPTool) => void;
    };
  }
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMCPTool) => void;
    };
  }
}

const FUEL_KEY_MAP: Record<string, keyof FuelPrices> = {
  a95p: 'a95Premium',
  a95: 'a95',
  a92: 'a92',
  dp: 'diesel',
  gas: 'gas'
};

/**
 * Отримує ціну за літр для обраного типу пального
 */
async function getPriceForType(
  fuelType?: string,
  customPrice?: number
): Promise<{ price: number; type: string }> {
  if (typeof customPrice === 'number' && customPrice > 0) {
    return { price: customPrice, type: fuelType || 'custom' };
  }

  const selectedType = fuelType && FUEL_KEY_MAP[fuelType] ? fuelType : 'a95';
  const apiRes = await fetchFuelPrices();
  const priceKey = FUEL_KEY_MAP[selectedType];
  const price = apiRes.prices[priceKey] || 0;

  return { price, type: selectedType };
}

export const webMcpTools: WebMCPTool[] = [
  {
    name: 'get_fuel_prices',
    description:
      'Отримати поточні або історичні середні ціни на пальне в Україні (А-95+, А-95, А-92, Дизель, Автогаз) за вказану дату.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description:
            'Дата у форматі YYYY-MM-DD (наприклад, 2026-09-19). Якщо не вказано — повертає останні актуальні ціни.'
        }
      }
    },
    handler: async (params?: { date?: string }) => {
      const data = await fetchFuelPrices(params?.date);
      return {
        date: data.effectiveDate,
        currency: data.currency,
        unit: data.unit,
        prices: {
          'A-95+': data.prices.a95Premium ?? null,
          'A-95': data.prices.a95 ?? null,
          'A-92': data.prices.a92 ?? null,
          'Дизельне пальне': data.prices.diesel ?? null,
          Автогаз: data.prices.gas ?? null
        },
        deltas: data.delta || {}
      };
    }
  },
  {
    name: 'calculate_full_tank',
    description:
      "Розрахувати загальну вартість заправки повного бака за об'ємом (літри) та типом пального або власною ціною за літр.",
    inputSchema: {
      type: 'object',
      properties: {
        tankVolumeLiters: {
          type: 'number',
          description: "Об'єм паливного бака в літрах (наприклад, 50)"
        },
        fuelType: {
          type: 'string',
          enum: ['a95p', 'a95', 'a92', 'dp', 'gas'],
          description:
            'Тип пального: a95p (А-95+), a95 (А-95), a92 (А-92), dp (Дизель), gas (Автогаз). За замовчуванням a95.'
        },
        pricePerLiter: {
          type: 'number',
          description:
            "Власна ціна за літр у гривнях (необов'язково, за замовчуванням використовується актуальна ринкова ціна)."
        }
      },
      required: ['tankVolumeLiters']
    },
    handler: async (params: {
      tankVolumeLiters: number;
      fuelType?: string;
      pricePerLiter?: number;
    }) => {
      const liters = Number(params.tankVolumeLiters) || 0;
      const { price, type } = await getPriceForType(params.fuelType, params.pricePerLiter);
      const totalCost = calculateTankCost(liters, price);

      return {
        fuelType: type,
        tankVolumeLiters: liters,
        pricePerLiter: price,
        totalCost,
        currency: 'UAH'
      };
    }
  },
  {
    name: 'calculate_trip_cost',
    description:
      "Розрахувати необхідний об'єм пального та підсумкову вартість поїздки за відстанню (км) і середньою витратою (л/100км).",
    inputSchema: {
      type: 'object',
      properties: {
        distanceKm: {
          type: 'number',
          description: 'Відстань запланованого маршруту в кілометрах (наприклад, 350)'
        },
        consumptionPer100km: {
          type: 'number',
          description: 'Середня витрата пального автомобілем на 100 км (наприклад, 7.5)'
        },
        fuelType: {
          type: 'string',
          enum: ['a95p', 'a95', 'a92', 'dp', 'gas'],
          description: 'Тип пального (наприклад, a95)'
        },
        pricePerLiter: {
          type: 'number',
          description: "Власна ціна за літр (необов'язково)"
        }
      },
      required: ['distanceKm', 'consumptionPer100km']
    },
    handler: async (params: {
      distanceKm: number;
      consumptionPer100km: number;
      fuelType?: string;
      pricePerLiter?: number;
    }) => {
      const distance = Number(params.distanceKm) || 0;
      const consumption = Number(params.consumptionPer100km) || 0;
      const { price, type } = await getPriceForType(params.fuelType, params.pricePerLiter);
      const result = calculateTripCost(distance, consumption, price);

      return {
        fuelType: type,
        distanceKm: distance,
        consumptionPer100km: consumption,
        pricePerLiter: price,
        fuelNeededLiters: result.fuelNeededLiters,
        costPerKm: result.costPerKm,
        totalCost: result.totalCost,
        currency: 'UAH'
      };
    }
  }
];

/**
 * Ініціалізація та реєстрація WebMCP інструментів у браузерному середовищі
 */
export function initWebMCP(): boolean {
  if (typeof window === 'undefined') return false;

  const modelContext = window.navigator?.modelContext || window.document?.modelContext;

  if (modelContext && typeof modelContext.registerTool === 'function') {
    webMcpTools.forEach((tool) => {
      try {
        modelContext.registerTool(tool);
      } catch (err) {
        console.warn(`[WebMCP] Failed to register tool ${tool.name}:`, err);
      }
    });
    console.info('🚀 [WebMCP] Successfully registered 3 tools for AI Agents');
    return true;
  } else {
    console.info('[WebMCP] modelContext API is not available on window.navigator/document');
    return false;
  }
}
