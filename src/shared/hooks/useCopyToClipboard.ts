/**
 * 复制到剪贴板 Hook
 *
 * 用途：
 * 1. API 密钥复制
 * 2. Token 复制
 * 3. 分享链接复制
 *
 * @example
 * const { copy, isCopied } = useCopyToClipboard();
 *
 * <Button onClick={() => copy(text)}>
 *   {isCopied ? '已复制' : '复制'}
 * </Button>
 */
import { useState } from 'react';
import { useApp } from './useApp';

export function useCopyToClipboard() {
  const { message } = useApp();
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string, successMessage: string = '复制成功') => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      message.success(successMessage);

      // 2秒后重置状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return true;
    } catch (error) {
      message.error('复制失败，请手动复制');
      return false;
    }
  };

  return { copy, isCopied };
}
