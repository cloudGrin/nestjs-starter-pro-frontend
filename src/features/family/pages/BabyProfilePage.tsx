import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageWrap } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import {
  useBabyOverview,
  useCreateBabyBirthday,
  useCreateBabyGrowthRecord,
  useDeleteBabyBirthday,
  useDeleteBabyGrowthRecord,
  useSaveBabyProfile,
} from '../hooks/useFamily';
import type {
  BabyBirthday,
  BabyGrowthRecord,
  SaveBabyProfileDto,
  CreateBabyBirthdayDto,
  CreateBabyGrowthRecordDto,
} from '../types/family.types';

const { Paragraph, Text } = Typography;

export function BabyProfilePage() {
  const overviewQuery = useBabyOverview();
  const saveProfile = useSaveBabyProfile();
  const createGrowthRecord = useCreateBabyGrowthRecord();
  const deleteGrowthRecord = useDeleteBabyGrowthRecord();
  const createBirthday = useCreateBabyBirthday();
  const deleteBirthday = useDeleteBabyBirthday();
  const [profileForm] = Form.useForm<SaveBabyProfileDto>();
  const [growthForm] = Form.useForm<CreateBabyGrowthRecordDto>();
  const [birthdayForm] = Form.useForm<CreateBabyBirthdayDto>();
  const [growthModalOpen, setGrowthModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const overview = overviewQuery.data;

  useEffect(() => {
    if (!overview?.profile) return;
    profileForm.setFieldsValue({
      nickname: overview.profile.nickname,
      birthDate: overview.profile.birthDate,
      birthTime: overview.profile.birthTime ?? undefined,
      avatarFileId: overview.profile.avatarFileId ?? undefined,
      birthHeightCm: overview.profile.birthHeightCm ?? undefined,
      birthWeightKg: overview.profile.birthWeightKg ?? undefined,
    });
  }, [overview?.profile, profileForm]);

  const growthColumns: ColumnsType<BabyGrowthRecord> = [
    {
      title: '测量日期',
      dataIndex: 'measuredAt',
      render: (value: string) => formatDate.date(value),
    },
    {
      title: '体重',
      dataIndex: 'weightKg',
      render: (value?: number | null) => (value == null ? '-' : `${value} kg`),
    },
    {
      title: '身高',
      dataIndex: 'heightCm',
      render: (value?: number | null) => (value == null ? '-' : `${value} cm`),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (value?: string | null) => value || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Button
          danger
          type="link"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteGrowthRecord.mutate(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  const birthdayColumns: ColumnsType<BabyBirthday> = [
    {
      title: '年份',
      dataIndex: 'year',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (value: string, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{value}</Text>
          {record.description ? <Text type="secondary">{record.description}</Text> : null}
        </Space>
      ),
    },
    {
      title: '内容',
      key: 'counts',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tag>{record.mediaCount} 张照片</Tag>
          <Tag>{record.contributionCount} 条祝福</Tag>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Button
          danger
          type="link"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteBirthday.mutate(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <PageWrap
      title="宝宝档案"
      titleRight={
        <Button
          icon={<ReloadOutlined />}
          loading={overviewQuery.isLoading}
          onClick={() => overviewQuery.refetch()}
        >
          刷新
        </Button>
      }
    >
      <Tabs
        items={[
          {
            key: 'profile',
            label: '基础资料',
            children: (
              <Card>
                {overview?.profile ? (
                  <Space direction="vertical" size="large" className="w-full">
                    <Space size="large" wrap>
                      <div>
                        <Text type="secondary">宝宝昵称</Text>
                        <div className="mt-1 text-xl font-semibold">
                          {overview.profile.nickname}
                        </div>
                      </div>
                      <div>
                        <Text type="secondary">出生日期</Text>
                        <div className="mt-1 text-xl font-semibold">
                          {formatDate.date(overview.profile.birthDate)}
                        </div>
                      </div>
                      <div>
                        <Text type="secondary">出生身高/体重</Text>
                        <div className="mt-1 text-xl font-semibold">
                          {overview.profile.birthHeightCm ?? '-'} cm /{' '}
                          {overview.profile.birthWeightKg ?? '-'} kg
                        </div>
                      </div>
                    </Space>
                  </Space>
                ) : (
                  <Empty description="还没有宝宝档案，请先保存基础资料" />
                )}
                <Form
                  form={profileForm}
                  layout="vertical"
                  className="mt-6 max-w-3xl"
                  onFinish={(values) => saveProfile.mutate(values)}
                >
                  <Form.Item name="nickname" label="宝宝昵称" rules={[{ required: true }]}>
                    <Input placeholder="例如：小葡萄" />
                  </Form.Item>
                  <Form.Item name="birthDate" label="出生日期" rules={[{ required: true }]}>
                    <Input type="date" />
                  </Form.Item>
                  <Form.Item name="birthTime" label="出生时间">
                    <Input placeholder="例如：08:30" />
                  </Form.Item>
                  <Space wrap>
                    <Form.Item name="birthHeightCm" label="出生身高 cm">
                      <InputNumber min={20} max={80} precision={1} />
                    </Form.Item>
                    <Form.Item name="birthWeightKg" label="出生体重 kg">
                      <InputNumber min={0.5} max={10} precision={2} />
                    </Form.Item>
                  </Space>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saveProfile.isPending}
                    >
                      保存资料
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'growth',
            label: '成长记录',
            children: (
              <Card
                title="成长记录"
                extra={
                  <Button icon={<PlusOutlined />} onClick={() => setGrowthModalOpen(true)}>
                    新增记录
                  </Button>
                }
              >
                <Table
                  rowKey="id"
                  columns={growthColumns}
                  dataSource={overview?.growthRecords ?? []}
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'birthdays',
            label: '生日合辑',
            children: (
              <Card
                title="后台创建每年的生日合辑"
                extra={
                  <Button icon={<PlusOutlined />} onClick={() => setBirthdayModalOpen(true)}>
                    新增生日
                  </Button>
                }
              >
                <Paragraph type="secondary">
                  移动端家人只能在已创建的年份中上传生日照片和祝福。
                </Paragraph>
                <Table
                  rowKey="id"
                  columns={birthdayColumns}
                  dataSource={overview?.birthdays ?? []}
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="新增成长记录"
        open={growthModalOpen}
        confirmLoading={createGrowthRecord.isPending}
        onCancel={() => setGrowthModalOpen(false)}
        onOk={() => growthForm.submit()}
      >
        <Form
          form={growthForm}
          layout="vertical"
          onFinish={async (values) => {
            await createGrowthRecord.mutateAsync(values);
            growthForm.resetFields();
            setGrowthModalOpen(false);
          }}
        >
          <Form.Item name="measuredAt" label="测量日期" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="weightKg" label="体重 kg">
            <InputNumber min={0.5} max={250} precision={2} />
          </Form.Item>
          <Form.Item name="heightCm" label="身高 cm">
            <InputNumber min={20} max={250} precision={1} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增生日合辑"
        open={birthdayModalOpen}
        confirmLoading={createBirthday.isPending}
        onCancel={() => setBirthdayModalOpen(false)}
        onOk={() => birthdayForm.submit()}
      >
        <Form
          form={birthdayForm}
          layout="vertical"
          onFinish={async (values) => {
            await createBirthday.mutateAsync(values);
            birthdayForm.resetFields();
            setBirthdayModalOpen(false);
          }}
        >
          <Form.Item name="year" label="年份" rules={[{ required: true }]}>
            <InputNumber min={1900} max={2100} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="例如：一周岁生日" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="写一点这次生日的记录" />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrap>
  );
}
