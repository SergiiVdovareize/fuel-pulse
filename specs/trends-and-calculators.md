# Feature Spec: Fuel Price Trends, Deltas & Calculator Testing

## Overview
This feature introduces price delta indicators (day-over-day price comparison), an interactive 7/30-day fuel price trend chart, pure utility functions for fuel calculators, and automated unit test coverage using Vitest.

## Acceptance Criteria
1. **Price Deltas**:
   - Each fuel card displays the price change compared to the previous day (e.g., `+0.35 грн` in red badge, `-0.15 грн` in green badge, `0.00 грн` neutral).
   - If previous day data is unavailable, delta is omitted or shown as neutral.

2. **Trend Chart**:
   - Renders a clean SVG graph showing historical price movement for A-95, Diesel, and Gas.
   - User can toggle between 7-day and 30-day view without full page reload.
   - Responsive and styled with Glassmorphism aesthetic.

3. **Calculators & Testing**:
   - Pure math logic extracted into `src/utils/calculators.ts`.
   - `npm test` runs all Vitest unit tests for date formatting, API fallbacks, tank calculations, and trip calculations.
   - Touch targets on interactive sliders and buttons meet 48px minimum height.

4. **SSR & Performance**:
   - No heavy charting library added (pure SVG/HTML rendering for optimal Core Web Vitals).
