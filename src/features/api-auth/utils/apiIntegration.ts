import { appConfig } from '@/shared/config/app.config';

export function buildOpenApiCurlExample(
  apiBaseUrl = appConfig.apiBaseUrl,
  origin = getCurrentOrigin(),
): string {
  const normalizedBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  const usersUrl = new URL('open/users?page=1&pageSize=10', new URL(normalizedBaseUrl, origin));

  return `curl --request GET "${usersUrl.toString()}" --header "X-API-Key: sk_live_xxx"`;
}

function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3001';
}
