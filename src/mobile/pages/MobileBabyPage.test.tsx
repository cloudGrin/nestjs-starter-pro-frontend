import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MobileBabyPage } from './MobileBabyPage';
import type { BabyOverview } from '@/features/family/types/family.types';

const familyHooks = vi.hoisted(() => ({
  useBabyOverview: vi.fn(),
  useCreateBabyBirthdayContribution: vi.fn(),
}));

const familyServiceMocks = vi.hoisted(() => ({
  familyService: {
    uploadBabyBirthdayImage: vi.fn(),
  },
}));

vi.mock('@/features/family/hooks/useFamily', () => familyHooks);
vi.mock('@/features/family/services/family.service', () => familyServiceMocks);

const createContribution = vi.fn().mockResolvedValue(undefined);

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
    remark: null,
  },
  growthRecords: [
    {
      id: 12,
      measuredAt: '2026-05-01',
      heightCm: 61.5,
      weightKg: 6.8,
      remark: null,
    },
  ],
  birthdays: [
    {
      id: 21,
      year: 2027,
      title: '一周岁生日',
      description: '愿你每天都开心',
      coverUrl: '/birthday/cover.jpg',
      mediaCount: 1,
      contributionCount: 1,
      media: [
        {
          id: 31,
          fileId: 71,
          uploaderId: 3,
          sort: 0,
          displayUrl: '/birthday/photo.jpg',
          expiresAt: '2026-05-10T10:00:00.000Z',
        },
      ],
      contributions: [
        {
          id: 41,
          birthdayId: 21,
          authorId: 3,
          author: { id: 3, username: 'mom', nickname: '妈妈' },
          content: '生日快乐呀',
          media: [],
          createdAt: '2027-02-01T08:00:00.000Z',
          updatedAt: '2027-02-01T08:00:00.000Z',
        },
      ],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/family/baby']}>
      <Routes>
        <Route path="/family/baby" element={<MobileBabyPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function readMobileCss() {
  return readFileSync('src/mobile/styles.css', 'utf8');
}

describe('MobileBabyPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true }).setSystemTime(
      new Date('2026-05-10T08:00:00.000Z')
    );
    vi.clearAllMocks();
    familyHooks.useBabyOverview.mockReturnValue({
      data: overview,
      isLoading: false,
      refetch: vi.fn(),
    });
    familyHooks.useCreateBabyBirthdayContribution.mockReturnValue({
      mutateAsync: createContribution,
      isPending: false,
    });
    familyServiceMocks.familyService.uploadBabyBirthdayImage.mockResolvedValue({ id: 71 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens a birthday album only after the user chooses it', () => {
    renderPage();

    expect(screen.getByText('小葡萄')).toBeInTheDocument();
    expect(screen.getByText('3 个月 9 天')).toBeInTheDocument();
    expect(screen.getAllByText('6.8 kg').length).toBeGreaterThan(0);
    expect(screen.getAllByText('61.5 cm').length).toBeGreaterThan(0);
    expect(screen.getByText('最近测量 2026-05-01')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /一周岁生日/ })).toBeInTheDocument();
    expect(screen.queryByText('愿你每天都开心')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '添加祝福' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /一周岁生日/ }));

    expect(screen.getByText('1 张照片')).toBeInTheDocument();
    expect(screen.getByText('1 条祝福')).toBeInTheDocument();
    expect(screen.getByText('愿你每天都开心')).toBeInTheDocument();
    expect(screen.getByText('生日快乐呀')).toBeInTheDocument();
    expect(screen.getByText('妈').closest('.mobile-family-avatar')).toHaveClass(
      'mobile-family-avatar',
      'small',
      'text'
    );
    expect(screen.getByAltText('生日照片')).toHaveAttribute('src', '/birthday/photo.jpg');
  });

  it('hides birthday album entry when no albums have been created', () => {
    familyHooks.useBabyOverview.mockReturnValue({
      data: {
        ...overview,
        birthdays: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.queryByText('生日合辑')).not.toBeInTheDocument();
    expect(screen.queryByText('请先在后台创建生日合辑')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '添加祝福' })).not.toBeInTheDocument();
  });

  it('defines mobile baby styles for light and dark mode', () => {
    const css = readMobileCss();

    expect(css).toContain('.mobile-baby-page');
    expect(css).toContain('.mobile-baby-summary-card');
    expect(css).toContain('.mobile-baby-composer-panel');
    expect(css).toContain('.dark .mobile-baby-page');
    expect(css).toContain('.dark .mobile-baby-summary-card');
    expect(css).toContain('.dark .mobile-baby-composer .adm-text-area');
  });

  it('submits a birthday blessing with selected photos', async () => {
    const { container } = renderPage();
    const file = new File(['image'], 'birthday.jpg', { type: 'image/jpeg' });

    fireEvent.click(screen.getByRole('button', { name: /一周岁生日/ }));
    fireEvent.click(screen.getByRole('button', { name: '添加祝福' }));
    fireEvent.change(screen.getByPlaceholderText('写下生日祝福...'), {
      target: { value: '愿你健康快乐' },
    });
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: '发送祝福' }));

    await waitFor(() => {
      expect(familyServiceMocks.familyService.uploadBabyBirthdayImage).toHaveBeenCalledWith(
        21,
        file
      );
      expect(createContribution).toHaveBeenCalledWith({
        birthdayId: 21,
        data: {
          content: '愿你健康快乐',
          mediaFileIds: [71],
        },
      });
    });
  });
});
