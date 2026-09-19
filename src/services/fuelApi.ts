import type {
  FuelApiResponse,
  FuelDeltas,
  FuelHistoryItem,
  FuelHistoryPoint,
  FuelHistoryResponse,
  FuelPrices
} from '../types/fuel';

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
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня'
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
 * Резервне обчислення різниці (якщо API повернув ціни без поля delta)
 */
export function calculateDeltas(current: FuelPrices, previous: FuelPrices): FuelDeltas {
  const keys: (keyof FuelPrices)[] = ['a95Premium', 'a95', 'a92', 'diesel', 'dieselPremium', 'gas'];
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
 * Отримання історії цін з API (`GET /fuel/history?endDate=...&days=30`)
 * Максимум 30 днів за вимогою бекенд-контракту.
 */
export async function fetchFuelHistory(
  endDateStr?: string,
  days = 30
): Promise<FuelHistoryResponse> {
  const targetEndDate =
    endDateStr && isValidDateFormat(endDateStr) ? endDateStr : formatDateISO(new Date());
  const validDays = Math.min(Math.max(1, days), 30); // Обмеження 1..30 днів

  const url = `${BASE_API_URL}/history?endDate=${targetEndDate}&days=${validDays}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API error: status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`[fetchFuelHistory] Failed to fetch history for ${targetEndDate}:`, error);
    return {
      startDate: targetEndDate,
      endDate: targetEndDate,
      days: validDays,
      currency: 'UAH',
      unit: 'грн/л',
      items: [],
      source: 'https://index.minfin.com.ua/ua/markets/fuel/'
    };
  }
}

/**
 * Отримання сирих даних від API на одну конкретну дату
 */
async function fetchSingleDatePrices(targetDate: string): Promise<FuelApiResponse> {
  const url = `${BASE_API_URL}?date=${targetDate}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API error: status ${res.status}`);
    }

    const data = await res.json();
    // Нормалізація date / requestedDate / effectiveDate з відповіді API
    const effectiveDate = data.date || data.effectiveDate || targetDate;

    return {
      ...data,
      requestedDate: targetDate,
      effectiveDate
    };
  } catch (error) {
    console.error(`[fetchSingleDatePrices] Failed to fetch for date ${targetDate}:`, error);
    return {
      requestedDate: targetDate,
      effectiveDate: targetDate,
      hasError: true,
      currency: 'UAH',
      unit: 'грн/л',
      prices: {},
      source: 'https://index.minfin.com.ua/ua/markets/fuel/'
    };
  }
}

/**
 * Форматування FuelHistoryItem[] у FuelHistoryPoint[] для компонента графіків
 */
export function formatHistoryItemsToPoints(items: FuelHistoryItem[]): FuelHistoryPoint[] {
  return items.map((item) => {
    const parts = item.date.split('-');
    let formattedDate = item.date;
    if (parts.length === 3) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      formattedDate = `${day} ${MONTHS_UK_GENITIVE[monthIdx] || ''}`;
    }

    return {
      date: item.date,
      formattedDate,
      prices: item.prices
    };
  });
}

/**
 * Отримання цін на пальне на задану дату з РЕАЛЬНОЮ дельтою з API
 */
export async function fetchFuelPrices(dateStr?: string): Promise<FuelApiResponse> {
  const targetDate = dateStr && isValidDateFormat(dateStr) ? dateStr : formatDateISO(new Date());

  // 1. Отримуємо дані з API за вказану дату
  const currentData = await fetchSingleDatePrices(targetDate);

  const hasCurrentPrices = Object.values(currentData.prices).some(
    (v) => typeof v === 'number' && v > 0
  );

  if (currentData.hasError || !hasCurrentPrices) {
    return {
      ...currentData,
      delta: {},
      deltas: {},
      history: []
    };
  }

  // 2. ПРЯМЕ використання дельти від API (з поля delta або deltas)
  let deltas: FuelDeltas = currentData.delta || currentData.deltas || {};

  // 3. Отримуємо історію для побудови графіка
  const historyResponse = await fetchFuelHistory(currentData.effectiveDate, 30);
  let historyPoints: FuelHistoryPoint[] = [];

  if (historyResponse.items && historyResponse.items.length > 0) {
    historyPoints = formatHistoryItemsToPoints(historyResponse.items);

    // Якщо в окремому запиті дельта була відсутня, витягуємо її з останнього елемента історії
    if (Object.keys(deltas).length === 0) {
      const lastItem = historyResponse.items[historyResponse.items.length - 1];
      if (lastItem.delta) {
        deltas = lastItem.delta;
      } else if (historyResponse.items.length >= 2) {
        const prevItem = historyResponse.items[historyResponse.items.length - 2];
        deltas = calculateDeltas(lastItem.prices, prevItem.prices);
      }
    }
  }

  return {
    ...currentData,
    delta: deltas,
    deltas,
    history: historyPoints
  };
}
