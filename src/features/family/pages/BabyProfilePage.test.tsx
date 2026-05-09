import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, screen } from '@testing-library/react';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
import { BabyProfilePage } from './BabyProfilePage';
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
});
