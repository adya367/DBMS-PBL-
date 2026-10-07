import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createSqlSyncPlugin } from './vite-plugin-sql-sync.js';

export default defineConfig({
  plugins: [react(), createSqlSyncPlugin()],
  server: {
    port: 5173,
    open: false
  }
});

