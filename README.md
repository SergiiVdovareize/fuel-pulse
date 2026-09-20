# FuelPulse ⛽️🇺🇦

> **Production URL**: [https://fuel.vdovareize.me/](https://fuel.vdovareize.me/)

[![Lighthouse Performance](https://img.shields.io/badge/Performance-95%2B-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1789911459331-60677.report.html)
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-100%2F100-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1789911459331-60677.report.html)
[![Lighthouse Best Practices](https://img.shields.io/badge/Best%20Practices-100%2F100-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1789911459331-60677.report.html)
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100%2F100-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1789911459331-60677.report.html)

**FuelPulse** is a modern, high-performance web service for daily monitoring of volume-weighted average fuel prices in Ukraine. Built with speed, flawless SEO, accessibility, and cutting-edge AI integration standards (WebMCP / LLM standards) at its core.

---

## Key Features

- **Daily Price Monitoring**: Real-time average prices for all fuel types (A-95+, A-95, A-92, Diesel, Autogas) powered by official Ministry of Finance of Ukraine data, including daily price delta calculations.
- **Historical Archive & Fast Date Selection**: Browse price quotes for any past date via custom route URLs `/[YYYY-MM-DD]` or quick presets (_Today, Yesterday, 7 days ago, 30 days ago, 1 year ago_).
- **Full Tank Calculator**: Dynamic tank filling cost calculation by volume (10–100 L) with vehicle type quick presets (_Hatchback 35L, Sedan 50L, Crossover 65L, SUV 80L_).
- **Trip Cost Calculator**: Calculates required fuel volume and total trip expense based on distance (km) and average consumption (L/100km).
- **Interactive SVG Trend Chart**: Visual historical price fluctuation charts for petrol, diesel, and gas with period toggling (_7 days / 30 days_).
- **Instant Messenger Sharing**: Formatted price summaries with one-click share buttons for Telegram, Viber, WhatsApp, Facebook, and X (Twitter).

---

## Technology Stack

- **Core Framework**: [Astro 5](https://astro.build) (Server-Side Rendering on Cloudflare Edge Network)
- **Deployment Adapter**: `@astrojs/cloudflare`
- **Language**: TypeScript (strict type checking)
- **Design & Styling**: Scoped Vanilla CSS (Design System Tokens, Dark Mode, Glassmorphism aesthetics)
- **Unit Testing**: Vitest
- **UI & Visual Testing**: Playwright, Argos CI
- **Performance Audit**: Google Lighthouse CI (`@lhci/cli`)
- **AI Agent Protocol**: WebMCP (`@mcp-b/webmcp-polyfill` + HTML Form Annotations)

---

## SEO & AI Readiness

- **Maximum Load Performance**: Render-blocking CSS elimination via inline critical stylesheet injection (`build.inlineStylesheets: 'always'`).
- **Preconnect Resource Hints**: Enabled `<link rel="preconnect" href="https://api.vdovareize.me" crossorigin />` resource hints for instant backend API connection.
- **Rich Schema.org Structured Data (JSON-LD Graph)**: Native support for `WebSite`, `Dataset`, and `FAQPage` entities for enhanced Google Rich Snippets.
- **Dynamic Meta Tags & OpenGraph**: Full Ukrainian localization with optimized social share previews for messaging apps.
- **Sitemap & Robots.txt**: Automated `sitemap-index.xml` generation and tailored `robots.txt`.
- **`llms.txt` Standard**: Dedicated standardized [`/llms.txt`](https://fuel.vdovareize.me/llms.txt) specification file (per llmstxt.org) for seamless LLM and AI agent indexing.
- **WebMCP Support (Model Context Protocol for Web Browsers)**:
  - Declarative HTML Form Annotations (`toolname`, `tooldescription`, `toolparamdescription`).
  - Imperative browser tool registration via `navigator.modelContext` (`get_fuel_prices`, `calculate_full_tank`, `calculate_trip_cost`).

---

## Quality Gate & Test Reports

Automated 6-stage Quality Pipeline CI runs on every commit:

### Google Lighthouse Audit Scores

FuelPulse undergoes automated Lighthouse audits on every CI build across both **Desktop** and **Mobile** viewports:

| Category           |    Score    | Audit Focus & Standards                                                                           |
| :----------------- | :---------: | :------------------------------------------------------------------------------------------------ |
| **Accessibility**  | `100 / 100` | Full WCAG 2.1 AA/AAA compliance, strict color contrast, ARIA labels & keyboard navigation         |
| **Best Practices** | `100 / 100` | Modern web security headers, HTTPS, clean console log policy, zero passive listeners warnings     |
| **SEO**            | `100 / 100` | Valid JSON-LD structured schema, semantic HTML5 structure, descriptive meta tags & alt attributes |
| **Performance**    | `95+ / 100` | Edge SSR on Cloudflare, zero render-blocking styles, preconnect API hints & optimized assets      |

#### Core Web Vitals Highlights

- **First Contentful Paint (FCP)**: `< 0.4s`
- **Largest Contentful Paint (LCP)**: `< 0.8s`
- **Total Blocking Time (TBT)**: `0 ms` (Perfect main-thread responsiveness)
- **Cumulative Layout Shift (CLS)**: `0` (Zero visual shift during loading)
- **Official Google Lighthouse Public Report**: [View Interactive Lighthouse Report](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1789911459331-60677.report.html)

### Visual Regression & E2E UI Tests (Argos CI)

Automated pixel-perfect visual testing covering 15 test scenarios across **Desktop Chrome**, **Mobile Chrome (Pixel 7)**, and **Mobile Safari (iPhone 14)** with deterministic clock freezing and network API response mocking:

- **Argos CI Visual Testing Dashboard**: [View Argos CI Report](https://app.argos-ci.com/s-vdovareize/fuel-pulse)
