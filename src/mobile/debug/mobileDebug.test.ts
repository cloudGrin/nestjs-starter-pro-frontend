import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MOBILE_DEBUG_ENABLED_KEY,
  MOBILE_DEBUG_LOG_KEY,
  isMobileDebugEnabled,
  logMobileDebugEvent,
  readMobileDebugEntries,
  syncMobileDebugFlagFromLocation,
} from './mobileDebug';

describe('mobileDebug', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  it('enables and disables the H5 debug panel from query flags', () => {
    expect(syncMobileDebugFlagFromLocation('?debug=1')).toBe(true);
    expect(localStorage.getItem(MOBILE_DEBUG_ENABLED_KEY)).toBe('true');
    expect(isMobileDebugEnabled()).toBe(true);

    expect(syncMobileDebugFlagFromLocation('?debug=0')).toBe(false);
    expect(localStorage.getItem(MOBILE_DEBUG_ENABLED_KEY)).toBeNull();
    expect(isMobileDebugEnabled()).toBe(false);
  });

  it('persists sanitized events only when debug mode is enabled', () => {
    logMobileDebugEvent('family.comment.submit.start', {
      postId: 11,
      content: '不能写入正文',
      contentLength: 6,
    });
    expect(localStorage.getItem(MOBILE_DEBUG_LOG_KEY)).toBeNull();

    syncMobileDebugFlagFromLocation('?debug=1');
    logMobileDebugEvent('family.comment.submit.start', {
      postId: 11,
      content: '不能写入正文',
      contentLength: 6,
    });

    const entries = readMobileDebugEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({
        event: 'family.comment.submit.start',
        detail: { postId: 11, contentLength: 6 },
      })
    );
    expect(localStorage.getItem(MOBILE_DEBUG_LOG_KEY)).not.toContain('不能写入正文');
    expect(console.debug).toHaveBeenCalledWith('[H5Debug]', 'family.comment.submit.start', {
      postId: 11,
      contentLength: 6,
    });
  });
});
