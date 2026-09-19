import { test } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test.describe('Visual Regression Tests - FuelPulse', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait until cards are loaded
    await page.goto('/');
    await page.waitForSelector('.calculator-card');
  });

  test('Повний знімок головної сторінки', async ({ page }) => {
    await argosScreenshot(page, 'homepage-full', {
      fullPage: true,
    });
  });

  test('Візуальний стан калькулятора повного бака', async ({ page }) => {
    const tankCalc = page.locator('.calculator-card').first();
    await argosScreenshot(page, 'tank-calculator-card', {
      element: tankCalc,
    });
  });

  test('Візуальний стан калькулятора поїздки', async ({ page }) => {
    const tripCalc = page.locator('.trip-card').first();
    await argosScreenshot(page, 'trip-calculator-card', {
      element: tripCalc,
    });
  });

  test('Візуальний стан графіка динаміки цін', async ({ page }) => {
    const chartCard = page.locator('.trend-chart-card').first();
    await argosScreenshot(page, 'trend-chart-card', {
      element: chartCard,
    });
  });
});
