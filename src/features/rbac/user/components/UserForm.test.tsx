import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';
import { createMockUser, renderWithProviders, userEvent } from '@/test/test-utils';

const hookMocks = vi.hoisted(() => ({
  createUser: { mutateAsync: vi.fn(), isPending: false },
  updateUser: { mutateAsync: vi.fn(), isPending: false },
  updateNotificationSettings: { mutateAsync: vi.fn(), isPending: false },
  notificationSettings: {
    data: {
      userId: 9,
      barkKey: 'old-bark-key',
      feishuUserId: 'ou_old',
    },
    isLoading: false,
    isError: false,
  },
}));

vi.mock('../hooks/useUsers', () => ({
  useCreateUser: () => hookMocks.createUser,
  useUpdateUser: () => hookMocks.updateUser,
  useUserNotificationSettings: () => hookMocks.notificationSettings,
  useUpdateUserNotificationSettings: () => hookMocks.updateNotificationSettings,
}));

describe('UserForm notification settings', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.notificationSettings.data = {
      userId: 9,
      barkKey: 'old-bark-key',
      feishuUserId: 'ou_old',
    };
    hookMocks.notificationSettings.isLoading = false;
    hookMocks.notificationSettings.isError = false;
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

  it('loads and saves admin managed user notification bindings in edit mode', async () => {
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const barkKeyInput = await screen.findByLabelText('Bark Key');
    const feishuUserIdInput = screen.getByLabelText('飞书 user_id');

    expect(barkKeyInput).toHaveValue('old-bark-key');
    expect(feishuUserIdInput).toHaveValue('ou_old');

    await userEvent.clear(barkKeyInput);
    await userEvent.type(barkKeyInput, 'new-bark-key');
    await userEvent.clear(feishuUserIdInput);
    await userEvent.type(feishuUserIdInput, 'ou_new');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(hookMocks.updateUser.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        data: expect.any(Object),
        silent: true,
      });
      expect(hookMocks.updateNotificationSettings.mutateAsync).toHaveBeenCalledWith({
        id: 9,
        silent: true,
        data: {
          barkKey: 'new-bark-key',
          feishuUserId: 'ou_new',
        },
      });
    });
  });

  it('blocks saving while notification bindings are still loading', async () => {
    hookMocks.notificationSettings.data = undefined;
    hookMocks.notificationSettings.isLoading = true;
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    renderWithProviders(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const okButton = screen.getByRole('button', { name: /OK/ });
    expect(okButton).toBeDisabled();

    await userEvent.click(okButton);

    expect(hookMocks.updateUser.mutateAsync).not.toHaveBeenCalled();
    expect(hookMocks.updateNotificationSettings.mutateAsync).not.toHaveBeenCalled();
  });

  it('does not reset edited user fields when notification bindings arrive later', async () => {
    hookMocks.notificationSettings.data = undefined;
    const user = createMockUser({ id: 9, username: 'task-user', email: 'task@example.com' });

    const { rerender } = renderWithProviders(
      <UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    const emailInput = screen.getByDisplayValue('task@example.com');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'changed@example.com');

    hookMocks.notificationSettings.data = {
      userId: 9,
      barkKey: 'loaded-bark-key',
      feishuUserId: 'ou_loaded',
    };
    rerender(<UserForm visible user={user} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(emailInput).toHaveValue('changed@example.com');
    expect(screen.getByLabelText('Bark Key')).toHaveValue('loaded-bark-key');
    expect(screen.getByLabelText('飞书 user_id')).toHaveValue('ou_loaded');
  });
});
