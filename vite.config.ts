import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import {visualizer} from 'rollup-plugin-visualizer';
import type {Plugin} from 'vite';
import {headTags, robotsTxt, sitemapXml, llmsTxt} from './seo.config.ts';

// Injects SEO head tags and the pre-rendered landing page, and writes robots.txt, sitemap.xml and llms.txt.
function seo(): Plugin {
  let isBuild = false;
  return {
    name: 'pesus-seo',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    async transformIndexHtml(html, ctx) {
      let out = html.replace('<!--seo-head-->', headTags());
      // Preload the hero fonts so the first paint uses the real typeface
      const fonts = Object.keys(ctx.bundle ?? {}).filter((f) =>
        /familjen-grotesk-latin-(400|700)-normal-[^/]*\.woff2$/.test(f),
      );
      const preloads = fonts
        .map((f) => `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin />`)
        .join('\n    ');
      if (preloads) out = out.replace('</title>', `</title>\n    ${preloads}`);
      if (isBuild) {
        // Render the landing page to HTML so it shows instantly and is readable without JavaScript.
        const {createServer} = await import('vite');
        const server = await createServer({
          configFile: false,
          root: __dirname,
          logLevel: 'error',
          appType: 'custom',
          server: {middlewareMode: true, hmr: false},
          plugins: [react()],
          ssr: {noExternal: ['gsap']},
          resolve: {alias: {'virtual:pwa-register': path.resolve(__dirname, 'src/lib/pwa-register-ssr-stub.ts')}},
        });
        try {
          const mod = await server.ssrLoadModule('/src/entry-prerender.tsx');
          out = out.replace('<div id="root"></div>', `<div id="root">${mod.render()}</div>`);
        } finally {
          await server.close();
        }
      }
      return out;
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      seo(),
      ...(process.env.ANALYZE ? [visualizer({ filename: '/tmp/stats.json', template: 'raw-data' })] : []),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeAssets: ['icons/favicon-64.png', 'icons/apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Pesus — Expense Tracker',
          short_name: 'Pesus',
          description: 'Track where your pesos go. Log expenses, see daily, weekly and monthly totals, and stay under budget.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#e6ebef',
          theme_color: '#14213d',
          lang: 'en-PH',
          categories: ['finance', 'productivity'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
          globIgnores: ['**/*cyrillic*', '**/*vietnamese*', '**/*greek*'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://images.pexels.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'pexels-images',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
