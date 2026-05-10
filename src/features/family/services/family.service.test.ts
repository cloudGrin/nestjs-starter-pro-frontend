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
    put: vi.fn(),
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

  it('infers mp4 mime type for OSS direct upload when the browser omits file.type', async () => {
    appConfig.familyMediaUploadMode = 'oss';
    const file = new File(['video'], 'family-video.MP4');
    vi.mocked(request.post)
      .mockResolvedValueOnce({
        method: 'PUT',
        uploadUrl: 'https://oss.example.com/signed-video',
        uploadToken: 'token-video',
        expiresAt: '2026-05-05T00:00:00.000Z',
        headers: { 'Content-Type': 'video/mp4' },
      })
      .mockResolvedValueOnce({ id: 18 });
    vi.mocked(axios.put).mockResolvedValue({ status: 200 });

    await familyService.uploadFamilyMedia(file, 'chat');

    expect(request.post).toHaveBeenNthCalledWith(
      1,
      '/family/media/direct-upload/initiate',
      {
        target: 'chat',
        originalName: 'family-video.MP4',
        mimeType: 'video/mp4',
        size: file.size,
      },
      expect.any(Object)
    );
  });

  it('normalizes mp4 file type for local upload when the browser omits file.type', async () => {
    const file = new File(['video'], 'family-video.mp4');
    vi.mocked(request.post).mockResolvedValue({ id: 19 });

    await familyService.uploadFamilyMedia(file, 'chat');

    const formData = vi.mocked(request.post).mock.calls[0][1] as FormData;
    const uploadedFile = formData.get('file') as File;
    expect(uploadedFile.name).toBe('family-video.mp4');
    expect(uploadedFile.type).toBe('video/mp4');
    expect(formData.get('target')).toBe('chat');
  });

  it('loads baby overview from the family baby endpoint', async () => {
    vi.mocked(request.get).mockResolvedValue({ profile: null, birthdays: [] });

    await familyService.getBabyOverview();

    expect(request.get).toHaveBeenCalledWith('/family/baby');
  });

  it('saves baby profile through the backend maintenance endpoint', async () => {
    vi.mocked(request.put).mockResolvedValue({ id: 1 });

    await familyService.saveBabyProfile({
      nickname: '小葡萄',
      birthDate: '2026-02-01',
      birthHeightCm: 50,
      birthWeightKg: 3.2,
    });

    expect(request.put).toHaveBeenCalledWith(
      '/family/baby/profile',
      {
        nickname: '小葡萄',
        birthDate: '2026-02-01',
        birthHeightCm: 50,
        birthWeightKg: 3.2,
      },
      expect.objectContaining({
        requestOptions: {
          messageConfig: { successMessage: '宝宝资料已保存' },
        },
      })
    );
  });

  it('uploads birthday images for a backend-created birthday album', async () => {
    const file = new File(['image'], 'birthday.jpg', { type: 'image/jpeg' });
    vi.mocked(request.post).mockResolvedValue({ id: 71 });

    await familyService.uploadBabyBirthdayImage(21, file);

    expect(request.post).toHaveBeenCalledWith(
      '/family/baby/birthdays/21/media/upload',
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
    expect((vi.mocked(request.post).mock.calls[0][1] as FormData).get('file')).toBe(file);
  });

  it('uploads baby avatar images through the baby endpoint', async () => {
    const file = new File(['image'], 'avatar.jpg', { type: 'image/jpeg' });
    vi.mocked(request.post).mockResolvedValue({ id: 88 });

    await familyService.uploadBabyAvatarImage(file);

    expect(request.post).toHaveBeenCalledWith(
      '/family/baby/avatar/upload',
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
    expect((vi.mocked(request.post).mock.calls[0][1] as FormData).get('file')).toBe(file);
  });

  it('submits birthday blessing text with uploaded image ids', async () => {
    vi.mocked(request.post).mockResolvedValue({ id: 81 });

    await familyService.createBabyBirthdayContribution(21, {
      content: '愿你健康快乐',
      mediaFileIds: [71],
    });

    expect(request.post).toHaveBeenCalledWith(
      '/family/baby/birthdays/21/contributions',
      {
        content: '愿你健康快乐',
        mediaFileIds: [71],
      },
      expect.objectContaining({
        requestOptions: {
          messageConfig: { successMessage: '祝福已添加' },
        },
      })
    );
  });

  it('deletes family posts through the family circle endpoint', async () => {
    vi.mocked(request.delete).mockResolvedValue(undefined);

    await familyService.deletePost(11);

    expect(request.delete).toHaveBeenCalledWith(
      '/family/posts/11',
      expect.objectContaining({
        requestOptions: {
          messageConfig: { successMessage: '动态已删除' },
        },
      })
    );
  });

  it('deletes family comments and replies through the post comment endpoint', async () => {
    vi.mocked(request.delete).mockResolvedValue(undefined);

    await familyService.deleteComment(11, 31);

    expect(request.delete).toHaveBeenCalledWith(
      '/family/posts/11/comments/31',
      expect.objectContaining({
        requestOptions: {
          messageConfig: { successMessage: '评论已删除' },
        },
      })
    );
  });
});
