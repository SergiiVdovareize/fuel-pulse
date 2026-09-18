# Project State (Single Source of Truth)

## 📌 Поточний статус
* **Фаза**: Стек успішно налаштовано та протестовано (Astro 5 + Cloudflare Pages SSR + TypeScript + Scoped CSS).
* **Активна задача**: Базовий функціонал працює локально (`http://localhost:4321/`), перевірено рендеринг будь-яких дат та інтерактивні калькулятори.
* **Блокери**: Немає.
* **HITL статус**: Не вимагається.

## 🛠 Стек та Архітектура
* **Фреймворк**: **Astro 5** (Zero-JS за замовчуванням, найкраще SEO та 100/100 Core Web Vitals).
* **Хостинг**: **Cloudflare Pages** (Edge SSR / Hybrid rendering, безкоштовний безлімітний трафік, CDN у Києві).
* **Мова**: **TypeScript**.
* **Стилі**: Modern Vanilla CSS / Design Tokens (або Tailwind CSS за узгодженням).
* **Джерело даних**: `https://api.vdovareize.me/fuel?date=YYYY-MM-DD`.
