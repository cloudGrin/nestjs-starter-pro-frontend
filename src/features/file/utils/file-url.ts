import { appConfig } from '@/shared/config/app.config';

const ensureTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

export const resolveFileAccessUrl = (url: string): string => {
  const apiBaseUrl = ensureTrailingSlash(
    new URL(appConfig.apiBaseUrl || '/api/v1', window.location.origin).toString()
  );

  return new URL(url, apiBaseUrl).toString();
};
