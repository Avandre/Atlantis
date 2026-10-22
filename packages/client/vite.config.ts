import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const server = 'http://localhost:3000';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // доступ из локальной сети
    proxy: {
      '/api': server,
      '/socket.io': { target: server, ws: true },
    },
  },
});
