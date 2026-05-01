import { beforeEach, describe, expect, it, vi } from 'vitest';
import { request } from '@/shared/utils/request';
import { getFileBlob, uploadFile } from './file.service';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
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
      }),
    );
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
