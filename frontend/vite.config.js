import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

let port = 5000;
try {
	port = parseInt(fs.readFileSync('dev_port.txt', 'utf-8'));
} catch (e) {
	console.warn('⚠️ Could not read dev_port.txt, defaulting to 5000');
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			'/api': `http://localhost:${port}/`,
		},
	},
});
