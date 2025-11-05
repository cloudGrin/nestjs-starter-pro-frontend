/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // 启用基于 class 的深色模式（与 providers.tsx 中的 html.dark 配合）
  darkMode: 'class',
  // Tailwind 4 中禁用 preflight 以避免与 Ant Design 冲突
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // 使用CSS变量定义颜色，支持透明度修改（<alpha-value>）
      colors: {
        // 品牌色
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
          link: 'rgb(var(--brand-link) / <alpha-value>)',
        },
        // 背景色
        bg: {
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--bg-tertiary) / <alpha-value>)',
          quaternary: 'rgb(var(--bg-quaternary) / <alpha-value>)',
        },
        // 文字色
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
        },
        // 边框色
        border: {
          primary: 'rgb(var(--border-primary) / <alpha-value>)',
          secondary: 'rgb(var(--border-secondary) / <alpha-value>)',
        },
      },
      // 自定义阴影
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      // 自定义backdrop-filter
      backdropBlur: {
        theme: 'var(--backdrop-blur)',
      },
    },
  },
};
