import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs, { type Dayjs } from 'dayjs';
import { useLocation } from 'react-router-dom';
import { PageWrap, PermissionGuard, SearchForm, TableActions } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import { createFileAccessLink, uploadFile } from '@/features/file/services/file.service';
import { resolveFileAccessUrl } from '@/features/file/utils/file-url';
import { useUsers } from '@/features/rbac/user/hooks/useUsers';
import { insuranceService } from '../services/insurance.service';
import {
  useCreateInsuranceMember,
  useCreateInsurancePolicy,
  useDeleteInsuranceMember,
  useDeleteInsurancePolicy,
  useInsuranceFamilyView,
  useInsuranceMembers,
  useInsurancePolicies,
  useInsurancePolicy,
  useUpdateInsuranceMember,
  useUpdateInsurancePolicy,
} from '../hooks/useInsurance';
import type {
  CreateInsuranceMemberDto,
  CreateInsurancePolicyDto,
  InsuranceFamilyViewItem,
  InsuranceMember,
  InsurancePolicy,
  InsurancePolicyAttachment,
  InsurancePolicySortField,
  InsurancePolicyType,
  QueryInsurancePoliciesParams,
  UpdateInsurancePolicyDto,
} from '../types/insurance.types';

interface InsuranceSearchValues {
  keyword?: string;
  memberId?: number;
  type?: InsurancePolicyType;
}

interface PolicyFormValues {
  name: string;
  company?: string;
  policyNo?: string;
  memberId: number;
  type: InsurancePolicyType;
  effectiveDate?: Dayjs;
  endDate?: Dayjs;
  nextPaymentDate?: Dayjs;
  paymentAmount?: number;
  ownerUserId?: number;
  remark?: string;
  reminderChannels?: Array<'internal' | 'bark' | 'feishu'>;
  attachmentFileIds?: number[];
}

const policyTypeOptions: Array<{ value: InsurancePolicyType; label: string; color: string }> = [
  { value: 'medical', label: '医疗', color: 'blue' },
  { value: 'critical_illness', label: '重疾', color: 'red' },
  { value: 'life', label: '寿险', color: 'purple' },
  { value: 'accident', label: '意外', color: 'orange' },
  { value: 'auto', label: '车险', color: 'cyan' },
  { value: 'home_property', label: '家财', color: 'green' },
  { value: 'travel', label: '旅行', color: 'geekblue' },
  { value: 'other', label: '其他', color: 'default' },
];

const policyTypeLabel = new Map(policyTypeOptions.map((item) => [item.value, item.label]));
const policyTypeColor = new Map(policyTypeOptions.map((item) => [item.value, item.color]));
const relationshipOptions = ['本人', '配偶', '父亲', '母亲', '子女', '孩子', '其他'];
const externalReminderChannels = new Set(['bark', 'feishu']);
const policySortFieldByColumn: Record<string, InsurancePolicySortField> = {
  name: 'name',
  endDate: 'endDate',
  nextPaymentDate: 'nextPaymentDate',
};

function getInitialQueryParams(): QueryInsurancePoliciesParams {
  return {
    page: 1,
    limit: 10,
    sort: 'endDate',
    order: 'ASC',
  };
}

function getPolicyIdFromSearch(search: string) {
  const policyId = Number(new URLSearchParams(search).get('policyId'));
  return Number.isInteger(policyId) && policyId > 0 ? policyId : undefined;
}

function toDateValue(value?: string | null) {
  return value ? dayjs(value) : undefined;
}

function toDatePayload(value?: Dayjs) {
  return value ? value.format('YYYY-MM-DD') : null;
}

function getPolicyStatus(policy: InsurancePolicy) {
  if (policy.endDate && dayjs(policy.endDate).isBefore(dayjs(), 'day')) {
    return <Tag color="red">已到期</Tag>;
  }

  if (policy.endDate && dayjs(policy.endDate).diff(dayjs(), 'day') <= 30) {
    return <Tag color="orange">即将到期</Tag>;
  }

  return <Tag color="green">保障中</Tag>;
}

function getPolicyMemberName(policy: InsurancePolicy, members: InsuranceMember[]) {
  return (
    policy.member?.name ||
    members.find((member) => member.id === policy.memberId)?.name ||
    `成员 #${policy.memberId}`
  );
}

function groupPoliciesByMember(policies: InsurancePolicy[], members: InsuranceMember[]) {
  const groups = new Map<number, { member: InsuranceMember; policies: InsurancePolicy[] }>();
  for (const member of members) {
    groups.set(member.id, { member, policies: [] });
  }
  for (const policy of policies) {
    const member =
      policy.member ||
      members.find((item) => item.id === policy.memberId) ||
      ({ id: policy.memberId, name: `成员 #${policy.memberId}`, sort: 0 } as InsuranceMember);
    const group = groups.get(member.id) ?? { member, policies: [] };
    group.policies.push(policy);
    groups.set(member.id, group);
  }

  return Array.from(groups.values()).filter((group) => group.policies.length > 0);
}

function toPolicyPayload(
  values: PolicyFormValues
): CreateInsurancePolicyDto | UpdateInsurancePolicyDto {
  const reminderChannels = normalizeReminderChannels(values.reminderChannels);
  return {
    name: values.name,
    company: values.company || null,
    policyNo: values.policyNo || null,
    memberId: values.memberId,
    type: values.type,
    effectiveDate: toDatePayload(values.effectiveDate),
    endDate: toDatePayload(values.endDate),
    nextPaymentDate: toDatePayload(values.nextPaymentDate),
    paymentAmount: values.paymentAmount ?? null,
    ownerUserId: values.ownerUserId,
    remark: values.remark || null,
    reminderChannels,
    sendExternalReminder: reminderChannels.some((channel) => externalReminderChannels.has(channel)),
    attachmentFileIds: values.attachmentFileIds ?? [],
  };
}

function normalizeReminderChannels(channels?: PolicyFormValues['reminderChannels']) {
  return Array.from(new Set(['internal', ...(channels ?? [])])) as NonNullable<
    PolicyFormValues['reminderChannels']
  >;
}

function attachmentIds(policy?: InsurancePolicy | null) {
  return policy?.attachments?.map((attachment) => attachment.fileId) ?? [];
}

function getUserDisplayName(
  user?: {
    username?: string | null;
    nickname?: string | null;
    realName?: string | null;
  } | null
) {
  return user?.realName || user?.nickname || user?.username || '';
}

function isPreviewableAttachment(attachment: InsurancePolicyAttachment) {
  const mimeType = attachment.file?.mimeType ?? '';
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}

export function InsurancePage() {
  const location = useLocation();
  const [searchForm] = Form.useForm<InsuranceSearchValues>();
  const [policyForm] = Form.useForm<PolicyFormValues>();
  const [memberForm] = Form.useForm<CreateInsuranceMemberDto>();
  const [queryParams, setQueryParams] = useState<QueryInsurancePoliciesParams>(() =>
    getInitialQueryParams()
  );
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [detailPolicy, setDetailPolicy] = useState<InsurancePolicy | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [editingMember, setEditingMember] = useState<InsuranceMember | null>(null);
  const [uploadedAttachments, setUploadedAttachments] = useState<InsurancePolicyAttachment[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const policyIdFromSearch = getPolicyIdFromSearch(location.search);
  const membersQuery = useInsuranceMembers();
  const policiesQuery = useInsurancePolicies(queryParams);
  const linkedPolicyQuery = useInsurancePolicy(policyIdFromSearch);
  const familyViewQuery = useInsuranceFamilyView();
  const usersQuery = useUsers({ page: 1, limit: 100, status: 'active' });
  const createPolicy = useCreateInsurancePolicy();
  const updatePolicy = useUpdateInsurancePolicy();
  const deletePolicy = useDeleteInsurancePolicy();
  const createMember = useCreateInsuranceMember();
  const updateMember = useUpdateInsuranceMember();
  const deleteMember = useDeleteInsuranceMember();

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const policies = useMemo(() => policiesQuery.data?.items ?? [], [policiesQuery.data?.items]);
  const groupedPolicies = useMemo(
    () => groupPoliciesByMember(policies, members),
    [members, policies]
  );
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items]);
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        label: getUserDisplayName(user),
        value: user.id,
      })),
    [users]
  );
  const relationshipSelectOptions = useMemo(() => {
    const values = new Set(relationshipOptions);
    members.forEach((member) => {
      if (member.relationship) {
        values.add(member.relationship);
      }
    });
    return Array.from(values).map((value) => ({ label: value, value }));
  }, [members]);

  useEffect(() => {
    if (!policyIdFromSearch) {
      return;
    }

    const target =
      policies.find((policy) => policy.id === policyIdFromSearch) ?? linkedPolicyQuery.data;
    if (target) {
      setDetailPolicy(target);
    }
  }, [linkedPolicyQuery.data, policies, policyIdFromSearch]);

  const resetPolicyForm = () => {
    setEditingPolicy(null);
    setUploadedAttachments([]);
    policyForm.resetFields();
  };

  const openCreatePolicy = () => {
    resetPolicyForm();
    policyForm.setFieldsValue({
      type: 'medical',
      reminderChannels: ['internal'],
      attachmentFileIds: [],
    });
    setPolicyModalOpen(true);
  };

  const openEditPolicy = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setUploadedAttachments(policy.attachments ?? []);
    policyForm.setFieldsValue({
      name: policy.name,
      company: policy.company ?? undefined,
      policyNo: policy.policyNo ?? undefined,
      memberId: policy.memberId,
      type: policy.type,
      effectiveDate: toDateValue(policy.effectiveDate),
      endDate: toDateValue(policy.endDate),
      nextPaymentDate: toDateValue(policy.nextPaymentDate),
      paymentAmount: policy.paymentAmount ? Number(policy.paymentAmount) : undefined,
      ownerUserId: policy.ownerUserId,
      remark: policy.remark ?? undefined,
      reminderChannels: policy.reminderChannels ?? ['internal'],
      attachmentFileIds: attachmentIds(policy),
    });
    setPolicyModalOpen(true);
  };

  const handlePolicySubmit = async () => {
    const values = await policyForm.validateFields();
    const payload = toPolicyPayload(values);

    if (editingPolicy) {
      updatePolicy.mutate(
        { id: editingPolicy.id, data: payload },
        {
          onSuccess: () => {
            setPolicyModalOpen(false);
            resetPolicyForm();
          },
        }
      );
      return;
    }

    createPolicy.mutate(payload as CreateInsurancePolicyDto, {
      onSuccess: () => {
        setPolicyModalOpen(false);
        resetPolicyForm();
      },
    });
  };

  const handleAttachmentUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await uploadFile(file, {
        module: 'insurance-policy',
        isPublic: false,
      });
      const currentIds = policyForm.getFieldValue('attachmentFileIds') ?? [];
      policyForm.setFieldValue('attachmentFileIds', [...currentIds, uploaded.id]);
      setUploadedAttachments((previous) => [
        ...previous,
        {
          id: uploaded.id,
          fileId: uploaded.id,
          policyId: editingPolicy?.id ?? 0,
          sort: previous.length,
          file: uploaded,
        },
      ]);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeAttachment = (fileId: number) => {
    const next = (policyForm.getFieldValue('attachmentFileIds') ?? []).filter(
      (id: number) => id !== fileId
    );
    policyForm.setFieldValue('attachmentFileIds', next);
    setUploadedAttachments((previous) => previous.filter((item) => item.fileId !== fileId));
  };

  const handleAttachmentPreview = async (attachment: InsurancePolicyAttachment) => {
    const mimeType = attachment.file?.mimeType ?? '';
    if (!isPreviewableAttachment(attachment)) {
      message.info('该附件类型不支持预览');
      return;
    }

    const resolvePreviewUrl = async () => {
      if (attachment.file?.isPublic && attachment.file.url) {
        return resolveFileAccessUrl(attachment.file.url);
      }
      const { url } = await createFileAccessLink(attachment.fileId, 'inline');
      return resolveFileAccessUrl(url);
    };

    const previewUrl = await resolvePreviewUrl();
    if (mimeType.startsWith('image/')) {
      setPreviewImage(previewUrl);
      setPreviewVisible(true);
      return;
    }

    window.open(previewUrl, '_blank');
  };

  const handleSearch = (values: Record<string, unknown>) => {
    const searchValues = values as InsuranceSearchValues;
    setQueryParams({
      ...getInitialQueryParams(),
      keyword: searchValues.keyword?.trim() || undefined,
      memberId: searchValues.memberId,
      type: searchValues.type,
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQueryParams(getInitialQueryParams());
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    sorter: SorterResult<InsurancePolicy>
  ) => {
    const sortKey =
      typeof sorter.field === 'string' ? policySortFieldByColumn[sorter.field] : undefined;
    const sortOrder =
      sortKey && sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : undefined;

    setQueryParams((previous) => ({
      ...previous,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? previous.limit ?? 10,
      sort: sortOrder ? sortKey : previous.sort,
      order: sortOrder ?? previous.order,
    }));
  };

  const openEditMember = (member: InsuranceMember) => {
    setEditingMember(member);
    memberForm.setFieldsValue({
      name: member.name,
      relationship: member.relationship ?? undefined,
      linkedUserId: member.linkedUserId ?? undefined,
      remark: member.remark ?? undefined,
      sort: member.sort,
    });
  };

  const handleMemberSubmit = async () => {
    const values = await memberForm.validateFields();

    if (editingMember) {
      updateMember.mutate(
        { id: editingMember.id, data: values },
        {
          onSuccess: () => {
            setEditingMember(null);
            memberForm.resetFields();
          },
        }
      );
      return;
    }

    createMember.mutate(values, {
      onSuccess: () => memberForm.resetFields(),
    });
  };

  const policyColumns: ColumnsType<InsurancePolicy> = [
    {
      title: '保单',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name: string, record) => (
        <Space direction="vertical" size={2}>
          <Button
            type="link"
            className="h-auto p-0 font-medium"
            onClick={() => setDetailPolicy(record)}
          >
            {name}
          </Button>
          <span className="text-xs text-slate-500">
            {record.company || '未填写保险公司'}
            {record.policyNo ? ` · ${record.policyNo}` : ''}
          </span>
        </Space>
      ),
    },
    {
      title: '险种',
      dataIndex: 'type',
      width: 100,
      render: (type: InsurancePolicyType) => (
        <Tag color={policyTypeColor.get(type)}>{policyTypeLabel.get(type) ?? type}</Tag>
      ),
    },
    {
      title: '状态',
      width: 100,
      render: (_, record) => getPolicyStatus(record),
    },
    {
      title: '到期日',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 130,
      sorter: true,
      render: formatDate.date,
    },
    {
      title: '缴费日',
      dataIndex: 'nextPaymentDate',
      key: 'nextPaymentDate',
      width: 130,
      sorter: true,
      render: formatDate.date,
    },
    {
      title: '负责人',
      width: 120,
      render: (_, record) => {
        const owner = record.ownerUser ?? users.find((user) => user.id === record.ownerUserId);
        return (
          getUserDisplayName(owner) || (record.ownerUserId ? `用户 #${record.ownerUserId}` : '-')
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <TableActions
          actions={[
            {
              label: '编辑',
              icon: <EditOutlined />,
              permission: 'insurance:update',
              onClick: () => openEditPolicy(record),
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              permission: 'insurance:delete',
              danger: true,
              loading: deletePolicy.isPending && deletePolicy.variables === record.id,
              onClick: () => deletePolicy.mutate(record.id),
            },
          ]}
        />
      ),
    },
  ];

  const memberColumns: ColumnsType<InsuranceMember> = [
    {
      title: '成员',
      dataIndex: 'name',
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          <span className="text-xs text-slate-500">{record.relationship || '-'}</span>
        </Space>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditMember(record)}>
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMember.isPending && deleteMember.variables === record.id}
            onClick={() => deleteMember.mutate(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageWrap
      title="家庭保险"
      titleRight={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={policiesQuery.isFetching}
            onClick={() => policiesQuery.refetch()}
          >
            刷新
          </Button>
          <PermissionGuard permissions={['insurance-member:manage']}>
            <Button icon={<TeamOutlined />} onClick={() => setMemberModalOpen(true)}>
              管理成员
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={['insurance:create']}>
            <Tooltip title={members.length === 0 ? '请先创建成员' : undefined}>
              <span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={members.length === 0}
                  onClick={openCreatePolicy}
                >
                  新建保单
                </Button>
              </span>
            </Tooltip>
          </PermissionGuard>
        </Space>
      }
      header={
        <SearchForm
          form={searchForm}
          onSearch={handleSearch}
          onReset={handleReset}
          showRefresh
          onRefresh={() => policiesQuery.refetch()}
          defaultCollapseCount={3}
        >
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="搜索保单、公司或保单号" allowClear />
          </Form.Item>
          <Form.Item name="memberId" label="成员">
            <Select
              allowClear
              placeholder="全部成员"
              options={members.map((member) => ({ label: member.name, value: member.id }))}
            />
          </Form.Item>
          <Form.Item name="type" label="险种">
            <Select allowClear placeholder="全部险种" options={policyTypeOptions} />
          </Form.Item>
        </SearchForm>
      }
    >
      <Tabs
        items={[
          {
            key: 'list',
            label: '保单列表',
            children: (
              <Space direction="vertical" className="w-full" size={12}>
                {groupedPolicies.length === 0 ? (
                  <Card>
                    <div className="py-8 text-center text-slate-500">暂无保单</div>
                  </Card>
                ) : (
                  groupedPolicies.map((group) => (
                    <Card
                      key={group.member.id}
                      title={
                        <Space>
                          <span>{group.member.name}</span>
                          {group.member.relationship ? (
                            <Tag>{group.member.relationship}</Tag>
                          ) : null}
                          <span className="text-sm font-normal text-slate-500">
                            {group.policies.length} 份保单
                          </span>
                        </Space>
                      }
                    >
                      <Table<InsurancePolicy>
                        columns={policyColumns}
                        dataSource={group.policies}
                        rowKey="id"
                        loading={policiesQuery.isLoading}
                        pagination={false}
                        onChange={(_pagination, _filters, sorter) =>
                          handleTableChange(
                            {
                              current: queryParams.page,
                              pageSize: queryParams.limit,
                            },
                            Array.isArray(sorter) ? sorter[0] : sorter
                          )
                        }
                        scroll={{ x: 1050 }}
                      />
                    </Card>
                  ))
                )}
                <div className="flex justify-end">
                  <Table<InsurancePolicy>
                    columns={[]}
                    dataSource={[]}
                    showHeader={false}
                    pagination={{
                      current: policiesQuery.data?.page ?? queryParams.page ?? 1,
                      pageSize: policiesQuery.data?.pageSize ?? queryParams.limit ?? 10,
                      total: policiesQuery.data?.total ?? 0,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 条`,
                      onChange: (page, limit) =>
                        setQueryParams((previous) => ({ ...previous, page, limit })),
                    }}
                  />
                </div>
              </Space>
            ),
          },
          {
            key: 'family',
            label: '家庭视图',
            children: (
              <FamilyView items={familyViewQuery.data ?? []} loading={familyViewQuery.isLoading} />
            ),
          },
        ]}
      />

      <Modal
        title={editingPolicy ? '编辑保单' : '新建保单'}
        open={policyModalOpen}
        onOk={handlePolicySubmit}
        onCancel={() => {
          setPolicyModalOpen(false);
          resetPolicyForm();
        }}
        okText="保存"
        cancelText="取消"
        width={760}
        okButtonProps={{ loading: createPolicy.isPending || updatePolicy.isPending || uploading }}
      >
        <Form form={policyForm} layout="vertical">
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="保单名称"
              rules={[{ required: true, message: '请输入保单名称' }]}
            >
              <Input placeholder="例如：家庭百万医疗" />
            </Form.Item>
            <Form.Item name="type" label="险种" rules={[{ required: true, message: '请选择险种' }]}>
              <Select options={policyTypeOptions} />
            </Form.Item>
            <Form.Item
              name="memberId"
              label="归属成员"
              rules={[{ required: true, message: '请选择成员' }]}
            >
              <Select
                options={members.map((member) => ({ label: member.name, value: member.id }))}
              />
            </Form.Item>
            <Form.Item name="ownerUserId" label="负责人">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={usersQuery.isLoading}
                placeholder="不填则默认当前用户"
                options={userOptions}
              />
            </Form.Item>
            <Form.Item name="company" label="保险公司">
              <Input placeholder="保险公司" />
            </Form.Item>
            <Form.Item name="policyNo" label="保单号">
              <Input placeholder="保单号" />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="endDate" label="到期日">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="nextPaymentDate" label="下次缴费日">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="paymentAmount" label="缴费金额">
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
            <Form.Item name="reminderChannels" label="提醒渠道">
              <Select
                mode="multiple"
                optionFilterProp="label"
                options={[
                  { label: '站内', value: 'internal' },
                  { label: 'Bark', value: 'bark' },
                  { label: '飞书', value: 'feishu' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="简单备注" />
          </Form.Item>
          <Form.Item name="attachmentFileIds" hidden>
            <Select mode="multiple" />
          </Form.Item>
          <Form.Item label="附件">
            <Upload.Dragger
              beforeUpload={(file) => {
                void handleAttachmentUpload(file);
                return false;
              }}
              showUploadList={false}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">选择保单附件</p>
            </Upload.Dragger>
            {uploadedAttachments.length > 0 ? (
              <Space className="mt-2" wrap>
                {uploadedAttachments.map((attachment) => (
                  <Space key={attachment.fileId} size={4}>
                    <Tag
                      closable
                      onClose={(event) => {
                        event.preventDefault();
                        removeAttachment(attachment.fileId);
                      }}
                    >
                      {attachment.file?.originalName || `文件 #${attachment.fileId}`}
                    </Tag>
                    {isPreviewableAttachment(attachment) ? (
                      <Button size="small" onClick={() => void handleAttachmentPreview(attachment)}>
                        预览
                      </Button>
                    ) : null}
                  </Space>
                ))}
              </Space>
            ) : null}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="管理成员"
        open={memberModalOpen}
        onCancel={() => {
          setMemberModalOpen(false);
          setEditingMember(null);
          memberForm.resetFields();
        }}
        footer={null}
        width={720}
      >
        <Form form={memberForm} layout="inline" className="mb-4">
          <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item name="relationship">
            <Select
              allowClear
              showSearch
              placeholder="关系"
              options={relationshipSelectOptions}
              onInputKeyDown={(event) => {
                if (event.key !== 'Enter') {
                  return;
                }
                const value = (event.target as HTMLInputElement).value.trim();
                if (value) {
                  memberForm.setFieldValue('relationship', value);
                }
              }}
            />
          </Form.Item>
          <Form.Item name="sort">
            <InputNumber placeholder="排序" />
          </Form.Item>
          <Button
            type="primary"
            loading={createMember.isPending || updateMember.isPending}
            onClick={handleMemberSubmit}
          >
            {editingMember ? '保存' : '添加'}
          </Button>
        </Form>
        <Table<InsuranceMember>
          columns={memberColumns}
          dataSource={members}
          rowKey="id"
          loading={membersQuery.isLoading}
          pagination={false}
        />
      </Modal>

      <Drawer
        title={detailPolicy?.name}
        open={Boolean(detailPolicy)}
        onClose={() => setDetailPolicy(null)}
        width={560}
      >
        {detailPolicy ? (
          <PolicyDetail
            policy={detailPolicy}
            memberName={getPolicyMemberName(detailPolicy, members)}
            onPreview={(attachment) => void handleAttachmentPreview(attachment)}
            onDownload={(attachment) =>
              window.open(
                insuranceService.getAttachmentDownloadUrl(detailPolicy.id, attachment.fileId)
              )
            }
          />
        ) : null}
      </Drawer>

      {previewImage ? (
        <Image
          preview={{
            visible: previewVisible,
            onVisibleChange: setPreviewVisible,
            src: previewImage,
          }}
          style={{ display: 'none' }}
        />
      ) : null}
    </PageWrap>
  );
}

function FamilyView({ items, loading }: { items: InsuranceFamilyViewItem[]; loading?: boolean }) {
  if (loading) {
    return <Card loading />;
  }

  if (items.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center text-slate-500">暂无成员</div>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.member.id} title={item.member.name}>
          <Space direction="vertical" className="w-full" size={8}>
            <Space>
              {item.member.relationship ? <Tag>{item.member.relationship}</Tag> : null}
              <Tag color={item.policyCount > 0 ? 'blue' : 'default'}>{item.policyCount} 份保单</Tag>
            </Space>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500">最近到期</div>
                <div>{formatDate.date(item.nearestEndDate)}</div>
              </div>
              <div>
                <div className="text-slate-500">最近缴费</div>
                <div>{formatDate.date(item.nearestPaymentDate)}</div>
              </div>
            </div>
            {item.policies.length > 0 ? (
              <Space wrap>
                {item.policies.map((policy) => (
                  <Tag key={policy.id}>{policy.name}</Tag>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">暂无保单</Typography.Text>
            )}
          </Space>
        </Card>
      ))}
    </div>
  );
}

function PolicyDetail({
  policy,
  memberName,
  onPreview,
  onDownload,
}: {
  policy: InsurancePolicy;
  memberName: string;
  onPreview: (attachment: InsurancePolicyAttachment) => void;
  onDownload: (attachment: InsurancePolicyAttachment) => void;
}) {
  return (
    <Space direction="vertical" className="w-full" size={16}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="成员">{memberName}</Descriptions.Item>
        <Descriptions.Item label="险种">
          <Tag color={policyTypeColor.get(policy.type)}>{policyTypeLabel.get(policy.type)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="保险公司">{policy.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="保单号">{policy.policyNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="生效日">
          {formatDate.date(policy.effectiveDate)}
        </Descriptions.Item>
        <Descriptions.Item label="到期日">{formatDate.date(policy.endDate)}</Descriptions.Item>
        <Descriptions.Item label="下次缴费日">
          {formatDate.date(policy.nextPaymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="缴费金额">
          {policy.paymentAmount ? `¥${Number(policy.paymentAmount).toFixed(2)}` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="备注">{policy.remark || '-'}</Descriptions.Item>
      </Descriptions>
      <div>
        <Typography.Title level={5}>附件</Typography.Title>
        {policy.attachments?.length ? (
          <Space direction="vertical" className="w-full">
            {policy.attachments.map((attachment) => (
              <Space key={attachment.fileId}>
                <Typography.Text>
                  {attachment.file?.originalName || `文件 #${attachment.fileId}`}
                </Typography.Text>
                {isPreviewableAttachment(attachment) ? (
                  <Button size="small" onClick={() => onPreview(attachment)}>
                    预览
                  </Button>
                ) : null}
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload(attachment)}
                >
                  下载
                </Button>
              </Space>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">暂无附件</Typography.Text>
        )}
      </div>
    </Space>
  );
}
