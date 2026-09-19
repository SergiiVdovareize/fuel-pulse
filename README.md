# FuelPulse (Ціни на пальне в Україні) ⛽️🇺🇦

Сучасний, швидкий веб-застосунок для щоденного моніторингу середніх цін на пальне в Україні на базі API Міністерства фінансів (`https://api.vdovareize.me/fuel?date=YYYY-MM-DD`).

## 🚀 Особливості

- **Потужне SEO (100/100 Core Web Vitals)**: чистий серверний HTML без важкого клієнтського JS-рантайму.
- **Підтримка довільних дат (`/[date]`)**: можливість перегляду цін на будь-яку дату з архіву через URL або інтерактивний календар.
- **Microdata & Schema.org**: JSON-LD розмітка для сніпетів Google та OpenGraph для месенджерів.
- **Калькулятор повного бака**: інтерактивний слайдер та пресети під різні типи авто (хетчбек, седан, кросовер, позашляховик).
- **Калькулятор витрат на поїздку**: підрахунок вартості маршруту за актуальними цінами пального.
- **Швидкий шеринг**: копіювання форматованого тексту цін для Telegram/Viber в один клік.

## 🛠 Технологічний стек

- **Фреймворк**: [Astro 5](https://astro.build) (SSR на Cloudflare Edge)
- **Хостинг-адаптер**: `@astrojs/cloudflare`
- **Мова**: TypeScript
- **Стилі**: Scoped Vanilla CSS (Design Tokens, Glassmorphism, Dark Mode)
- **SEO**: `@astrojs/sitemap`, OpenGraph, Schema.org

## 💻 Локальний запуск

```bash
# Встановлення залежностей
npm install

# Запуск локального сервера розробки
npm run dev

# Збірка для продакшну (Cloudflare Pages)
npm run build
```

## ☁️ Деплой на Cloudflare Pages

1. Підключіть цей репозиторій у [Cloudflare Dashboard](https://dash.cloudflare.com) $\to$ **Workers & Pages** $\to$ **Create application** $\to$ **Pages**.
2. Вкажіть налаштування збірки:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Натисніть **Save and Deploy**.
