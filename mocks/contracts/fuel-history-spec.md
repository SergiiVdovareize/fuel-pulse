# ⛽ Fuel Price History API (`/fuel/history`)

Ендпоінт для отримання історії середньозважених роздрібних цін на пальне в Україні за період **до 30 днів включно**.

Дані агрегуються та парсяться з ресурсу [Мінфін (Пальне)](https://index.minfin.com.ua/ua/markets/fuel/).

---

## 📡 Опис ендпоінта

* **HTTP Метод**: `GET`
* **Шлях**: `/fuel/history`
* **Базовий URL**:
  * Local: `http://localhost:3000`
  * Production: `https://api.vdovareize.me`

---

## 📥 Вхідні Query-параметри

| Параметр | Тип | Обов'язковий | За замовчуванням | Опис |
| :--- | :--- | :--- | :--- | :--- |
| `endDate` | `string` (`YYYY-MM-DD`) | Ні | Поточна дата (`Europe/Kyiv`) | Кінцева дата періоду. Не може бути в майбутньому. |
| `days` | `integer` (`1..30`) | Ні | `30` | Кількість днів історії. |
| `startDate` | `string` (`YYYY-MM-DD`) | Ні | `endDate - (days - 1)` | Початкова дата періоду (альтернатива `days`). |

> ⚠️ **Правила та обмеження валідації (HTTP 400 Bad Request)**:
> 1. `days`: має бути цілим числом у діапазоні від `1` до `30`.
> 2. `startDate`: не може бути пізніше за `endDate`.
> 3. **Інтервал**: різниця `endDate - startDate` не може перевищувати **30 днів**.
> 4. Дати мають бути у форматі `YYYY-MM-DD` та представляти валідний календарний день.
> 5. Дата не може бути в майбутньому або раніше за **червень 2015 року** (`2015-06-01`, початок архіву Мінфіну).

---

## 📤 Структура відповіді (Response Schema)

```typescript
interface FuelPrices {
  a95Premium?: number;   // А-95+ (грн/л)
  a95?: number;          // А-95 (грн/л)
  a92?: number;          // А-92 (грн/л)
  diesel?: number;       // Дизельне пальне (грн/л)
  dieselPremium?: number;// ДП+ (грн/л)
  gas?: number;          // Автогаз (грн/л)
}

interface FuelHistoryItem {
  date: string;          // Дата запису у форматі YYYY-MM-DD
  prices: FuelPrices;    // Ціни на відповідні види пального
}

interface FuelHistoryResponse {
  startDate: string;     // Початкова дата діапазону (YYYY-MM-DD)
  endDate: string;       // Кінцева дата діапазону (YYYY-MM-DD)
  days: number;          // Загальна тривалість періоду в календарних днях
  currency: string;      // Валюта (завжди "UAH")
  unit: string;          // Одиниця виміру (завжди "грн/л")
  items: FuelHistoryItem[]; // Масив щоденних цін, відсортований за зростанням дати
  source: string;        // Джерело даних (URL Мінфін)
}
```

---

## 💡 Приклади запитів

### 1. Отримати історію за замовчуванням (останні 30 днів до сьогодні)
```bash
curl -X GET "https://api.vdovareize.me/fuel/history"
```

### 2. Отримати історію за останні 7 днів
```bash
curl -X GET "https://api.vdovareize.me/fuel/history?days=7"
```

### 3. Отримати історію для конкретної кінцевої дати та кількості днів
```bash
curl -X GET "https://api.vdovareize.me/fuel/history?endDate=2026-09-18&days=14"
```

### 4. Вказати точний діапазон (`startDate` та `endDate`)
```bash
curl -X GET "https://api.vdovareize.me/fuel/history?startDate=2026-09-01&endDate=2026-09-15"
```
