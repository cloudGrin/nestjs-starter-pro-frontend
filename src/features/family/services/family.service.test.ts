import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { appConfig } from '@/shared/config/app.config';
import { request } from '@/shared/utils/request';
import { familyService } from './family.service';

vi.mock('@/shared/config/app.config', () => ({
  appConfig: {
    familyMediaUploadMode: 'local',
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

describe('family.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appConfig.familyMediaUploadMode = 'local';
  });

  it('uploads family media through the temporary local upload endpoint', async () => {
    const file = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    vi.mocked(request.post).mockResolvedValue({ id: 17 });

    await familyService.uploadFamilyMedia(file, 'chat');

    expect(request.post).toHaveBeenCalledTimes(1);
    expect(request.post).toHaveBeenCalledWith(
      '/family/media/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        requestOptions: {
          messageConfig: { successMessage: false },
        },
      })
    );

    const formData = vi.mocked(request.post).mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.get('target')).toBe('chat');
  });

  it('uses OSS direct upload when family media upload mode is oss', async () => {
    appConfig.familyMediaUploadMode = 'oss';
    const file = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    vi.mocked(request.post)
      .mockResolvedValueOnce({
        method: 'PUT',
        uploadUrl: 'https://oss.example.com/signed',
        uploadToken: 'token-1',
        expiresAt: '2026-05-05T00:00:00.000Z',
        headers: { 'Content-Type': 'image/jpeg' },
      })
      .mockResolvedValueOnce({ id: 17 });
    vi.mocked(axios.put).mockResolvedValue({ status: 200 });

    await familyService.uploadFamilyMedia(file, 'circle');

    expect(request.post).toHaveBeenNthCalledWith(
      1,
      '/family/media/direct-upload/initiate',
      {
        target: 'circle',
        originalName: 'meal.jpg',
        mimeType: 'image/jpeg',
        size: file.size,
      },
      expect.any(Object)
    );
    expect(axios.put).toHaveBeenCalledWith(
      'https://oss.example.com/signed',
      file,
      expect.objectContaining({
        headers: { 'Content-Type': 'image/jpeg' },
      })
    );
    expect(request.post).toHaveBeenNthCalledWith(
      2,
      '/family/media/direct-upload/complete',
      { uploadToken: 'token-1' },
      expect.any(Object)
    );
  });
});
