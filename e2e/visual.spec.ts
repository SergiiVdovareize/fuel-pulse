import { test, expect } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

// Зафіксований мок даних для 100% стабільності скріншотів
const MOCK_FIXED_DATE = '2026-09-19';

const MOCK_PRICES_RESPONSE = {
  requestedDate: MOCK_FIXED_DATE,
  effectiveDate: MOCK_FIXED_DATE,
  currency: 'UAH',
  unit: 'грн/л',
  prices: {
    a95Premium: 61.50,
    a95: 58.20,
    a92: 55.10,
    diesel: 58.00,
    gas: 33.40
  },
  delta: {
    a95Premium: 0.10,
    a95: 0.05,
    a92: 0.00,
    diesel: -0.20,
    gas: 0.15
  },
  source: 'https://index.minfin.com.ua/ua/markets/fuel/'
};

const MOCK_HISTORY_RESPONSE = {
  startDate: '2026-08-20',
  endDate: MOCK_FIXED_DATE,
  days: 30,
  currency: 'UAH',
  unit: 'грн/л',
  items: [
    { date: '2026-09-13', prices: { a95Premium: 61.40, a95: 58.10, a92: 55.00, diesel: 58.10, gas: 33.20 } },
    { date: '2026-09-14', prices: { a95Premium: 61.40, a95: 58.15, a92: 55.00, diesel: 58.10, gas: 33.25 } },
    { date: '2026-09-15', prices: { a95Premium: 61.45, a95: 58.15, a92: 55.10, diesel: 58.05, gas: 33.30 } },
    { date: '2026-09-16', prices: { a95Premium: 61.45, a95: 58.20, a92: 55.10, diesel: 58.05, gas: 33.35 } },
    { date: '2026-09-17', prices: { a95Premium: 61.50, a95: 58.20, a92: 55.10, diesel: 58.00, gas: 33.35 } },
    { date: '2026-09-18', prices: { a95Premium: 61.50, a95: 58.20, a92: 55.10, diesel: 58.00, gas: 33.40 } },
    { date: '2026-09-19', prices: { a95Premium: 61.50, a95: 58.20, a92: 55.10, diesel: 58.00, gas: 33.40 } }
  ],
  source: 'https://index.minfin.com.ua/ua/markets/fuel/'
};

test.describe('Visual Regression Tests - Fixed Mocked Environment', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Мокуємо всі мережеві запити API до зафіксованих даних
    await page.route('**/fuel/history*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_HISTORY_RESPONSE)
      });
    });

    await page.route('**/fuel*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRICES_RESPONSE)
      });
    });

    // 2. Заморожуємо системний годинник браузера на конкретну дату
    await page.clock.setFixedTime(new Date(`${MOCK_FIXED_DATE}T12:00:00Z`));

    // 3. Відкриваємо сайт на зафіксованій даті
    await page.goto(`/${MOCK_FIXED_DATE}`);
    await page.waitForSelector('.calculator-card');
  });

  test('Повний початковий знімок головної сторінки з мокованими цінами', async ({ page }) => {
    await argosScreenshot(page, 'homepage-full', {
      fullPage: true,
    });
  });

  test('Калькулятор повного бака (пресет 65 л)', async ({ page }) => {
    const tankCard = page.locator('.calculator-card').first();
    const litersDisplay = page.locator('#liters-value');

    // Клік на пресет "65 л (Кросовер)"
    const preset65Btn = page.locator('button.tank-preset[data-liters="65"]');
    await preset65Btn.click();

    // Перевірка результату у DOM
    await expect(litersDisplay).toHaveText('65');

    // Скріншот оновленого стану
    await argosScreenshot(page, 'tank-calculator-65l', {
      element: tankCard,
    });
  });

  test('Калькулятор поїздки (350 км, 8.5 л/100км)', async ({ page }) => {
    const tripCard = page.locator('.trip-card').first();
    const distanceInput = page.locator('#distance-input');
    const consumptionInput = page.locator('#consumption-input');
    const tripTotalSum = page.locator('#trip-total-sum');

    // Введення параметрів маршруту
    await distanceInput.fill('350');
    await consumptionInput.fill('8.5');

    // Перевірка підсумкової вартості
    await expect(tripTotalSum).not.toHaveText('0');
    await expect(tripTotalSum).toBeVisible();

    // Скріншот розрахованого стану
    await argosScreenshot(page, 'trip-calculator-custom-route', {
      element: tripCard,
    });
  });

  test('Графік динаміки цін (перемикання на 30 днів)', async ({ page }) => {
    const chartCard = page.locator('.trend-chart-card').first();
    const btn30d = page.locator('#btn-30d');
    const svg30d = page.locator('#svg-30d');

    // Натискаємо на кнопку "30 днів"
    await btn30d.click();

    // Перевірка стану перемикача та графіка
    await expect(btn30d).toHaveClass(/active/);
    await expect(svg30d).not.toHaveClass(/hidden/);

    // Скріншот графіка 30 днів
    await argosScreenshot(page, 'trend-chart-30d', {
      element: chartCard,
    });
  });

  test('Швидкий вибір дати (пресет 7 днів тому)', async ({ page }) => {
    const preset7Days = page.locator('a.preset-btn', { hasText: '7 днів тому' });
    await preset7Days.click();

    await page.waitForSelector('.hero-control-card');
    await expect(page).toHaveURL(/\/\d{4}-\d{2}-\d{2}$/);

    await argosScreenshot(page, 'homepage-historical-date-preset', {
      fullPage: true,
    });
  });
});
