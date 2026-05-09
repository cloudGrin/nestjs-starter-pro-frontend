import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileOfflineBanner } from './MobileOfflineBanner';

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('MobileOfflineBanner', () => {
  it('shows cached-data context while the device is offline', () => {
    setNavigatorOnline(true);
    render(<MobileOfflineBanner />);

    expect(screen.queryByText('离线中，显示最近缓存')).not.toBeInTheDocument();

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('离线中，显示最近缓存')).toBeInTheDocument();

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByText('离线中，显示最近缓存')).not.toBeInTheDocument();
  });
});
