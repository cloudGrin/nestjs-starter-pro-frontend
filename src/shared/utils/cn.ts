/**
 * 样式类名合并工具
 *
 * 用途：
 * 1. 合并多个类名
 * 2. 条件类名
 * 3. Tailwind CSS 冲突自动解决
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 覆盖 px-2)
 * cn('text-red-500', condition && 'text-blue-500') // 条件类名
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
