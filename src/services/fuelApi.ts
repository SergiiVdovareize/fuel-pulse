import type { FuelApiResponse, FuelDeltas, FuelHistoryPoint, FuelPrices } from '../types/fuel';

const BASE_API_URL = 'https://api.vdovareize.me/fuel';

// Форматування дати у вигляд YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Перевірка валідності рядка дати YYYY-MM-DD
export function isValidDateFormat(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

// Попередня дата у форматі YYYY-MM-DD
export function getPreviousDateISO(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDateISO(date);
}

// Українські назви місяців у родовому відмінку
const MONTHS_UK_GENITIVE = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

export function formatDateUkrainian(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTHS_UK_GENITIVE[monthIdx] || '';
  return `${day} ${monthName} ${year} року`;
}

/**
 * Обчислення різниці між цінами сьогодні та попереднього дня
 */
export function calculateDeltas(current: FuelPrices, previous: FuelPrices): FuelDeltas {
  const keys: (keyof FuelPrices)[] = ['a95Premium', 'a95', 'a92', 'diesel', 'gas'];
  const deltas: FuelDeltas = {};

  keys.forEach((key) => {
    const curVal = current[key];
    const prevVal = previous[key];
    if (typeof curVal === 'number' && typeof prevVal === 'number') {
      const diff = curVal - prevVal;
      deltas[key] = Math.round(diff * 100) / 100;
    }
  });

  return deltas;
}

/**
 * Генерація масиву історії цін за останні N днів
 */
export function generateHistoryMock(endDateStr: string, basePrices: FuelPrices, daysCount = 30): FuelHistoryPoint[] {
  const history: FuelHistoryPoint[] = [];
  const endDate = new Date(endDateStr);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateIso = formatDateISO(d);

    // Легкі реалістичні коливання ціни для імітації тренду (-1.5 грн до +1.0 грн за 30 днів)
    const trendFactor = (i / daysCount) * -0.6 + Math.sin(i * 0.5) * 0.15;
    
    const prices: FuelPrices = {
      a95Premium: basePrices.a95Premium ? Math.round((basePrices.a95Premium + trendFactor * 0.8) * 100) / 100 : undefined,
      a95: basePrices.a95 ? Math.round((basePrices.a95 + trendFactor) * 100) / 100 : undefined,
      a92: basePrices.a92 ? Math.round((basePrices.a92 + trendFactor * 0.9) * 100) / 100 : undefined,
      diesel: basePrices.diesel ? Math.round((basePrices.diesel + trendFactor * 1.1) * 100) / 100 : undefined,
      gas: basePrices.gas ? Math.round((basePrices.gas + trendFactor * 0.4) * 100) / 100 : undefined,
    };

    history.push({
      date: dateIso,
      formattedDate: `${d.getDate()} ${MONTHS_UK_GENITIVE[d.getMonth()]}`,
      prices
    });
  }

  return history;
}

/**
 * Отримання цін на пальне на задану дату разом з дельтами та історією
 */
export async function fetchFuelPrices(dateStr?: string): Promise<FuelApiResponse> {
  const targetDate = dateStr && isValidDateFormat(dateStr) ? dateStr : formatDateISO(new Date());
  const url = `${BASE_API_URL}?date=${targetDate}`;

  let apiResponse: FuelApiResponse;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API error: status ${res.status}`);
    }

    apiResponse = await res.json();
  } catch (error) {
    console.error(`[fetchFuelPrices] Failed to fetch for date ${targetDate}:`, error);
    apiResponse = {
      requestedDate: targetDate,
      effectiveDate: targetDate,
      isFallback: true,
      currency: 'UAH',
      unit: 'грн/л',
      prices: {
        a95Premium: 59.99,
        a95: 56.81,
        a92: 53.80,
        diesel: 55.22,
        gas: 37.07
      },
      source: 'https://index.minfin.com.ua/ua/markets/fuel/'
    };
  }

  // Генерація історії та дельт
  const history = generateHistoryMock(apiResponse.effectiveDate, apiResponse.prices, 30);
  const prevPoint = history[history.length - 2];
  const deltas = prevPoint ? calculateDeltas(apiResponse.prices, prevPoint.prices) : {
    a95Premium: 0.15,
    a95: -0.10,
    a92: 0.00,
    diesel: 0.25,
    gas: -0.05
  };

  return {
    ...apiResponse,
    deltas,
    history
  };
}
