import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FileList } from './FileList';

const hookMocks = vi.hoisted(() => ({
  previewFile: vi.fn(),
  createAccessLink: vi.fn(),
  storageOptionsResult: {
    data: {
      defaultStorage: 'local',
      options: [
        { value: 'local', label: '本地存储' },
        { value: 'oss', label: '阿里云 OSS' },
      ],
    } as
      | undefined
      | {
          defaultStorage: string;
          options: Array<{ value: string; label: string }>;
        },
  },
}));

vi.mock('@/shared/config/app.config', () => ({
  appConfig: {
    apiBaseUrl: 'http://api.example.com/api/v1',
  },
}));

vi.mock('antd', () => {
  const Select = ({
    children,
    mode,
    placeholder,
    'data-testid': dataTestId,
  }: {
    children?: ReactNode;
    mode?: string;
    placeholder?: string;
    'data-testid'?: string;
    [key: string]: unknown;
  }) => (
    <select data-testid={dataTestId} data-mode={mode} data-placeholder={placeholder}>
      {children}
    </select>
  );
  Select.Option = ({ children, value }: { children?: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  );

  const Form = ({ children }: { children?: ReactNode }) => <form>{children}</form>;
  Form.Item = ({ children }: { children?: ReactNode }) => <label>{children}</label>;
  const Upload = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  Upload.Dragger = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

  return {
    Card: ({ children }: { children?: ReactNode }) => (
      <section className="ant-card">{children}</section>
    ),
    Table: ({ columns, dataSource }: { columns: any[]; dataSource: any[] }) => (
      <div className="ant-table-wrapper">
        {dataSource.map((record) => (
          <div key={record.id}>
            {columns.find((column) => column.key === 'actions')?.render(undefined, record)}
          </div>
        ))}
      </div>
    ),
    Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Space: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Input: () => <input />,
    InputNumber: () => <input />,
    Modal: ({ children, open }: { children?: ReactNode; open?: boolean }) =>
      open ? <div>{children}</div> : null,
    Progress: () => <div />,
    Select,
    Switch: () => <input type="checkbox" />,
    Tag: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Image: ({
      preview,
    }: {
      preview?: {
        visible?: boolean;
        src?: string;
      };
    }) => (
      <img
        alt="preview-proxy"
        data-visible={preview?.visible ? 'true' : 'false'}
        src={preview?.src || ''}
      />
    ),
    Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Upload,
    Form,
    message: {
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  };
});

vi.mock('../hooks/useFiles', () => ({
  useFiles: () => ({
    data: {
      items: [
        {
          id: 1,
          originalName: 'private.png',
          filename: 'private.png',
          path: '2026/05/01/private.png',
          url: '',
          mimeType: 'image/png',
          size: 128,
          category: 'image',
          storage: 'local',
          module: 'image',
          tags: '',
          isPublic: false,
          uploaderId: 1,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
      total: 1,
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
  usePreviewFile: () => ({
    mutate: hookMocks.previewFile,
    isPending: false,
  }),
  useCreateFileAccessLink: () => ({
    mutate: hookMocks.createAccessLink,
    isPending: false,
  }),
  useFileStorageOptions: () => ({
    data: hookMocks.storageOptionsResult.data,
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

vi.mock('@/shared/components/auth/PermissionGuard', () => ({
  PermissionGuard: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/components/table/TableActions', () => ({
  TableActions: ({ actions }: { actions: Array<{ label: string; onClick: () => void }> }) => (
    <div>
      {actions.map((action) => (
        <button key={action.label} type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

describe('FileList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.storageOptionsResult.data = {
      defaultStorage: 'local',
      options: [
        { value: 'local', label: '本地存储' },
        { value: 'oss', label: '阿里云 OSS' },
      ],
    };
  });

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

  it('renders filters for backend supported file fields', () => {
    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    expect(screen.getByText('公开文件')).toBeInTheDocument();
    expect(screen.getByText('本地存储')).toBeInTheDocument();
    expect(screen.getByText('压缩包')).toBeInTheDocument();
  });

  it('uses a temporary access link for private image preview', () => {
    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '预览' }));

    expect(hookMocks.createAccessLink).toHaveBeenCalledWith(
      { id: 1, disposition: 'inline' },
      expect.any(Object)
    );
    expect(hookMocks.previewFile).not.toHaveBeenCalled();
  });

  it('resolves private preview links against the configured API origin', () => {
    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '预览' }));

    const [, options] = hookMocks.createAccessLink.mock.calls[0];
    act(() => {
      options.onSuccess({
        url: '/api/v1/files/1/access?token=abc',
        expiresAt: '2026-05-02T00:00:00.000Z',
      });
    });

    expect(screen.getByAltText('preview-proxy')).toHaveAttribute(
      'src',
      'http://api.example.com/api/v1/files/1/access?token=abc'
    );
  });

  it('resolves private copied links against the configured API origin', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '复制链接' }));

    const [, options] = hookMocks.createAccessLink.mock.calls[0];
    act(() => {
      options.onSuccess({
        url: '/api/v1/files/1/access?token=abc',
        expiresAt: '2026-05-02T00:00:00.000Z',
      });
    });

    expect(writeText).toHaveBeenCalledWith(
      'http://api.example.com/api/v1/files/1/access?token=abc'
    );
  });

  it('uses a creatable tag selector for upload tags', () => {
    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '上传文件' }));

    const tagSelector = screen.getByTestId('upload-tags-selector');
    expect(tagSelector).toHaveAttribute('data-mode', 'tags');
  });

  it('lets users choose the upload storage when OSS is available', () => {
    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '上传文件' }));

    const storageSelector = screen.getByTestId('upload-storage-selector');
    expect(storageSelector).toBeInTheDocument();
    expect(within(storageSelector).getByText('阿里云 OSS')).toBeInTheDocument();
  });

  it('does not show OSS upload option before backend storage options load', () => {
    hookMocks.storageOptionsResult.data = undefined;

    render(
      <MemoryRouter>
        <FileList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '上传文件' }));

    expect(screen.queryByTestId('upload-storage-selector')).not.toBeInTheDocument();
    expect(screen.queryByText('阿里云 OSS')).not.toBeInTheDocument();
  });
});
