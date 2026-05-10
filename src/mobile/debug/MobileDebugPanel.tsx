import { useEffect } from 'react';
import { syncMobileDebugFlagFromLocation } from './mobileDebug';

let vConsoleInstance: { destroy: () => void } | null = null;

export function MobileDebugPanel() {
  useEffect(() => {
    if (!syncMobileDebugFlagFromLocation()) return undefined;

    let disposed = false;

    void import('vconsole').then(({ default: VConsole }) => {
      if (disposed || vConsoleInstance) return;
      vConsoleInstance = new VConsole({ theme: 'dark' });
      console.info('[H5Debug] vConsole enabled');
    });

    return () => {
      disposed = true;
    };
  }, []);

  return null;
}
