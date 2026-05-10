import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createFileAccessLink, uploadFile } from '@/features/file/services/file.service';
import { cropAvatarFile, loadImageFromUrl } from '@/shared/utils/avatarCrop';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
import { BabyProfilePage } from './BabyProfilePage';
import { familyService } from '../services/family.service';
import type { BabyOverview } from '../types/family.types';

const familyHookMocks = vi.hoisted(() => ({
  useBabyOverview: vi.fn(),
  useSaveBabyProfile: vi.fn(),
  useCreateBabyGrowthRecord: vi.fn(),
  useUpdateBabyGrowthRecord: vi.fn(),
  useDeleteBabyGrowthRecord: vi.fn(),
  useCreateBabyBirthday: vi.fn(),
  useUpdateBabyBirthday: vi.fn(),
  useDeleteBabyBirthday: vi.fn(),
}));

vi.mock('../hooks/useFamily', () => familyHookMocks);

vi.mock('@/features/file/services/file.service', () => ({
  createFileAccessLink: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock('../services/family.service', () => ({
  familyService: {
    uploadBabyAvatarImage: vi.fn(),
  },
}));

vi.mock('@/shared/utils/avatarCrop', async () => {
  const actual = await vi.importActual<typeof import('@/shared/utils/avatarCrop')>(
    '@/shared/utils/avatarCrop'
  );

  return {
    ...actual,
    cropAvatarFile: vi.fn(),
    loadImageFromUrl: vi.fn(),
  };
});

vi.mock('@/shared/hooks/useBreadcrumb', () => ({
  useBreadcrumb: () => [],
}));

function mockMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  };
}

const overview: BabyOverview = {
  profile: {
    id: 1,
    nickname: '小葡萄',
    birthDate: '2026-02-01',
    birthTime: null,
    avatarFileId: 7,
    avatarUrl: null,
    birthHeightCm: 50,
    birthWeightKg: 3.2,
  },
  latestGrowthRecord: {
    id: 12,
    measuredAt: '2026-05-01',
    heightCm: 61.5,
    weightKg: 6.8,
    remark: '满三个月',
  },
  growthRecords: [
    {
      id: 12,
      measuredAt: '2026-05-01',
      heightCm: 61.5,
      weightKg: 6.8,
      remark: '满三个月',
    },
  ],
  birthdays: [
    {
      id: 21,
      year: 2027,
      title: '一周岁生日',
      description: '后台创建的生日合辑',
      coverUrl: null,
      mediaCount: 0,
      contributionCount: 0,
      media: [],
      contributions: [],
    },
  ],
};

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <BabyProfilePage />
    </MemoryRouter>
  );
}

describe('BabyProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '',
    }));
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:baby-avatar'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    setMockUser(createMockUser({ permissions: ['baby:read', 'baby:update'] }));
    familyHookMocks.useBabyOverview.mockReturnValue({
      data: overview,
      isLoading: false,
      refetch: vi.fn(),
    });
    familyHookMocks.useSaveBabyProfile.mockReturnValue(mockMutation());
    familyHookMocks.useCreateBabyGrowthRecord.mockReturnValue(mockMutation());
    familyHookMocks.useUpdateBabyGrowthRecord.mockReturnValue(mockMutation());
    familyHookMocks.useDeleteBabyGrowthRecord.mockReturnValue(mockMutation());
    familyHookMocks.useCreateBabyBirthday.mockReturnValue(mockMutation());
    familyHookMocks.useUpdateBabyBirthday.mockReturnValue(mockMutation());
    familyHookMocks.useDeleteBabyBirthday.mockReturnValue(mockMutation());
    vi.mocked(familyService.uploadBabyAvatarImage).mockResolvedValue({
      id: 88,
      originalName: 'avatar.png',
      filename: 'avatar.png',
      path: 'baby-avatar/2026/05/10/avatar.png',
      url: '/uploads/baby-avatar/avatar.png',
      mimeType: 'image/png',
      size: 6,
      category: 'image',
      storage: 'local',
      module: 'baby-avatar',
      tags: 'baby,avatar',
      isPublic: false,
      uploaderId: 1,
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
    });
    vi.mocked(createFileAccessLink).mockResolvedValue({
      url: '/files/88/access?token=avatar-token',
      token: 'avatar-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
    });
    vi.mocked(loadImageFromUrl).mockResolvedValue({
      naturalWidth: 800,
      naturalHeight: 600,
      width: 800,
      height: 600,
    } as HTMLImageElement);
    vi.mocked(cropAvatarFile).mockResolvedValue(
      new File(['cropped-avatar'], 'avatar-cropped.png', { type: 'image/png' })
    );
  });

  it('renders baby profile, growth records, and backend-created birthday albums', () => {
    renderPage();

    expect(screen.getByText('宝宝档案')).toBeInTheDocument();
    expect(screen.getByText('小葡萄')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '成长记录' }));
    expect(screen.getByText('61.5 cm')).toBeInTheDocument();
    expect(screen.getByText('6.8 kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '生日合辑' }));
    expect(screen.getByText('一周岁生日')).toBeInTheDocument();
    expect(screen.getByText('后台创建的生日合辑')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /新增生日/ })).toBeInTheDocument();
  });

  it('crops, uploads, and saves baby avatar from the admin profile form', async () => {
    const saveProfile = mockMutation();
    familyHookMocks.useSaveBabyProfile.mockReturnValue(saveProfile);
    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('例如：小葡萄')).toHaveValue('小葡萄');
    });

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInstanceOf(HTMLInputElement);

    const avatarFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput as HTMLInputElement, { target: { files: [avatarFile] } });

    expect(await screen.findByText('裁剪宝宝头像')).toBeInTheDocument();
    expect(uploadFile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '保存头像' }));

    await waitFor(() => {
      expect(familyService.uploadBabyAvatarImage).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'avatar-cropped.png' })
      );
    });
    expect(uploadFile).not.toHaveBeenCalled();
    expect(createFileAccessLink).not.toHaveBeenCalled();
    expect(cropAvatarFile).toHaveBeenCalledWith(
      avatarFile,
      'blob:baby-avatar',
      expect.objectContaining({
        cropSize: expect.any(Number),
      })
    );
    expect(await screen.findByText('已选择新头像，保存资料后生效')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /保存资料/ }));

    await waitFor(() => {
      expect(saveProfile.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarFileId: 88,
        })
      );
    });
  });
});
