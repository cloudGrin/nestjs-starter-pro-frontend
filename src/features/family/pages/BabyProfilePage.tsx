import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  Avatar,
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
  Upload,
  Slider,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageWrap } from '@/shared/components';
import {
  AVATAR_CROP_SIZE,
  AVATAR_MAX_SCALE,
  AVATAR_MIN_SCALE,
  clampCropOffset,
  cropAvatarFile,
  getAvatarPreviewMetrics,
  loadImageFromUrl,
  resizeAvatarCropState,
  rotateAvatarCropState,
  type AvatarCropState,
} from '@/shared/utils/avatarCrop';
import { formatDate } from '@/shared/utils';
import {
  useBabyOverview,
  useCreateBabyBirthday,
  useCreateBabyGrowthRecord,
  useDeleteBabyBirthday,
  useDeleteBabyGrowthRecord,
  useSaveBabyProfile,
} from '../hooks/useFamily';
import { familyService } from '../services/family.service';
import type {
  BabyBirthday,
  BabyGrowthRecord,
  SaveBabyProfileDto,
  CreateBabyBirthdayDto,
  CreateBabyGrowthRecordDto,
} from '../types/family.types';

const { Paragraph, Text } = Typography;

interface AvatarCropDraft extends AvatarCropState {
  file: File;
  previewUrl: string;
}

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
  const avatarCropFrameRef = useRef<HTMLDivElement>(null);
  const avatarCropDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [growthModalOpen, setGrowthModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [avatarCropDraft, setAvatarCropDraft] = useState<AvatarCropDraft | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{
    type: 'secondary' | 'danger';
    text: string;
  } | null>(null);
  const overview = overviewQuery.data;
  const avatarCropPreviewUrl = avatarCropDraft?.previewUrl;

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
    setAvatarPreviewUrl(overview.profile.avatarUrl ?? null);
    setAvatarFeedback(null);
  }, [overview?.profile, profileForm]);

  useEffect(() => {
    return () => {
      if (avatarCropPreviewUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(avatarCropPreviewUrl);
      }
    };
  }, [avatarCropPreviewUrl]);

  useEffect(() => {
    if (!avatarCropPreviewUrl) return;

    const updateCropFrameSize = () => {
      const size = getMeasuredAvatarCropFrameSize();
      if (size > 0) {
        setAvatarCropDraft((draft) => (draft ? resizeAvatarCropState(draft, size) : draft));
      }
    };

    updateCropFrameSize();
    window.addEventListener('resize', updateCropFrameSize);
    return () => window.removeEventListener('resize', updateCropFrameSize);
  }, [avatarCropPreviewUrl]);

  const avatarFallbackText = overview?.profile?.nickname?.trim().slice(0, 1) || '宝';

  const handleAvatarFileSelected = async (file: File) => {
    const isImage =
      file.type.startsWith('image/') || /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(file.name);

    if (!isImage) {
      setAvatarFeedback({ type: 'danger', text: '请选择图片文件作为宝宝头像' });
      return;
    }

    if (typeof URL.createObjectURL !== 'function') {
      setAvatarFeedback({ type: 'danger', text: '当前浏览器不支持头像裁剪' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageFromUrl(previewUrl);
      setAvatarFeedback(null);
      setAvatarCropDraft({
        file,
        previewUrl,
        imageWidth: image.naturalWidth || image.width,
        imageHeight: image.naturalHeight || image.height,
        cropSize: AVATAR_CROP_SIZE,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      });
    } catch {
      URL.revokeObjectURL(previewUrl);
      setAvatarFeedback({ type: 'danger', text: '图片读取失败，请重新选择' });
    }
  };

  const closeAvatarCropModal = (options?: { force?: boolean }) => {
    if (avatarUploading && !options?.force) return;

    avatarCropDragRef.current = null;
    setAvatarCropDraft(null);
  };

  const getMeasuredAvatarCropFrameSize = () => {
    const rect = avatarCropFrameRef.current?.getBoundingClientRect();
    return rect ? Math.floor(Math.min(rect.width, rect.height)) : 0;
  };

  const updateAvatarCropOffset = (offsetX: number, offsetY: number) => {
    if (avatarUploading) return;

    setAvatarCropDraft((draft) => {
      if (!draft) return draft;
      return {
        ...draft,
        ...clampCropOffset(offsetX, offsetY, draft),
      };
    });
  };

  const updateAvatarCropScale = (scale: number) => {
    if (avatarUploading) return;

    setAvatarCropDraft((draft) => {
      if (!draft) return draft;
      const nextDraft = { ...draft, scale: clampValue(scale, AVATAR_MIN_SCALE, AVATAR_MAX_SCALE) };
      return {
        ...nextDraft,
        ...clampCropOffset(nextDraft.offsetX, nextDraft.offsetY, nextDraft),
      };
    });
  };

  const rotateAvatarCrop = (rotationDelta: number) => {
    if (avatarUploading) return;

    setAvatarCropDraft((draft) => (draft ? rotateAvatarCropState(draft, rotationDelta) : draft));
  };

  const resetAvatarCrop = () => {
    if (avatarUploading) return;

    setAvatarCropDraft((draft) =>
      draft
        ? {
            ...draft,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
          }
        : draft
    );
  };

  const handleAvatarCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!avatarCropDraft || avatarUploading) return;

    avatarCropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: avatarCropDraft.offsetX,
      offsetY: avatarCropDraft.offsetY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleAvatarCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!avatarCropDragRef.current || avatarUploading) return;
    if (avatarCropDragRef.current.pointerId !== event.pointerId) return;

    updateAvatarCropOffset(
      avatarCropDragRef.current.offsetX + event.clientX - avatarCropDragRef.current.startX,
      avatarCropDragRef.current.offsetY + event.clientY - avatarCropDragRef.current.startY
    );
  };

  const handleAvatarCropPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    avatarCropDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleAvatarCropSave = async () => {
    if (!avatarCropDraft || avatarUploading) return;

    setAvatarUploading(true);
    setAvatarFeedback(null);
    try {
      const measuredCropSize = getMeasuredAvatarCropFrameSize();
      const cropState =
        measuredCropSize > 0
          ? resizeAvatarCropState(avatarCropDraft, measuredCropSize)
          : avatarCropDraft;
      const croppedFile = await cropAvatarFile(
        avatarCropDraft.file,
        avatarCropDraft.previewUrl,
        cropState
      );
      const uploaded = await familyService.uploadBabyAvatarImage(croppedFile);
      const previewUrl = URL.createObjectURL(croppedFile);
      profileForm.setFieldValue('avatarFileId', uploaded.id);
      setAvatarPreviewUrl(previewUrl);
      setAvatarFeedback({ type: 'secondary', text: '已选择新头像，保存资料后生效' });
      closeAvatarCropModal({ force: true });
    } catch {
      setAvatarFeedback({ type: 'danger', text: '头像裁剪或上传失败，请稍后重试' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    profileForm.setFieldValue('avatarFileId', null);
    setAvatarPreviewUrl(null);
    setAvatarFeedback({ type: 'secondary', text: '已移除头像，保存资料后生效' });
  };

  const avatarCropMetrics = avatarCropDraft ? getAvatarPreviewMetrics(avatarCropDraft) : null;
  const avatarCropImageLayerStyle = avatarCropDraft
    ? {
        transform: `translate(-50%, -50%) translate(${avatarCropDraft.offsetX}px, ${avatarCropDraft.offsetY}px) rotate(${avatarCropDraft.rotation}deg)`,
      }
    : undefined;
  const avatarCropImageStyle = avatarCropMetrics
    ? {
        width: avatarCropMetrics.imageWidth,
        height: avatarCropMetrics.imageHeight,
      }
    : undefined;

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
                      <Avatar size={72} src={overview.profile.avatarUrl ?? undefined}>
                        {avatarFallbackText}
                      </Avatar>
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
                  <Form.Item name="avatarFileId" hidden>
                    <InputNumber />
                  </Form.Item>
                  <Form.Item label="宝宝头像">
                    <Space size="middle" wrap>
                      <Avatar size={64} src={avatarPreviewUrl ?? undefined}>
                        {avatarFallbackText}
                      </Avatar>
                      <Upload
                        accept="image/*"
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={(file) => {
                          void handleAvatarFileSelected(file);
                          return false;
                        }}
                      >
                        <Button icon={<UploadOutlined />} loading={avatarUploading}>
                          上传头像
                        </Button>
                      </Upload>
                      {avatarPreviewUrl || profileForm.getFieldValue('avatarFileId') ? (
                        <Button onClick={handleAvatarRemove}>移除头像</Button>
                      ) : null}
                    </Space>
                    {avatarFeedback ? (
                      <div className="mt-2">
                        <Text type={avatarFeedback.type}>{avatarFeedback.text}</Text>
                      </div>
                    ) : null}
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
                      disabled={avatarUploading}
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
        title="裁剪宝宝头像"
        open={!!avatarCropDraft}
        onCancel={() => closeAvatarCropModal()}
        maskClosable={!avatarUploading}
        footer={[
          <Button key="reset" disabled={avatarUploading} onClick={resetAvatarCrop}>
            重置
          </Button>,
          <Button key="cancel" disabled={avatarUploading} onClick={() => closeAvatarCropModal()}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={avatarUploading}
            disabled={!avatarCropDraft || avatarUploading}
            onClick={() => void handleAvatarCropSave()}
          >
            保存头像
          </Button>,
        ]}
      >
        {avatarCropDraft ? (
          <div className="flex flex-col items-center gap-5">
            <div
              ref={avatarCropFrameRef}
              className="relative mx-auto aspect-square w-full max-w-[320px] touch-none overflow-hidden rounded-full border border-dashed border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-950"
              onPointerDown={handleAvatarCropPointerDown}
              onPointerMove={handleAvatarCropPointerMove}
              onPointerUp={handleAvatarCropPointerEnd}
              onPointerCancel={handleAvatarCropPointerEnd}
            >
              <div
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={avatarCropImageLayerStyle}
              >
                <img
                  src={avatarCropDraft.previewUrl}
                  alt="宝宝头像预览"
                  className="block max-w-none select-none"
                  draggable={false}
                  style={avatarCropImageStyle}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/90 shadow-inner" />
            </div>

            <div className="w-full max-w-md">
              <Text type="secondary">缩放</Text>
              <Slider
                min={AVATAR_MIN_SCALE}
                max={AVATAR_MAX_SCALE}
                step={0.01}
                value={avatarCropDraft.scale}
                disabled={avatarUploading}
                onChange={(value) => updateAvatarCropScale(Number(value))}
              />
            </div>

            <Space wrap>
              <Button
                icon={<RotateLeftOutlined />}
                disabled={avatarUploading}
                onClick={() => rotateAvatarCrop(-90)}
              >
                左旋
              </Button>
              <Button
                icon={<RotateRightOutlined />}
                disabled={avatarUploading}
                onClick={() => rotateAvatarCrop(90)}
              >
                右旋
              </Button>
            </Space>
          </div>
        ) : null}
      </Modal>

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

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
