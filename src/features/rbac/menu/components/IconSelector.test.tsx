import { describe, expect, it, vi } from 'vitest';
import { IconSelector } from './IconSelector';
import { renderWithProviders, screen, userEvent } from '@/test/test-utils';

describe('IconSelector', () => {
  it('uses a searchable dropdown with available icon names', async () => {
    const onChange = vi.fn();

    renderWithProviders(<IconSelector value={undefined} onChange={onChange} />);

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.type(combobox, 'UserOutlined');

    expect(await screen.findAllByText('UserOutlined')).not.toHaveLength(0);
  });
});
