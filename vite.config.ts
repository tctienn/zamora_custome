import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { ConfigEnv, defineConfig, loadEnv } from 'vite';

export default defineConfig((env: ConfigEnv) => {
  process.env = {
    ...process.env,
    ...loadEnv(env.mode, process.cwd())
  };
  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
      }
    },
    server: { port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000 },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      }
    }
  };
});

