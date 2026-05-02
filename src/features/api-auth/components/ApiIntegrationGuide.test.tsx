import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiIntegrationGuide } from './ApiIntegrationGuide';
import { buildOpenApiCurlExample } from '../utils/apiIntegration';
import { renderWithProviders, screen } from '@/test/test-utils';

vi.mock('../hooks/useApiApps', () => ({
  useApiScopes: () => ({
    data: [
      {
        key: 'open-user',
        title: '用户公开资料',
        scopes: [
          {
            code: 'read:users',
            label: '读取用户公开资料',
            description: '获取用户公开资料列表',
          },
        ],
        endpoints: [
          {
            scope: 'read:users',
            method: 'GET',
            path: '/api/v1/open/users',
            summary: '获取用户公开资料列表',
            description: '获取用户公开资料列表',
          },
        ],
      },
      {
        key: 'legacy',
        title: '旧版缓存数据',
        scopes: [],
      },
    ],
    isLoading: false,
  }),
}));

describe('ApiIntegrationGuide', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('documents API key header and available open API scope', () => {
    renderWithProviders(<ApiIntegrationGuide />);

    expect(screen.getByText('X-API-Key')).toBeInTheDocument();
    expect(screen.getByText('read:users')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/open/users')).toBeInTheDocument();
    const curlBlock = screen.getByText(/curl --request GET/);
    expect(curlBlock).toHaveTextContent(buildOpenApiCurlExample('/api/v1', window.location.origin));
    expect(curlBlock).toHaveClass('!bg-gray-200');
    expect(curlBlock).toHaveClass('!text-gray-900');
  });

  it('builds curl examples from the active frontend origin when API base URL is relative', () => {
    expect(buildOpenApiCurlExample('/api/v1', 'http://localhost:3001')).toBe(
      'curl --request GET "http://localhost:3001/api/v1/open/users?page=1&pageSize=10" --header "X-API-Key: sk_live_xxx"'
    );
  });

  it('keeps absolute API base URLs when configured without the dev proxy', () => {
    expect(buildOpenApiCurlExample('http://localhost:3000/api/v1', 'http://localhost:3001')).toBe(
      'curl --request GET "http://localhost:3000/api/v1/open/users?page=1&pageSize=10" --header "X-API-Key: sk_live_xxx"'
    );
  });
});
