import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { PermissionForm } from './PermissionForm';
import { renderWithProviders, userEvent } from '@/test/test-utils';

describe('PermissionForm', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: () => '',
        }) as CSSStyleDeclaration
    );
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  it('accepts hyphenated api permission code and module values', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <PermissionForm
        open
        mode="create"
        loading={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText('权限代码'), 'api-app:key:create');
    await userEvent.type(screen.getByLabelText('权限名称'), '创建 API 密钥');
    await userEvent.type(screen.getByLabelText('所属模块'), 'api-auth');

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'api-app:key:create',
        name: '创建 API 密钥',
        module: 'api-auth',
      })
    );
  });
});
