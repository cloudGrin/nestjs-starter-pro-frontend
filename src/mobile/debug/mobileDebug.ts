export const MOBILE_DEBUG_ENABLED_KEY = 'home:h5-debug:enabled';
export const MOBILE_DEBUG_LOG_KEY = 'home:h5-debug:events';
export const MOBILE_DEBUG_EVENT = 'home:h5-debug:event';

const MAX_DEBUG_ENTRIES = 80;
const SENSITIVE_DETAIL_KEYS = new Set(['content', 'comment', 'text', 'body', 'password', 'token']);

type DebugDetailValue = string | number | boolean | null;

export interface MobileDebugEntry {
  id: string;
  time: string;
  event: string;
  detail?: Record<string, DebugDetailValue>;
}

function getStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isEnabledValue(value: string | null) {
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function isDisabledValue(value: string | null) {
  return value === '0' || value === 'false' || value === 'no' || value === 'off';
}

export function isMobileDebugEnabled(storage = getStorage()) {
  return storage?.getItem(MOBILE_DEBUG_ENABLED_KEY) === 'true';
}

export function syncMobileDebugFlagFromLocation(
  locationSearch = typeof window === 'undefined' ? '' : window.location.search,
  storage = getStorage()
) {
  if (!storage) return false;

  const searchParams = new URLSearchParams(locationSearch);
  const flag = searchParams.get('debug') ?? searchParams.get('h5debug');

  if (isEnabledValue(flag)) {
    storage.setItem(MOBILE_DEBUG_ENABLED_KEY, 'true');
    return true;
  }

  if (isDisabledValue(flag)) {
    storage.removeItem(MOBILE_DEBUG_ENABLED_KEY);
    storage.removeItem(MOBILE_DEBUG_LOG_KEY);
    return false;
  }

  return isMobileDebugEnabled(storage);
}

export function readMobileDebugEntries(storage = getStorage()): MobileDebugEntry[] {
  const rawEntries = storage?.getItem(MOBILE_DEBUG_LOG_KEY);
  if (!rawEntries) return [];

  try {
    const parsed = JSON.parse(rawEntries);
    return Array.isArray(parsed) ? (parsed as MobileDebugEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearMobileDebugEntries(storage = getStorage()) {
  storage?.removeItem(MOBILE_DEBUG_LOG_KEY);
}

function sanitizeDebugDetail(detail?: Record<string, unknown>) {
  if (!detail) return undefined;

  return Object.entries(detail).reduce<Record<string, DebugDetailValue>>(
    (safeDetail, [key, value]) => {
      if (SENSITIVE_DETAIL_KEYS.has(key)) return safeDetail;
      if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        safeDetail[key] = value;
        return safeDetail;
      }
      if (value instanceof Error) {
        safeDetail[key] = value.message;
      }
      return safeDetail;
    },
    {}
  );
}

export function logMobileDebugEvent(event: string, detail?: Record<string, unknown>) {
  const storage = getStorage();
  if (!isMobileDebugEnabled(storage)) return;

  const safeDetail = sanitizeDebugDetail(detail);
  const entry: MobileDebugEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toISOString(),
    event,
    ...(safeDetail && Object.keys(safeDetail).length ? { detail: safeDetail } : {}),
  };
  const entries = [entry, ...readMobileDebugEntries(storage)].slice(0, MAX_DEBUG_ENTRIES);

  storage?.setItem(MOBILE_DEBUG_LOG_KEY, JSON.stringify(entries));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<MobileDebugEntry>(MOBILE_DEBUG_EVENT, { detail: entry }));
  }
  console.debug('[H5Debug]', event, safeDetail ?? {});
}
