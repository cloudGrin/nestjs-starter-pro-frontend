import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MOBILE_APP_UPDATE_DEFERRED_EVENT,
  requestMobileAppReload,
  setMobileAppReloadBlocked,
} from './appUpdate';

describe('mobile app update reload coordination', () => {
  beforeEach(() => {
    setMobileAppReloadBlocked(false);
  });

  it('reloads immediately when app reload is not blocked', () => {
    const reload = vi.fn();
    const listener = vi.fn();
    window.addEventListener(MOBILE_APP_UPDATE_DEFERRED_EVENT, listener);

    requestMobileAppReload(reload);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(MOBILE_APP_UPDATE_DEFERRED_EVENT, listener);
  });

  it('defers reload and exposes the reload callback when app reload is blocked', () => {
    const reload = vi.fn();
    const listener = vi.fn();
    window.addEventListener(MOBILE_APP_UPDATE_DEFERRED_EVENT, listener);

    setMobileAppReloadBlocked(true);
    requestMobileAppReload(reload);

    expect(reload).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent<{ reload: () => void }>;
    expect(event.detail.reload).toBe(reload);

    window.removeEventListener(MOBILE_APP_UPDATE_DEFERRED_EVENT, listener);
  });

  it('reloads immediately again after reload blocking is cleared', () => {
    const reload = vi.fn();

    setMobileAppReloadBlocked(true);
    setMobileAppReloadBlocked(false);
    requestMobileAppReload(reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
