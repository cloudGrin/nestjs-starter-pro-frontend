import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局设置文件
    setupFiles: ['./src/test/setup.ts'],

    // 全局变量
    globals: true,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'], // lcov 会生成 lcov-report/index.html
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/types',
        'dist/',
      ],
      // 覆盖率阈值（临时禁用，用于生成报告）
      // thresholds: {
      //   lines: 60,
      //   functions: 60,
      //   branches: 60,
      //   statements: 60,
      // },
    },

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
    ],

    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],

    // 测试超时时间（毫秒）
    testTimeout: 10000,

    // Hook 超时时间
    hookTimeout: 10000,

    // 隔离测试
    isolate: true,

    // 并发测试
    threads: true,

    // 监听模式排除
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
