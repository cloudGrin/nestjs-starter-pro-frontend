/**
 * 主题状态管理
 *
 * 用途：
 * 1. 管理深色/浅色主题切换
 * 2. 持久化主题设置到LocalStorage
 * 3. 提供主题切换方法
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 切换主题 */
  toggleTheme: () => void;
  /** 设置主题 */
  setTheme: (mode: ThemeMode) => void;
}

/**
 * 获取初始主题（关键：防止闪烁）
 *
 * 逻辑：
 * 1. 优先从LocalStorage读取用户的选择
 * 2. 如果没有存储，默认浅色
 *
 * 注意：必须在store创建前读取，否则会导致闪烁
 */
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  // 1. 尝试从LocalStorage读取（与index.html脚本保持一致）
  try {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.mode) {
        return state.mode;
      }
    }
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
  }

  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 初始值：与index.html脚本读取的值保持一致，防止闪烁
      mode: getInitialTheme(),

      toggleTheme: () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        // 同步到HTML class（防止某些情况下不同步）
        if (newMode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTheme: (mode) => {
        set({ mode });
        // 同步到HTML class
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage', // LocalStorage key
    }
  )
);
