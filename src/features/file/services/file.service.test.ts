import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { request } from '@/shared/utils/request';
import {
  createFileAccessLink,
  directUploadFile,
  downloadFile,
  getFileBlob,
  getFileStorageOptions,
  uploadFile,
} from './file.service';

vi.mock('@/shared/config/app.config', () => ({
  appConfig: {
    apiBaseUrl: 'http://api.example.com/api/v1',
  },
}));

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('file.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a success message after uploading a file', async () => {
    vi.mocked(request.post).mockResolvedValue({ id: 1 });

    await uploadFile(new File(['hello'], 'hello.txt', { type: 'text/plain' }));

    expect(request.post).toHaveBeenCalledWith(
      '/files/upload',
      expect.any(FormData),
      expect.objectContaining({
        requestOptions: {
          messageConfig: {
            successMessage: '文件上传成功',
          },
        },
      })
    );
  });

  it('sends the selected storage target with multipart uploads', async () => {
    vi.mocked(request.post).mockResolvedValue({ id: 1 });

    await uploadFile(new File(['hello'], 'hello.txt', { type: 'text/plain' }), {
      storage: 'local',
    });

    const formData = vi.mocked(request.post).mock.calls[0][1] as FormData;
    expect(formData.get('storage')).toBe('local');
  });

  it('fetches storage options from the backend', async () => {
    vi.mocked(request.get).mockResolvedValue({
      defaultStorage: 'local',
      options: [{ value: 'local', label: '本地存储' }],
    });

    await getFileStorageOptions();

    expect(request.get).toHaveBeenCalledWith('/files/storage-options');
  });

  it('performs OSS direct upload through signed URL and completes the backend record', async () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    vi.mocked(request.post)
      .mockResolvedValueOnce({
        method: 'PUT',
        uploadUrl: 'https://oss.example.com/signed',
        uploadToken: 'token-1',
        expiresAt: '2026-05-02T00:00:00.000Z',
        headers: { 'Content-Type': 'text/plain' },
      })
      .mockResolvedValueOnce({ id: 1 });
    vi.mocked(axios.put).mockResolvedValue({ status: 200 });

    await directUploadFile(file, {
      storage: 'oss',
      module: 'document',
      isPublic: false,
    });

    expect(request.post).toHaveBeenNthCalledWith(
      1,
      '/files/direct-upload/initiate',
      expect.objectContaining({
        originalName: 'hello.txt',
        mimeType: 'text/plain',
        size: file.size,
        module: 'document',
        isPublic: false,
      }),
      expect.any(Object)
    );
    expect(axios.put).toHaveBeenCalledWith(
      'https://oss.example.com/signed',
      file,
      expect.objectContaining({
        headers: { 'Content-Type': 'text/plain' },
      })
    );
    expect(request.post).toHaveBeenNthCalledWith(
      2,
      '/files/direct-upload/complete',
      { uploadToken: 'token-1' },
      expect.any(Object)
    );
  });

  it('creates a temporary access link for private preview or download', async () => {
    vi.mocked(request.post).mockResolvedValue({
      url: '/api/v1/files/3/access?token=abc',
      expiresAt: '2026-05-02T00:00:00.000Z',
    });

    await createFileAccessLink(3, 'inline');

    expect(request.post).toHaveBeenCalledWith('/files/3/access-link', {
      disposition: 'inline',
    });
  });

  it('resolves relative download access links against the configured API origin', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    vi.mocked(request.post).mockResolvedValue({
      url: '/api/v1/files/3/access?token=abc',
      expiresAt: '2026-05-02T00:00:00.000Z',
    });

    await downloadFile(3, 'private.png');

    const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.href).toBe('http://api.example.com/api/v1/files/3/access?token=abc');
    expect(link.getAttribute('download')).toBe('private.png');

    clickSpy.mockRestore();
    appendSpy.mockRestore();
  });

  it('can fetch a file blob without triggering browser download', async () => {
    const blob = new Blob(['image'], { type: 'image/png' });
    vi.mocked(request.get).mockResolvedValue(blob);

    await expect(getFileBlob(3)).resolves.toBe(blob);

    expect(request.get).toHaveBeenCalledWith('/files/3/download', {
      responseType: 'blob',
    });
  });
});
