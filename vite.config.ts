import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FormMyActions',
      formats: ['es', 'umd'],
      fileName: (format) => `formmy-actions.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@xyflow/react',
        'react-hot-toast',
        'react-icons',
        'openai',
        'ai',
        '@ai-sdk/openai'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@xyflow/react': 'ReactFlow',
          'react-hot-toast': 'toast',
          'openai': 'OpenAI'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
