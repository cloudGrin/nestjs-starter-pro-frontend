import { describe, expect, it, vi } from 'vitest';
import { ApiScopeSelector } from './ApiScopeSelector';
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
        endpoints: [],
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');

  return {
    ...actual,
    TreeSelect: ({
      value,
      onChange,
      placeholder,
    }: {
      value?: string[];
      onChange?: (value: string[]) => void;
      placeholder?: string;
    }) => (
      <button type="button" onClick={() => onChange?.(['read:users'])}>
        {placeholder} {(value ?? []).join(',')}
      </button>
    ),
  };
});

describe('ApiScopeSelector', () => {
  it('uses a tree selector and emits selected API scopes', async () => {
    const onChange = vi.fn();

    renderWithProviders(<ApiScopeSelector value={[]} onChange={onChange} />);
    screen.getByRole('button', { name: /选择开放 API 权限/ }).click();

    expect(onChange).toHaveBeenCalledWith(['read:users']);
  });
});
