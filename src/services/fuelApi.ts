import type { FuelApiResponse } from '../types/fuel';

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
 * Отримання цін на пальне на задану дату
 */
export async function fetchFuelPrices(dateStr?: string): Promise<FuelApiResponse> {
  const targetDate = dateStr && isValidDateFormat(dateStr) ? dateStr : formatDateISO(new Date());
  const url = `${BASE_API_URL}?date=${targetDate}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API error: status ${res.status}`);
    }

    const data: FuelApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error(`[fetchFuelPrices] Failed to fetch for date ${targetDate}:`, error);
    // Fallback дані, щоб додаток не падав за відсутності мережі
    return {
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
}
