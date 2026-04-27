import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FileList } from './FileList';

vi.mock('antd', () => {
  const Select = ({ children }: { children?: ReactNode }) => <select>{children}</select>;
  Select.Option = ({ children, value }: { children?: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  );

  const Form = ({ children }: { children?: ReactNode }) => <form>{children}</form>;
  Form.Item = ({ children }: { children?: ReactNode }) => <label>{children}</label>;

  return {
    Card: ({ children }: { children?: ReactNode }) => <section className="ant-card">{children}</section>,
    Table: () => <div className="ant-table-wrapper" />,
    Button: ({ children }: { children?: ReactNode }) => <button type="button">{children}</button>,
    Space: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Input: () => <input />,
    Select,
    Tag: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Image: () => null,
    Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Upload: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Form,
    message: {
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

vi.mock('../hooks/useFiles', () => ({
  useFiles: () => ({
    data: {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useDeleteFile: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDownloadFile: () => ({
    mutate: vi.fn(),
  }),
  useUploadFile: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [],
}));

vi.mock('@/shared/components/search/SearchForm', () => ({
  SearchForm: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

describe('FileList', () => {
  it('wraps the file table in a card like the other list pages', () => {
    const { container } = render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    const card = container.querySelector('.ant-card');

    expect(card).toBeInTheDocument();
    expect(card?.querySelector('.ant-table-wrapper')).toBeInTheDocument();
  });
});
