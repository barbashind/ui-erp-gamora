import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
    exclude: [] // если проблема, добавьте сюда проблемные пакеты
    },
    server: {
        // port: 80,
        proxy: {
            '/api/ufch': {
                target: 'http://10.100.60.90',
                changeOrigin: true,
                secure: false,
            },
            '/api/exchanger': {
                target: 'https://vsgm.graphql.mstroy.tech',
                changeOrigin: true,
                secure: false,
            },
            '/api/auth/': {
                target: 'https://facereg.avtoban.ru:4040',
                changeOrigin: true,
                secure: false,
            },
            '/api/qr_recognition': {
                target: 'https://facereg.avtoban.ru:4040',
                changeOrigin: true,
                secure: false,
            },
            '/oauth2/token': {
                target: 'https://ovision-rs-ebs.avtoban.ru',
                changeOrigin: true,
                secure: false,
            },
            '/api/v2': {
                target: 'https://ovision-rs-ebs.avtoban.ru',
                changeOrigin: true,
                secure: false,
            },
             '/api/v1': {
                target: 'https://10.229.0.3',
                changeOrigin: true,
                secure: false,
            },
            '//ui/v1/': {
                target: 'https://10.229.0.3',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});