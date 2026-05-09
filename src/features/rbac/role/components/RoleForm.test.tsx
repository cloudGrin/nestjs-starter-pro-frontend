import { App } from 'antd';
import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { RoleForm } from './RoleForm';
import type { Role } from '../types/role.types';

const role: Role = {
  id: 3,
  code: 'family_admin',
  name: '家庭管理员',
  description: '管理家庭信息',
  isSystem: false,
  isActive: true,
  sort: 20,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

describe('RoleForm', () => {
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

  it('submits sort when creating a role', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <App>
        <RoleForm open mode="create" loading={false} onSubmit={onSubmit} onCancel={vi.fn()} />
      </App>
    );

    await userEvent.type(screen.getByLabelText('角色代码'), 'family_admin');
    await userEvent.type(screen.getByLabelText('角色名称'), '家庭管理员');
    await userEvent.clear(screen.getByRole('spinbutton', { name: '排序' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: '排序' }), '30');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'family_admin',
          name: '家庭管理员',
          sort: 30,
        })
      );
    });
  });

  it('loads and submits sort when editing a role', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <App>
        <RoleForm
          open
          mode="edit"
          role={role}
          loading={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      </App>
    );

    expect(screen.getByRole('spinbutton', { name: '排序' })).toHaveValue('20');

    await userEvent.clear(screen.getByRole('spinbutton', { name: '排序' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: '排序' }), '10');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ sort: 10 }));
    });
  });
});
