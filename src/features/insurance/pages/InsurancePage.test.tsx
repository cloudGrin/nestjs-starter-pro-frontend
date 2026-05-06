import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockUser, renderWithProviders, setMockUser } from '@/test/test-utils';
import { InsurancePage } from './InsurancePage';

const insuranceHookMocks = vi.hoisted(() => ({
  useInsuranceMembers: vi.fn(),
  useInsurancePolicies: vi.fn(),
  useInsurancePolicy: vi.fn(),
  useInsuranceFamilyView: vi.fn(),
  useCreateInsurancePolicy: vi.fn(),
  useUpdateInsurancePolicy: vi.fn(),
  useDeleteInsurancePolicy: vi.fn(),
  useCreateInsuranceMember: vi.fn(),
  useUpdateInsuranceMember: vi.fn(),
  useDeleteInsuranceMember: vi.fn(),
}));

vi.mock('../hooks/useInsurance', () => insuranceHookMocks);

const userHookMocks = vi.hoisted(() => ({
  useUsers: vi.fn(),
}));

vi.mock('@/features/rbac/user/hooks/useUsers', () => userHookMocks);

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

function renderInsurancePage(initialEntry = '/insurance') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <InsurancePage />
    </MemoryRouter>
  );
}

describe('InsurancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: () => '',
    }));
    setMockUser(
      createMockUser({
        permissions: [
          'insurance:read',
          'insurance:create',
          'insurance:update',
          'insurance:delete',
          'insurance-member:manage',
        ],
      })
    );

    insuranceHookMocks.useInsuranceMembers.mockReturnValue({
      data: [
        { id: 1, name: '妈妈', relationship: '母亲', sort: 0 },
        { id: 2, name: '孩子', relationship: '子女', sort: 1 },
      ],
      isLoading: false,
    });
    insuranceHookMocks.useInsurancePolicies.mockReturnValue({
      data: {
        items: [
          {
            id: 11,
            name: '家庭百万医疗',
            memberId: 1,
            member: { id: 1, name: '妈妈' },
            type: 'medical',
            endDate: '2026-12-31',
            nextPaymentDate: '2026-08-15',
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    insuranceHookMocks.useInsurancePolicy.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    userHookMocks.useUsers.mockReturnValue({
      data: {
        items: [
          {
            id: 7,
            username: 'admin',
            realName: '管理员',
            status: 'active',
            roles: [],
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 100,
      },
      isLoading: false,
    });
    insuranceHookMocks.useInsuranceFamilyView.mockReturnValue({
      data: [
        {
          member: { id: 1, name: '妈妈', relationship: '母亲', sort: 0 },
          policies: [{ id: 11, name: '家庭百万医疗', type: 'medical' }],
          policyCount: 1,
          nearestEndDate: '2026-12-31',
          nearestPaymentDate: '2026-08-15',
        },
        {
          member: { id: 2, name: '孩子', relationship: '子女', sort: 1 },
          policies: [],
          policyCount: 0,
          nearestEndDate: null,
          nearestPaymentDate: null,
        },
      ],
      isLoading: false,
    });
    insuranceHookMocks.useCreateInsurancePolicy.mockReturnValue(mockMutation());
    insuranceHookMocks.useUpdateInsurancePolicy.mockReturnValue(mockMutation());
    insuranceHookMocks.useDeleteInsurancePolicy.mockReturnValue(mockMutation());
    insuranceHookMocks.useCreateInsuranceMember.mockReturnValue(mockMutation());
    insuranceHookMocks.useUpdateInsuranceMember.mockReturnValue(mockMutation());
    insuranceHookMocks.useDeleteInsuranceMember.mockReturnValue(mockMutation());
  });

  it('renders policies grouped by member and the family view summary', async () => {
    renderInsurancePage();

    expect(screen.getByText('家庭保险')).toBeInTheDocument();
    expect(screen.getByText('妈妈')).toBeInTheDocument();
    expect(screen.getByText('家庭百万医疗')).toBeInTheDocument();

    await screen.findByRole('tab', { name: '家庭视图' });
    expect(screen.getByText('1 份保单')).toBeInTheDocument();
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
  });

  it('shows write actions when the user has wildcard permissions', () => {
    setMockUser(
      createMockUser({
        permissions: ['*'],
        isSuperAdmin: false,
        roleCode: 'user',
      })
    );

    renderInsurancePage();

    expect(screen.getByRole('button', { name: /新建保单/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /管理成员/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
  });

  it('shows write actions for a cached super admin role without permission flags', () => {
    setMockUser(
      createMockUser({
        permissions: undefined,
        isSuperAdmin: undefined,
        roleCode: undefined,
        roles: [{ id: 1, code: 'super_admin', name: '超级管理员', isActive: true }],
      })
    );

    renderInsurancePage();

    expect(screen.getByRole('button', { name: /新建保单/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
  });

  it('hides create actions without write permissions', () => {
    setMockUser(
      createMockUser({
        permissions: ['insurance:read'],
      })
    );

    renderInsurancePage();

    expect(screen.queryByRole('button', { name: /新建保单/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /管理成员/ })).not.toBeInTheDocument();
  });

  it('opens a linked policy that is outside the current list page', async () => {
    insuranceHookMocks.useInsurancePolicy.mockReturnValue({
      data: {
        id: 99,
        name: '异地重疾险',
        memberId: 2,
        member: { id: 2, name: '孩子' },
        type: 'critical_illness',
        company: '太平洋保险',
        endDate: '2027-01-01',
        nextPaymentDate: '2026-09-01',
        paymentFrequency: 'monthly',
        paymentChannel: '银行卡自动扣费',
        purchaseChannel: '保险经纪人',
        paymentReminderEnabled: false,
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      } as any,
      isLoading: false,
    });

    renderInsurancePage('/insurance?policyId=99');

    expect(await screen.findByText('异地重疾险')).toBeInTheDocument();
    expect(screen.getByText('月缴')).toBeInTheDocument();
    expect(screen.getByText('银行卡自动扣费')).toBeInTheDocument();
    expect(screen.getByText('保险经纪人')).toBeInTheDocument();
    expect(screen.getByText('关闭')).toBeInTheDocument();
  });
});
