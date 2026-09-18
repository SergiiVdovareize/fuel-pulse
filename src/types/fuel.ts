export interface FuelPrices {
  a95Premium?: number;
  a95?: number;
  a92?: number;
  diesel?: number;
  gas?: number;
}

export interface FuelDeltas {
  a95Premium?: number;
  a95?: number;
  a92?: number;
  diesel?: number;
  gas?: number;
}

export interface FuelHistoryPoint {
  date: string;
  formattedDate: string;
  prices: FuelPrices;
}

export interface FuelApiResponse {
  requestedDate: string;
  effectiveDate: string;
  isFallback: boolean;
  currency: string;
  unit: string;
  prices: FuelPrices;
  deltas?: FuelDeltas;
  history?: FuelHistoryPoint[];
  source: string;
}

export type FuelKey = keyof FuelPrices;

export interface FuelMeta {
  key: FuelKey;
  label: string;
  shortName: string;
  badgeColor: string;
  accentColor: string;
  description: string;
}

export const FUEL_METAS: FuelMeta[] = [
  {
    key: 'a95Premium',
    label: 'Бензин А-95 Преміум',
    shortName: 'А-95+',
    badgeColor: '#f59e0b',
    accentColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Покращене пальне з миючими присадками (Pulls, Mustang тощо)'
  },
  {
    key: 'a95',
    label: 'Бензин А-95',
    shortName: 'А-95',
    badgeColor: '#10b981',
    accentColor: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Базовий неетилований бензин стандарту Євро-5'
  },
  {
    key: 'diesel',
    label: 'Дизельне пальне',
    shortName: 'ДП',
    badgeColor: '#06b6d4',
    accentColor: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    description: 'Стандартний дизель для легкових авто та спецтранспорту'
  },
  {
    key: 'gas',
    label: 'Автомобільний газ',
    shortName: 'Газ',
    badgeColor: '#a855f7',
    accentColor: 'linear-gradient(135deg, #a855f7, #9333ea)',
    description: 'Зріджений нафтовий газ (LPG / пропан-бутан)'
  },
  {
    key: 'a92',
    label: 'Бензин А-92',
    shortName: 'А-92',
    badgeColor: '#3b82f6',
    accentColor: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    description: 'Бензин для двигунів відповідної компресії'
  }
];
