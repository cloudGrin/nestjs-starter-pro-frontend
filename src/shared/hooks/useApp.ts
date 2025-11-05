/**
 * useApp Hook - 获取 Ant Design App 实例
 *
 * 用途：
 * - 替代 message.xxx 静态方法（支持动态主题）
 * - 替代 notification.xxx 静态方法
 * - 替代 Modal.xxx 静态方法
 *
 * 优点：
 * - 可以消费 App 上下文（主题、国际化等）
 * - 更好的 TypeScript 类型支持
 * - 符合 Ant Design 5 最佳实践
 *
 * @example
 * ```tsx
 * import { useApp } from '@/shared/hooks/useApp';
 *
 * function MyComponent() {
 *   const { message, modal, notification } = useApp();
 *
 *   const handleClick = () => {
 *     message.success('操作成功');
 *     modal.confirm({
 *       title: '确认操作',
 *       content: '确定要继续吗？',
 *       onOk: () => console.log('确认'),
 *     });
 *   };
 *
 *   return <Button onClick={handleClick}>点击</Button>;
 * }
 * ```
 */

import { App } from 'antd';

export function useApp() {
  return App.useApp();
}
