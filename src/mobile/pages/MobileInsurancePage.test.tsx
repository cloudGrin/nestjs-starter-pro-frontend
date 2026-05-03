import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileInsurancePage } from './MobileInsurancePage';
import type {
  InsuranceFamilyViewItem,
  InsurancePolicy,
} from '@/features/insurance/types/insurance.types';

const insuranceHooks = vi.hoisted(() => ({
  useInsuranceMembers: vi.fn(),
  useInsuranceFamilyView: vi.fn(),
  useInsurancePolicies: vi.fn(),
  useInsurancePolicy: vi.fn(),
}));

vi.mock('@/features/insurance/hooks/useInsurance', () => insuranceHooks);

const refetch = vi.fn().mockResolvedValue(undefined);

const basePolicy: InsurancePolicy = {
  id: 11,
  name: '家庭百万医疗',
  company: '平安保险',
  policyNo: 'PA-001',
  memberId: 1,
  member: { id: 1, name: '妈妈', relationship: '母亲', sort: 0 },
  type: 'medical',
  effectiveDate: '2026-01-01',
  endDate: '2026-12-31',
  nextPaymentDate: '2026-08-15',
  paymentAmount: '2999',
  ownerUserId: 7,
  ownerUser: { id: 7, username: 'admin', realName: '管理员' },
  remark: '门诊和住院材料放在附件里',
  attachments: [],
  reminders: [
    {
      id: 1,
      policyId: 11,
      reminderType: 'expiry_30d',
      remindDate: '2026-12-01',
      recipientUserId: 7,
    },
  ],
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

const childPolicy: InsurancePolicy = {
  ...basePolicy,
  id: 12,
  name: '儿童重疾险',
  memberId: 2,
  member: { id: 2, name: '孩子', relationship: '子女', sort: 1 },
  type: 'critical_illness',
  endDate: '2026-05-20',
  nextPaymentDate: '2026-05-10',
  reminders: [],
};

const familyItems: InsuranceFamilyViewItem[] = [
  {
    member: { id: 1, name: '妈妈', relationship: '母亲', sort: 0 },
    policies: [basePolicy],
    policyCount: 1,
    nearestEndDate: '2026-12-31',
    nearestPaymentDate: '2026-08-15',
  },
  {
    member: { id: 2, name: '孩子', relationship: '子女', sort: 1 },
    policies: [childPolicy],
    policyCount: 1,
    nearestEndDate: '2026-05-20',
    nearestPaymentDate: '2026-05-10',
  },
];

function renderPage(initialPath = '/insurance') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MobileInsurancePage />
    </MemoryRouter>
  );
}

function getDockButton(label: string) {
  const button = screen
    .getAllByRole('button', { name: new RegExp(label) })
    .find((element) => element.className.includes('mobile-task-dock-item'));
  expect(button).toBeDefined();
  return button as HTMLElement;
}

describe('MobileInsurancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insuranceHooks.useInsuranceMembers.mockReturnValue({
      data: [
        { id: 1, name: '妈妈', relationship: '母亲', sort: 0 },
        { id: 2, name: '孩子', relationship: '子女', sort: 1 },
      ],
      isLoading: false,
    });
    insuranceHooks.useInsuranceFamilyView.mockReturnValue({
      data: familyItems,
      isLoading: false,
      refetch,
    });
    insuranceHooks.useInsurancePolicies.mockReturnValue({
      data: { items: [basePolicy, childPolicy], total: 2, page: 1, pageSize: 100 },
      isLoading: false,
      isFetching: false,
      refetch,
    });
    insuranceHooks.useInsurancePolicy.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch,
    });
  });

  it('defaults to the policy view with insurance dock items', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '家庭保险' })).toBeInTheDocument();
    expect(screen.getByText('家庭百万医疗')).toBeInTheDocument();
    expect(getDockButton('保单')).toBeInTheDocument();
    expect(getDockButton('家庭')).toBeInTheDocument();
    expect(getDockButton('提醒')).toBeInTheDocument();
    await waitFor(() =>
      expect(insuranceHooks.useInsurancePolicies).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'endDate', order: 'ASC' })
      )
    );
  });

  it('switches to the family view and filters policies from a member card', async () => {
    renderPage();

    fireEvent.click(getDockButton('家庭'));
    expect(screen.getByText('最近到期：2026-05-20')).toBeInTheDocument();

    fireEvent.click(screen.getByText('孩子'));

    await waitFor(() =>
      expect(insuranceHooks.useInsurancePolicies).toHaveBeenLastCalledWith(
        expect.objectContaining({ memberId: 2 })
      )
    );
    expect(screen.getByText('儿童重疾险')).toBeInTheDocument();
  });

  it('applies member and policy type filters from the filter sheet', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /筛选/ }));
    fireEvent.click(screen.getAllByText('孩子').at(-1)!);
    fireEvent.click(screen.getAllByText('重疾').at(-1)!);
    fireEvent.click(screen.getByText('30天到期'));
    fireEvent.click(screen.getByRole('button', { name: '应用' }));

    await waitFor(() =>
      expect(insuranceHooks.useInsurancePolicies).toHaveBeenLastCalledWith(
        expect.objectContaining({ memberId: 2, type: 'critical_illness' })
      )
    );
    expect(screen.getAllByText('孩子').length).toBeGreaterThan(0);
    expect(screen.getAllByText('重疾').length).toBeGreaterThan(0);
    expect(screen.getAllByText('30天到期').length).toBeGreaterThan(0);
  });

  it('opens a linked policy detail sheet from the policyId query parameter', async () => {
    insuranceHooks.useInsurancePolicy.mockReturnValue({
      data: {
        ...basePolicy,
        id: 99,
        name: '异地重疾险',
        memberId: 2,
        member: { id: 2, name: '孩子', relationship: '子女', sort: 1 },
        type: 'critical_illness',
      },
      isLoading: false,
      isFetching: false,
      refetch,
    });

    renderPage('/insurance?policyId=99');

    expect(await screen.findByText('保单详情')).toBeInTheDocument();
    expect(screen.getByText('异地重疾险')).toBeInTheDocument();
    expect(insuranceHooks.useInsurancePolicy).toHaveBeenCalledWith(99);
  });

  it('only shows attachment previews for images and PDFs', async () => {
    insuranceHooks.useInsurancePolicy.mockReturnValue({
      data: {
        ...basePolicy,
        attachments: [
          {
            id: 1,
            policyId: 11,
            fileId: 101,
            sort: 0,
            file: {
              id: 101,
              originalName: '保单照片.jpg',
              filename: 'policy.jpg',
              path: '/tmp/policy.jpg',
              mimeType: 'image/jpeg',
              size: 1024,
              category: 'image',
              storage: 'local',
              isPublic: false,
              uploaderId: 7,
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
            },
          },
          {
            id: 2,
            policyId: 11,
            fileId: 102,
            sort: 1,
            file: {
              id: 102,
              originalName: '条款.pdf',
              filename: 'terms.pdf',
              path: '/tmp/terms.pdf',
              mimeType: 'application/pdf',
              size: 2048,
              category: 'document',
              storage: 'local',
              isPublic: false,
              uploaderId: 7,
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
            },
          },
          {
            id: 3,
            policyId: 11,
            fileId: 103,
            sort: 2,
            file: {
              id: 103,
              originalName: '说明.txt',
              filename: 'note.txt',
              path: '/tmp/note.txt',
              mimeType: 'text/plain',
              size: 512,
              category: 'document',
              storage: 'local',
              isPublic: false,
              uploaderId: 7,
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
            },
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch,
    });

    renderPage('/insurance?policyId=11');

    expect(await screen.findByText('保单照片.jpg')).toBeInTheDocument();
    expect(screen.getByText('条款.pdf')).toBeInTheDocument();
    expect(screen.getByText('说明.txt')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '预览' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /下载/ })).toHaveLength(3);
  });

  it('renders insurance reminders as a timeline view', () => {
    renderPage();

    fireEvent.click(getDockButton('提醒'));

    expect(insuranceHooks.useInsurancePolicies).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeReminders: true })
    );
    expect(screen.getByText('2026-05-10')).toBeInTheDocument();
    expect(screen.getByText('待缴费')).toBeInTheDocument();
    expect(screen.getByText('2026-12-01')).toBeInTheDocument();
    expect(screen.getByText('到期前30天')).toBeInTheDocument();
  });
});
