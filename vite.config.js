import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            ignored: ['**/*.zip', '**/*.xlsx', '**/*.csv', '**/scripts/**'],
        },
    },
    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks: {
                    'three-core': ['three'],
                    'tensorflow-core': ['@tensorflow/tfjs', '@tensorflow-models/coco-ssd'],
                    'mediapipe-core': ['@mediapipe/tasks-vision'],
                    'tesseract-core': ['tesseract.js'],
                    'ui-vendor': ['lucide-react', 'i18next', 'react-i18next', 'react-router-dom'],
                },
            },
        },
    },
});
