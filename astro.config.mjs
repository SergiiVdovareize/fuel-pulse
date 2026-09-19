import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fuel.vdovareize.me',
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough'
  }),
  build: {
    inlineStylesheets: 'always'
  },
  integrations: [sitemap()]
});
