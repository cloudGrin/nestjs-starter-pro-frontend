import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Empty, PullToRefresh, SearchBar, Selector, Tag } from 'antd-mobile';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useInsuranceFamilyView,
  useInsuranceMembers,
  useInsurancePolicies,
} from '@/features/insurance/hooks/useInsurance';
import type {
  InsuranceFamilyViewItem,
  InsurancePolicy,
  InsurancePolicyType,
} from '@/features/insurance/types/insurance.types';
import {
  getPolicyMemberName,
  getPolicyOwnerName,
  getPolicyStatus,
  mobilePolicyTypeLabels,
  mobilePolicyTypeOptions,
} from '../utils/insurance';

type InsuranceQuickFilter = 'all' | 'expiring' | 'payment';

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '-';
}

function matchesQuickFilter(policy: InsurancePolicy, filter: InsuranceQuickFilter) {
  if (filter === 'all') return true;
  const today = dayjs().startOf('day');
  if (filter === 'expiring') {
    return Boolean(
      policy.endDate &&
        !dayjs(policy.endDate).isBefore(today, 'day') &&
        dayjs(policy.endDate).diff(today, 'day') <= 30
    );
  }
  return Boolean(policy.nextPaymentDate && !dayjs(policy.nextPaymentDate).isBefore(today, 'day'));
}

export function MobileInsurancePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [memberId, setMemberId] = useState<number>();
  const [type, setType] = useState<InsurancePolicyType>();
  const [quickFilter, setQuickFilter] = useState<InsuranceQuickFilter>('all');
  const [typeScrollEdge, setTypeScrollEdge] = useState({ left: false, right: false });
  const typeScrollRef = useRef<HTMLDivElement | null>(null);
  const membersQuery = useInsuranceMembers();
  const familyViewQuery = useInsuranceFamilyView();
  const policiesQuery = useInsurancePolicies({
    page: 1,
    limit: 100,
    sort: 'endDate',
    order: 'ASC',
    keyword: keyword.trim() || undefined,
    memberId,
    type,
  });
  const members = membersQuery.data ?? [];
  const policies = useMemo(
    () =>
      (policiesQuery.data?.items ?? []).filter((policy) => matchesQuickFilter(policy, quickFilter)),
    [policiesQuery.data?.items, quickFilter]
  );
  const updateTypeScrollEdge = useCallback(() => {
    const element = typeScrollRef.current;
    if (!element) return;

    const next = {
      left: element.scrollLeft > 2,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    };

    setTypeScrollEdge((previous) =>
      previous.left === next.left && previous.right === next.right ? previous : next
    );
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateTypeScrollEdge);
    window.addEventListener('resize', updateTypeScrollEdge);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateTypeScrollEdge);
    };
  }, [updateTypeScrollEdge]);

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <div>
          <h1 className="mobile-title">家庭保险</h1>
          <div className="mobile-subtitle">全家可读，移动端只做查询和附件预览</div>
        </div>
      </div>

      <div className="mobile-section">
        <SearchBar placeholder="搜索保单、公司或保单号" value={keyword} onChange={setKeyword} />
        <div className="mobile-toolbar">
          <Selector
            options={[
              { label: '全部成员', value: 0 },
              ...members.map((member) => ({ label: member.name, value: member.id })),
            ]}
            value={[memberId ?? 0]}
            onChange={(items: Array<string | number>) => setMemberId(Number(items[0]) || undefined)}
          />
        </div>
        <div
          className={`mobile-fade-scroll${typeScrollEdge.left ? ' is-left' : ''}${typeScrollEdge.right ? ' is-right' : ''}`}
        >
          <div
            ref={typeScrollRef}
            className="mobile-fade-scroll-content"
            onScroll={updateTypeScrollEdge}
          >
            <Selector
              className="mobile-scroll-selector mobile-insurance-type-selector"
              options={[{ label: '全部险种', value: 'all' }, ...mobilePolicyTypeOptions]}
              value={[type ?? 'all']}
              onChange={(items: Array<string | number>) =>
                setType(items[0] === 'all' ? undefined : (items[0] as InsurancePolicyType))
              }
            />
          </div>
        </div>
        <Selector
          options={[
            { label: '全部', value: 'all' },
            { label: '30天到期', value: 'expiring' },
            { label: '待缴费', value: 'payment' },
          ]}
          value={[quickFilter]}
          onChange={(items: Array<string | number>) =>
            setQuickFilter((items[0] as InsuranceQuickFilter) || 'all')
          }
        />
      </div>

      <PullToRefresh
        onRefresh={async () => {
          await Promise.all([policiesQuery.refetch(), familyViewQuery.refetch()]);
        }}
      >
        <div className="mobile-section mt-3">
          <FamilySummary items={familyViewQuery.data ?? []} />
          {policies.length === 0 ? (
            <Empty description={policiesQuery.isLoading ? '加载中...' : '暂无保单'} />
          ) : (
            policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onOpen={() => navigate(`/insurance/${policy.id}`)}
              />
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}

function FamilySummary({ items }: { items: InsuranceFamilyViewItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mobile-toolbar">
      {items.map((item) => (
        <Card key={item.member.id} className="mobile-card min-w-[150px]">
          <div className="font-semibold">{item.member.name}</div>
          <div className="mobile-subtitle">{item.policyCount} 份保单</div>
          <div className="mobile-subtitle">最近到期：{formatDate(item.nearestEndDate)}</div>
        </Card>
      ))}
    </div>
  );
}

function PolicyCard({ policy, onOpen }: { policy: InsurancePolicy; onOpen: () => void }) {
  const status = getPolicyStatus(policy);

  return (
    <Card className="mobile-card" onClick={onOpen}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{policy.name}</div>
          <div className="mobile-meta">
            <span>{getPolicyMemberName(policy)}</span>
            <span>{mobilePolicyTypeLabels[policy.type]}</span>
            {policy.company ? <span>{policy.company}</span> : null}
          </div>
        </div>
        <Tag color={status.color}>{status.label}</Tag>
      </div>
      <div className="mobile-meta">
        <span>到期：{formatDate(policy.endDate)}</span>
        <span>缴费：{formatDate(policy.nextPaymentDate)}</span>
        <span>负责人：{getPolicyOwnerName(policy)}</span>
      </div>
      <div className="mt-3">
        <Button size="small" fill="outline" onClick={onOpen}>
          查看详情
        </Button>
      </div>
    </Card>
  );
}
