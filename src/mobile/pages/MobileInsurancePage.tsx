import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, Card, Empty, ImageViewer, Popup, PullToRefresh, SearchBar, Selector, Tag, Toast } from 'antd-mobile';
import {
  BellOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined,
  FileProtectOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { createFileAccessLink } from '@/features/file/services/file.service';
import { resolveFileAccessUrl } from '@/features/file/utils/file-url';
import {
  useInsuranceFamilyView,
  useInsuranceMembers,
  useInsurancePolicies,
  useInsurancePolicy,
} from '@/features/insurance/hooks/useInsurance';
import type {
  InsuranceFamilyViewItem,
  InsuranceMember,
  InsurancePolicy,
  InsurancePolicyAttachment,
  InsurancePolicyReminder,
  InsurancePolicyType,
} from '@/features/insurance/types/insurance.types';
import {
  getPolicyMemberName,
  getPolicyOwnerName,
  getPolicyStatus,
  isPreviewableAttachment,
  mobilePolicyTypeLabels,
  mobilePolicyTypeOptions,
} from '../utils/insurance';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

type InsuranceView = 'policies' | 'family' | 'reminders';
type InsuranceQuickFilter = 'all' | 'expiring' | 'payment';

interface InsuranceReminderItem {
  key: string;
  policy: InsurancePolicy;
  date: string;
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

const insuranceViews: InsuranceView[] = ['policies', 'family', 'reminders'];

const dockViewOptions: Array<{
  label: string;
  value: InsuranceView;
  icon: ReactNode;
}> = [
  { label: '保单', value: 'policies', icon: <FileProtectOutlined /> },
  { label: '家庭', value: 'family', icon: <TeamOutlined /> },
  { label: '提醒', value: 'reminders', icon: <BellOutlined /> },
];

const quickFilterOptions: Array<{ label: string; value: InsuranceQuickFilter }> = [
  { label: '全部', value: 'all' },
  { label: '30天到期', value: 'expiring' },
  { label: '待缴费', value: 'payment' },
];

const reminderTypeLabels: Record<InsurancePolicyReminder['reminderType'], string> = {
  expiry_30d: '到期前30天',
  expiry_7d: '到期前7天',
  payment_7d: '缴费前7天',
  payment_due: '待缴费',
};

function parseInsuranceView(value: string | null): InsuranceView {
  return value && insuranceViews.includes(value as InsuranceView)
    ? (value as InsuranceView)
    : 'policies';
}

function parsePolicyId(value: string | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '-';
}

function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return `¥${Number(value).toFixed(2)}`;
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

function getViewTitle(view: InsuranceView) {
  if (view === 'family') return '家庭';
  if (view === 'reminders') return '提醒';
  return '家庭保险';
}

function getMemberName(memberId: number | undefined, members: InsuranceMember[]) {
  if (!memberId) return undefined;
  return members.find((member) => member.id === memberId)?.name ?? `成员 #${memberId}`;
}

function buildReminderItems(policies: InsurancePolicy[]): InsuranceReminderItem[] {
  return policies
    .flatMap((policy) => {
      const persisted = policy.reminders?.map((reminder) => ({
        key: `reminder-${reminder.id}`,
        policy,
        date: formatDate(reminder.remindDate),
        label: reminderTypeLabels[reminder.reminderType],
        tone:
          reminder.reminderType === 'payment_due' || reminder.reminderType === 'payment_7d'
            ? ('warning' as const)
            : ('primary' as const),
      }));

      if (persisted?.length) {
        return persisted;
      }

      const generated: InsuranceReminderItem[] = [];
      if (policy.nextPaymentDate) {
        generated.push({
          key: `payment-${policy.id}`,
          policy,
          date: formatDate(policy.nextPaymentDate),
          label: '待缴费',
          tone: 'warning',
        });
      }
      if (policy.endDate) {
        generated.push({
          key: `expiry-${policy.id}`,
          policy,
          date: formatDate(policy.endDate),
          label: '保单到期',
          tone: 'danger',
        });
      }
      return generated;
    })
    .filter((item) => item.date !== '-')
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function MobileInsurancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseInsuranceView(searchParams.get('view'));
  const selectedPolicyId = parsePolicyId(searchParams.get('policyId'));
  const [keyword, setKeyword] = useState('');
  const [memberId, setMemberId] = useState<number>();
  const [type, setType] = useState<InsurancePolicyType>();
  const [quickFilter, setQuickFilter] = useState<InsuranceQuickFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

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
    includeReminders: view === 'reminders' ? true : undefined,
  });
  const selectedPolicyQuery = useInsurancePolicy(selectedPolicyId);
  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const rawPolicies = useMemo(() => policiesQuery.data?.items ?? [], [policiesQuery.data?.items]);
  const policies = useMemo(
    () => rawPolicies.filter((policy) => matchesQuickFilter(policy, quickFilter)),
    [quickFilter, rawPolicies]
  );
  const selectedPolicy =
    selectedPolicyQuery.data ?? policies.find((policy) => policy.id === selectedPolicyId) ?? null;
  const reminderItems = useMemo(() => buildReminderItems(policies), [policies]);
  const activeFilterChips = useMemo(
    () =>
      [
        getMemberName(memberId, members),
        type ? mobilePolicyTypeLabels[type] : undefined,
        quickFilter === 'all'
          ? undefined
          : quickFilterOptions.find((option) => option.value === quickFilter)?.label,
      ].filter(Boolean) as string[],
    [memberId, members, quickFilter, type]
  );

  useEffect(() => {
    if (searchParams.get('view')) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('view', 'policies');
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  const updateQuery = (updater: (next: URLSearchParams) => void, options?: { replace?: boolean }) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      updater(next);
      return next;
    }, options);
  };

  const setView = (nextView: InsuranceView) => {
    updateQuery((next) => {
      next.set('view', nextView);
      next.delete('policyId');
    });
  };

  const openPolicyDetail = (policy: InsurancePolicy) => {
    updateQuery((next) => {
      next.set('policyId', String(policy.id));
    });
  };

  const closePolicyDetail = () => {
    updateQuery((next) => {
      next.delete('policyId');
    }, { replace: true });
  };

  const openMemberPolicies = (nextMemberId: number) => {
    setMemberId(nextMemberId);
    updateQuery((next) => {
      next.set('view', 'policies');
      next.delete('policyId');
    });
  };

  const refreshAll = async () => {
    await Promise.all([policiesQuery.refetch(), familyViewQuery.refetch()]);
  };

  const openAttachment = async (
    attachment: InsurancePolicyAttachment,
    disposition: 'inline' | 'attachment'
  ) => {
    try {
      const { url } = await createFileAccessLink(attachment.fileId, disposition);
      const resolved = resolveFileAccessUrl(url);
      const mimeType = attachment.file?.mimeType ?? '';
      if (disposition === 'inline' && mimeType.startsWith('image/')) {
        setPreviewImage(resolved);
        return;
      }
      window.open(resolved, '_blank');
    } catch {
      Toast.show({ icon: 'fail', content: '附件访问失败', position: 'center' });
    }
  };

  return (
    <div className="mobile-page mobile-insurance-page">
      <MobileModuleHeader
        title={getViewTitle(view)}
        subtitle="保单、家庭成员和提醒查询"
        actions={
          <Button fill="none" onClick={() => setFilterOpen(true)}>
            <FilterOutlined />
            <span>筛选</span>
          </Button>
        }
      />

      <div className="mobile-insurance-search">
        <SearchBar placeholder="搜索保单、公司或保单号" value={keyword} onChange={setKeyword} />
      </div>

      {activeFilterChips.length ? (
        <div className="mobile-chip-row mobile-insurance-filter-chips">
          {activeFilterChips.map((chip) => (
            <Tag key={chip} color="primary">
              {chip}
            </Tag>
          ))}
          <Button
            size="mini"
            fill="none"
            onClick={() => {
              setMemberId(undefined);
              setType(undefined);
              setQuickFilter('all');
            }}
          >
            清除
          </Button>
        </div>
      ) : null}

      <PullToRefresh onRefresh={refreshAll}>
        <div className="mobile-insurance-content">
          {view === 'family' ? (
            <InsuranceFamilyView
              items={familyViewQuery.data ?? []}
              loading={familyViewQuery.isLoading}
              onOpenMember={openMemberPolicies}
            />
          ) : view === 'reminders' ? (
            <InsuranceReminderView
              items={reminderItems}
              loading={policiesQuery.isLoading}
              onOpenPolicy={openPolicyDetail}
            />
          ) : (
            <PolicyListView
              policies={policies}
              loading={policiesQuery.isLoading}
              onOpenPolicy={openPolicyDetail}
            />
          )}
        </div>
      </PullToRefresh>

      <InsuranceDock view={view} onChange={setView} />

      <PolicyDetailSheet
        open={Boolean(selectedPolicyId)}
        loading={selectedPolicyQuery.isLoading && !selectedPolicy}
        policy={selectedPolicy}
        refreshing={selectedPolicyQuery.isFetching}
        onClose={closePolicyDetail}
        onRefresh={() => void selectedPolicyQuery.refetch?.()}
        onPreview={(attachment) => void openAttachment(attachment, 'inline')}
        onDownload={(attachment) => void openAttachment(attachment, 'attachment')}
      />

      <InsuranceFilterPopup
        open={filterOpen}
        members={members}
        memberId={memberId}
        type={type}
        quickFilter={quickFilter}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setMemberId(next.memberId);
          setType(next.type);
          setQuickFilter(next.quickFilter);
          setFilterOpen(false);
        }}
      />

      <ImageViewer
        image={previewImage}
        visible={Boolean(previewImage)}
        onClose={() => setPreviewImage('')}
      />
    </div>
  );
}

function InsuranceDock({
  view,
  onChange,
}: {
  view: InsuranceView;
  onChange: (view: InsuranceView) => void;
}) {
  return (
    <nav className="mobile-task-dock mobile-insurance-dock">
      {dockViewOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`mobile-task-dock-item${view === item.value ? ' active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function PolicyListView({
  policies,
  loading,
  onOpenPolicy,
}: {
  policies: InsurancePolicy[];
  loading?: boolean;
  onOpenPolicy: (policy: InsurancePolicy) => void;
}) {
  if (loading) {
    return <Card className="mobile-task-list-card">加载中...</Card>;
  }

  if (policies.length === 0) {
    return <Empty description="暂无保单" />;
  }

  return (
    <div className="mobile-task-list-card">
      {policies.map((policy) => (
        <PolicyRow key={policy.id} policy={policy} onOpen={() => onOpenPolicy(policy)} />
      ))}
    </div>
  );
}

function PolicyRow({ policy, onOpen }: { policy: InsurancePolicy; onOpen: () => void }) {
  const status = getPolicyStatus(policy);

  return (
    <button type="button" className="mobile-insurance-row" onClick={onOpen}>
      <div className="mobile-insurance-row-main">
        <div className="mobile-insurance-row-title">{policy.name}</div>
        <div className="mobile-task-meta-line">
          <span>{getPolicyMemberName(policy)}</span>
          <span>{mobilePolicyTypeLabels[policy.type]}</span>
          {policy.company ? <span>{policy.company}</span> : null}
        </div>
        <div className="mobile-task-meta-line">
          <span className="primary">到期 {formatDate(policy.endDate)}</span>
          <span>缴费 {formatDate(policy.nextPaymentDate)}</span>
        </div>
      </div>
      <Tag color={status.color}>{status.label}</Tag>
    </button>
  );
}

function InsuranceFamilyView({
  items,
  loading,
  onOpenMember,
}: {
  items: InsuranceFamilyViewItem[];
  loading?: boolean;
  onOpenMember: (memberId: number) => void;
}) {
  if (loading) {
    return <Card className="mobile-task-list-card">加载中...</Card>;
  }

  if (items.length === 0) {
    return <Empty description="暂无家庭成员" />;
  }

  return (
    <div className="mobile-insurance-family-grid">
      {items.map((item) => (
        <button
          key={item.member.id}
          type="button"
          className="mobile-insurance-family-card"
          onClick={() => onOpenMember(item.member.id)}
        >
          <div>
            <strong>{item.member.name}</strong>
            {item.member.relationship ? <span>{item.member.relationship}</span> : null}
          </div>
          <div className="mobile-insurance-family-count">{item.policyCount} 份保单</div>
          <div className="mobile-task-meta-line">
            <span>最近到期：{formatDate(item.nearestEndDate)}</span>
          </div>
          <div className="mobile-task-meta-line">
            <span>最近缴费：{formatDate(item.nearestPaymentDate)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function InsuranceReminderView({
  items,
  loading,
  onOpenPolicy,
}: {
  items: InsuranceReminderItem[];
  loading?: boolean;
  onOpenPolicy: (policy: InsurancePolicy) => void;
}) {
  if (loading) {
    return <Card className="mobile-task-list-card">加载中...</Card>;
  }

  if (items.length === 0) {
    return <Empty description="暂无保险提醒" />;
  }

  return (
    <div className="mobile-task-list-card">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="mobile-insurance-reminder-row"
          onClick={() => onOpenPolicy(item.policy)}
        >
          <div className="mobile-insurance-reminder-date">
            <CalendarOutlined />
            <span>{item.date}</span>
          </div>
          <div className="mobile-insurance-row-main">
            <div className="mobile-insurance-row-title">{item.policy.name}</div>
            <div className="mobile-task-meta-line">
              <span>{getPolicyMemberName(item.policy)}</span>
              <span>{mobilePolicyTypeLabels[item.policy.type]}</span>
              {item.policy.company ? <span>{item.policy.company}</span> : null}
            </div>
          </div>
          <Tag color={item.tone}>{item.label}</Tag>
        </button>
      ))}
    </div>
  );
}

function PolicyDetailSheet({
  open,
  loading,
  policy,
  refreshing,
  onClose,
  onRefresh,
  onPreview,
  onDownload,
}: {
  open: boolean;
  loading?: boolean;
  policy: InsurancePolicy | null;
  refreshing?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onPreview: (attachment: InsurancePolicyAttachment) => void;
  onDownload: (attachment: InsurancePolicyAttachment) => void;
}) {
  const status = policy ? getPolicyStatus(policy) : null;

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-insurance-detail-sheet">
        <div className="mobile-popup-header">
          <strong>保单详情</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            关闭
          </Button>
        </div>
        {loading || !policy ? (
          <div className="mobile-empty">{loading ? '加载中...' : '保单不存在'}</div>
        ) : (
          <>
            <div className="mobile-insurance-detail-title-row">
              <div className="mobile-insurance-detail-icon">
                <FileProtectOutlined />
              </div>
              <div className="mobile-insurance-row-main">
                <h2>{policy.name}</h2>
                <div className="mobile-task-meta-line">
                  <span>{getPolicyMemberName(policy)}</span>
                  <span>{mobilePolicyTypeLabels[policy.type]}</span>
                  {policy.company ? <span>{policy.company}</span> : null}
                </div>
              </div>
              {status ? <Tag color={status.color}>{status.label}</Tag> : null}
            </div>

            <div className="mobile-task-detail-meta-card">
              <DetailLine label="保司" value={policy.company || '-'} />
              <DetailLine label="保单号" value={policy.policyNo || '-'} />
              <DetailLine label="负责人" value={getPolicyOwnerName(policy)} />
              <DetailLine label="生效" value={formatDate(policy.effectiveDate)} />
              <DetailLine label="到期" value={formatDate(policy.endDate)} />
              <DetailLine label="缴费" value={formatDate(policy.nextPaymentDate)} />
              <DetailLine label="金额" value={formatMoney(policy.paymentAmount)} />
            </div>

            <div className="mobile-task-detail-meta-card">
              <DetailLine
                label="渠道"
                value={
                  policy.reminderChannels?.length
                    ? policy.reminderChannels
                        .map((channel) =>
                          channel === 'internal' ? '站内' : channel === 'bark' ? 'Bark' : '飞书'
                        )
                        .join('、')
                    : '站内'
                }
              />
              <DetailLine label="外部" value={policy.sendExternalReminder ? '已开启' : '未开启'} />
            </div>

            {policy.remark ? <div className="mobile-task-detail-note">{policy.remark}</div> : null}

            <div className="mobile-insurance-attachment-card">
              <div className="mobile-insurance-section-title">附件</div>
              {policy.attachments?.length ? (
                <div className="mobile-insurance-attachment-list">
                  {policy.attachments.map((attachment) => (
                    <AttachmentRow
                      key={attachment.fileId}
                      attachment={attachment}
                      onPreview={onPreview}
                      onDownload={onDownload}
                    />
                  ))}
                </div>
              ) : (
                <div className="mobile-empty compact">暂无附件</div>
              )}
            </div>

            <div className="mobile-sheet-actions">
              <Button size="small" fill="outline" onClick={onClose}>
                返回
              </Button>
              <div>
                <Button size="small" color="primary" loading={refreshing} onClick={onRefresh}>
                  <ReloadOutlined /> 刷新
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Popup>
  );
}

function AttachmentRow({
  attachment,
  onPreview,
  onDownload,
}: {
  attachment: InsurancePolicyAttachment;
  onPreview: (attachment: InsurancePolicyAttachment) => void;
  onDownload: (attachment: InsurancePolicyAttachment) => void;
}) {
  return (
    <div className="mobile-insurance-attachment-row">
      <div className="mobile-insurance-row-main">
        <div className="mobile-insurance-attachment-name">
          {attachment.file?.originalName || `文件 #${attachment.fileId}`}
        </div>
        <div className="mobile-task-meta-line">
          <span>{attachment.file?.mimeType || '未知类型'}</span>
        </div>
      </div>
      <div className="mobile-insurance-attachment-actions">
        {isPreviewableAttachment(attachment) ? (
          <Button size="mini" fill="outline" onClick={() => onPreview(attachment)}>
            预览
          </Button>
        ) : null}
        <Button size="mini" fill="outline" onClick={() => onDownload(attachment)}>
          <DownloadOutlined />
          下载
        </Button>
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mobile-task-detail-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsuranceFilterPopup({
  open,
  members,
  memberId,
  type,
  quickFilter,
  onClose,
  onApply,
}: {
  open: boolean;
  members: InsuranceMember[];
  memberId?: number;
  type?: InsurancePolicyType;
  quickFilter: InsuranceQuickFilter;
  onClose: () => void;
  onApply: (values: {
    memberId?: number;
    type?: InsurancePolicyType;
    quickFilter: InsuranceQuickFilter;
  }) => void;
}) {
  const [draftMemberId, setDraftMemberId] = useState<number | undefined>(memberId);
  const [draftType, setDraftType] = useState<InsurancePolicyType | undefined>(type);
  const [draftQuickFilter, setDraftQuickFilter] = useState<InsuranceQuickFilter>(quickFilter);

  useEffect(() => {
    if (!open) return;
    setDraftMemberId(memberId);
    setDraftType(type);
    setDraftQuickFilter(quickFilter);
  }, [memberId, open, quickFilter, type]);

  const resetFilters = () => {
    setDraftMemberId(undefined);
    setDraftType(undefined);
    setDraftQuickFilter('all');
  };

  return (
    <Popup visible={open} onMaskClick={onClose} bodyStyle={{ borderRadius: '18px 18px 0 0' }}>
      <div className="mobile-popup-body mobile-filter-popup">
        <div className="mobile-popup-header">
          <strong>筛选保单</strong>
          <Button size="mini" fill="none" onClick={onClose}>
            取消
          </Button>
        </div>
        <div className="mobile-field mobile-field-card">
          <label>成员</label>
          <Selector
            options={[
              { label: '全部成员', value: 0 },
              ...members.map((member) => ({ label: member.name, value: member.id })),
            ]}
            value={[draftMemberId ?? 0]}
            onChange={(items: Array<string | number>) =>
              setDraftMemberId(Number(items[0]) || undefined)
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>险种</label>
          <Selector
            options={[{ label: '全部险种', value: 'all' }, ...mobilePolicyTypeOptions]}
            value={[draftType ?? 'all']}
            onChange={(items: Array<string | number>) =>
              setDraftType(items[0] === 'all' ? undefined : (items[0] as InsurancePolicyType))
            }
          />
        </div>
        <div className="mobile-field mobile-field-card">
          <label>状态</label>
          <Selector
            options={quickFilterOptions}
            value={[draftQuickFilter]}
            onChange={(items: Array<string | number>) =>
              setDraftQuickFilter((items[0] as InsuranceQuickFilter) || 'all')
            }
          />
        </div>
        <div className="mobile-popup-actions">
          <Button size="small" fill="outline" onClick={resetFilters}>
            重置
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() =>
              onApply({
                memberId: draftMemberId,
                type: draftType,
                quickFilter: draftQuickFilter,
              })
            }
          >
            应用
          </Button>
        </div>
      </div>
    </Popup>
  );
}
