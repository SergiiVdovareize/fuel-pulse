import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fuel-ua.pages.dev',
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough'
  }),
  integrations: [sitemap()]
});
