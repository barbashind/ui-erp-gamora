import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
        },
    },
});

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 443,
//     proxy: {
//       '/api': {
//         target: 'https://ds-info-systems.online',
//         changeOrigin: true,
//         secure: false,
//       },
//     }
// }
// })
