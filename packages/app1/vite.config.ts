import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import glsl from 'rollup-plugin-glsl';
import path from 'path';
import px2rem from 'postcss-px2rem';
// 配置基本大小
const postcss = px2rem({
	// 基准大小 baseSize，需要和rem.js中相同
	remUnit: 14,
});

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		eslintPlugin({
			include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue'],
		}),
		glsl({
			include: '**/*.glsl',
			exclude: ['**/index.html'],
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	css: {
		postcss: {
			plugins: [postcss],
		},
	},
});
