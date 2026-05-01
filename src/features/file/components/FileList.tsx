/**
 * 文件列表页面
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Switch,
  Tag,
  Image,
  Tooltip,
  Upload,
  Form,
  Modal,
  Progress,
  message as antdMessage,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  CopyOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '@/shared/utils';
import {
  useFiles,
  useDeleteFile,
  useDownloadFile,
  useUploadFile,
  useCreateFileAccessLink,
  useFileStorageOptions,
} from '../hooks/useFiles';
import type { FileEntity, FileModule, FileStorage, FileStorageOption } from '../types/file.types';
import { FILE_SIZE_LIMITS } from '../types/file.types';
import { resolveFileAccessUrl } from '../utils/file-url';
import { PermissionGuard } from '@/shared/components/auth/PermissionGuard';
import { PageWrap } from '@/shared/components/layouts/PageWrap';
import { SearchForm } from '@/shared/components/search/SearchForm';
import { TableActions } from '@/shared/components/table/TableActions';

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * 根据MIME类型获取文件图标
 */
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <FileImageOutlined style={{ fontSize: 24 }} />;
  if (mimeType.startsWith('video/')) return <VideoCameraOutlined style={{ fontSize: 24 }} />;
  if (mimeType.startsWith('text/')) return <FileTextOutlined style={{ fontSize: 24 }} />;
  if (mimeType === 'application/pdf') return <FilePdfOutlined style={{ fontSize: 24 }} />;
  if (mimeType.includes('zip') || mimeType.includes('rar'))
    return <FileZipOutlined style={{ fontSize: 24 }} />;
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
    return <FileExcelOutlined style={{ fontSize: 24 }} />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileWordOutlined style={{ fontSize: 24 }} />;
  return <FileOutlined style={{ fontSize: 24 }} />;
};

const FILE_MODULE_OPTIONS = [
  { value: 'user-avatar', label: '用户头像' },
  { value: 'document', label: '文档' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'other', label: '其他' },
] as const;

const FILE_CATEGORY_OPTIONS = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'document', label: '文档' },
  { value: 'archive', label: '压缩包' },
  { value: 'other', label: '其他' },
] as const;

const LOCAL_FILE_STORAGE_OPTIONS = [
  { value: 'local', label: '本地存储' },
] satisfies FileStorageOption[];

export const FileList: React.FC = () => {
  // 搜索参数
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [module, setModule] = useState<FileModule | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [storage, setStorage] = useState<FileStorage | undefined>(undefined);
  const [isPublic, setIsPublic] = useState<boolean | undefined>(undefined);

  const { data: storageOptionsData } = useFileStorageOptions();
  const availableStorageOptions = storageOptionsData?.options?.length
    ? storageOptionsData.options
    : LOCAL_FILE_STORAGE_OPTIONS;
  const defaultUploadStorage = storageOptionsData?.defaultStorage ?? 'local';

  // 查询文件列表
  const { data, isLoading, refetch } = useFiles({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    module,
    category,
    storage,
    isPublic,
  });

  // Mutations
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutate: downloadFile } = useDownloadFile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: createAccessLink, isPending: isCreatingAccessLink } = useCreateFileAccessLink();

  // 预览图片
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 上传表单
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadModule, setUploadModule] = useState<FileModule | undefined>(module);
  const [uploadStorage, setUploadStorage] = useState<FileStorage>(defaultUploadStorage);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadIsPublic, setUploadIsPublic] = useState(false);
  const [uploadRemark, setUploadRemark] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setUploadStorage(defaultUploadStorage);
  }, [defaultUploadStorage]);

  /**
   * 处理搜索
   */
  const handleSearch = (values: Record<string, unknown>) => {
    setKeyword(values.keyword as string);
    setModule(values.module as FileModule);
    setCategory(values.category as string);
    setStorage(values.storage as FileStorage);
    setIsPublic(values.isPublic === undefined ? undefined : values.isPublic === 'true');
    setPage(1);
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    setKeyword('');
    setModule(undefined);
    setCategory(undefined);
    setStorage(undefined);
    setIsPublic(undefined);
    setPage(1);
  };

  /**
   * 处理删除文件
   */
  const handleDelete = (id: number) => {
    deleteFile(id);
  };

  /**
   * 处理下载文件
   */
  const handleDownload = (record: FileEntity) => {
    downloadFile({ id: record.id, filename: record.originalName });
  };

  /**
   * 处理预览图片
   */
  const handlePreview = (record: FileEntity) => {
    if (record.mimeType.startsWith('image/')) {
      if (record.isPublic && record.url) {
        setPreviewImage(resolveFileAccessUrl(record.url));
        setPreviewVisible(true);
        return;
      }

      createAccessLink(
        { id: record.id, disposition: 'inline' },
        {
          onSuccess: ({ url }) => {
            setPreviewImage(resolveFileAccessUrl(url));
            setPreviewVisible(true);
          },
        }
      );
    } else {
      antdMessage.info('该文件类型不支持预览');
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(resolveFileAccessUrl(url));
      antdMessage.success('链接已复制');
    } catch {
      antdMessage.error('复制失败，请手动复制链接');
    }
  };

  const handleCopyLink = (record: FileEntity) => {
    if (record.isPublic && record.url) {
      void copyUrl(record.url);
      return;
    }

    createAccessLink(
      { id: record.id, disposition: 'inline' },
      {
        onSuccess: ({ url }) => {
          void copyUrl(url);
        },
      }
    );
  };

  /**
   * 选择上传文件
   */
  const handleSelectUploadFile = (file: File) => {
    if (file.size > FILE_SIZE_LIMITS.default) {
      antdMessage.error(`文件大小不能超过 ${formatFileSize(FILE_SIZE_LIMITS.default)}`);
      return false;
    }

    setSelectedUploadFile(file);
    return false; // 阻止自动上传
  };

  const resetUploadState = () => {
    setSelectedUploadFile(null);
    setUploadModule(module);
    setUploadStorage(defaultUploadStorage);
    setUploadTags([]);
    setUploadIsPublic(false);
    setUploadRemark('');
    setUploadProgress(0);
  };

  const handleSubmitUpload = () => {
    if (!selectedUploadFile) {
      antdMessage.warning('请选择要上传的文件');
      return;
    }

    uploadFile(
      {
        file: selectedUploadFile,
        options: {
          storage: uploadStorage,
          module: uploadModule,
          tags:
            uploadTags
              .map((tag) => tag.trim())
              .filter(Boolean)
              .join(',') || undefined,
          isPublic: uploadIsPublic,
          remark: uploadRemark.trim() || undefined,
          onProgress: setUploadProgress,
        },
      },
      {
        onSuccess: () => {
          setUploadModalOpen(false);
          resetUploadState();
        },
      }
    );
  };

  // 表格列定义
  const columns: ColumnsType<FileEntity> = [
    {
      title: '文件',
      dataIndex: 'originalName',
      key: 'originalName',
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <Space>
          {getFileIcon(record.mimeType)}
          <Tooltip title={text}>
            <span className="truncate max-w-[200px]">{text}</span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size) => formatFileSize(size),
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'mimeType',
      width: 150,
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (value: string) => {
        const option = FILE_CATEGORY_OPTIONS.find((item) => item.value === value);
        return option?.label || value || '-';
      },
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module) => (module ? <Tag>{module}</Tag> : '-'),
    },
    {
      title: '公开',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 90,
      render: (value: boolean) =>
        value ? <Tag color="green">公开</Tag> : <Tag color="default">私有</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string) => {
        // 数据库存储为逗号分隔的字符串，需要分割成数组
        const tagArray = tags
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
        return tagArray.length > 0 ? (
          <Space>
            {tagArray.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        ) : (
          '-'
        );
      },
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 120,
      render: (uploader) => (uploader ? uploader.nickname || uploader.username : '-'),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: formatDate.full,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 270,
      render: (_, record) => (
        <TableActions
          actions={[
            ...(record.mimeType.startsWith('image/')
              ? [
                  {
                    label: '预览',
                    icon: <EyeOutlined />,
                    onClick: () => handlePreview(record),
                    loading: isCreatingAccessLink,
                  },
                ]
              : []),
            {
              label: '复制链接',
              icon: <CopyOutlined />,
              onClick: () => handleCopyLink(record),
              permission: record.isPublic && record.url ? undefined : 'file:download',
            },
            {
              label: '下载',
              icon: <DownloadOutlined />,
              onClick: () => handleDownload(record),
              permission: 'file:download',
            },
            {
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => handleDelete(record.id),
              danger: true,
              permission: 'file:delete',
              disabled: isDeleting,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageWrap
      title="文件管理"
      titleRight={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <PermissionGuard permissions={['file:upload']}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={isUploading}
              onClick={() => {
                resetUploadState();
                setUploadModalOpen(true);
              }}
            >
              上传文件
            </Button>
          </PermissionGuard>
        </Space>
      }
      header={
        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <Form.Item name="keyword" label="文件名">
            <Input placeholder="请输入文件名" allowClear />
          </Form.Item>
          <Form.Item name="module" label="模块">
            <Select placeholder="选择模块" allowClear>
              {FILE_MODULE_OPTIONS.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="类别">
            <Select placeholder="选择类别" allowClear>
              {FILE_CATEGORY_OPTIONS.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="storage" label="存储">
            <Select placeholder="选择存储" allowClear>
              {availableStorageOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isPublic" label="公开状态">
            <Select placeholder="选择公开状态" allowClear>
              <Select.Option value="true">公开文件</Select.Option>
              <Select.Option value="false">私有文件</Select.Option>
            </Select>
          </Form.Item>
        </SearchForm>
      }
    >
      {/* 表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个文件`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
        />
      </Card>

      <Modal
        title="上传文件"
        open={uploadModalOpen}
        onOk={handleSubmitUpload}
        onCancel={() => {
          setUploadModalOpen(false);
          resetUploadState();
        }}
        okText="上传"
        cancelText="取消"
        okButtonProps={{ loading: isUploading }}
      >
        <Form layout="vertical">
          <Form.Item label="文件">
            <Upload.Dragger
              beforeUpload={handleSelectUploadFile}
              showUploadList={false}
              maxCount={1}
              disabled={isUploading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">选择文件</p>
              {selectedUploadFile ? (
                <Tag color="blue">{selectedUploadFile.name}</Tag>
              ) : (
                <p className="ant-upload-hint">最大 {formatFileSize(FILE_SIZE_LIMITS.default)}</p>
              )}
            </Upload.Dragger>
          </Form.Item>
          {availableStorageOptions.length > 1 ? (
            <Form.Item label="存储">
              <Select
                data-testid="upload-storage-selector"
                value={uploadStorage}
                onChange={(value) => setUploadStorage(value)}
              >
                {availableStorageOptions.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item label="模块">
            <Select
              placeholder="选择模块"
              allowClear
              value={uploadModule}
              onChange={(value) => setUploadModule(value)}
            >
              {FILE_MODULE_OPTIONS.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="标签">
            <Select
              mode="tags"
              data-testid="upload-tags-selector"
              placeholder="输入标签后回车创建"
              tokenSeparators={[',', '，']}
              value={uploadTags}
              onChange={(values) => setUploadTags(values)}
            />
          </Form.Item>
          <Form.Item label="公开访问">
            <Switch checked={uploadIsPublic} onChange={setUploadIsPublic} />
          </Form.Item>
          <Form.Item label="备注">
            <Input
              placeholder="可选"
              value={uploadRemark}
              onChange={(event) => setUploadRemark(event.target.value)}
            />
          </Form.Item>
          {isUploading && uploadProgress > 0 ? <Progress percent={uploadProgress} /> : null}
        </Form>
      </Modal>

      {/* 图片预览 */}
      <Image
        preview={{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          src: previewImage,
        }}
        style={{ display: 'none' }}
      />
    </PageWrap>
  );
};
