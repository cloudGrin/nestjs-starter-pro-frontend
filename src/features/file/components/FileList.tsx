/**
 * 文件列表页面
 */

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Image,
  Tooltip,
  Upload,
  Form,
  message as antdMessage,
  Alert,
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '@/shared/utils';
import { useFiles, useDeleteFile, useDeleteFiles, useDownloadFile, useUploadFile } from '../hooks/useFiles';
import type { FileEntity, FileModule } from '../types/file.types';
import { FILE_SIZE_LIMITS } from '../types/file.types';
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

export const FileList: React.FC = () => {

  // 搜索参数
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [module, setModule] = useState<FileModule | undefined>(undefined);

  // 批量选择
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 查询文件列表
  const { data, isLoading, refetch } = useFiles({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    module,
  });

  // Mutations
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutate: deleteFiles, isPending: isBatchDeleting } = useDeleteFiles();
  const { mutate: downloadFile } = useDownloadFile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  // 预览图片
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  /**
   * 处理搜索
   */
  const handleSearch = (values: Record<string, unknown>) => {
    setKeyword(values.keyword as string);
    setModule(values.module as FileModule);
    setPage(1);
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    setKeyword('');
    setModule(undefined);
    setPage(1);
  };

  /**
   * 处理删除文件
   */
  const handleDelete = (id: number) => {
    deleteFile(id);
  };

  /**
   * 处理批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      antdMessage.warning('请先选择要删除的文件');
      return;
    }
    deleteFiles(selectedRowKeys, {
      onSuccess: () => {
        setSelectedRowKeys([]);
      },
    });
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
      setPreviewImage(record.url);
      setPreviewVisible(true);
    } else {
      antdMessage.info('该文件类型不支持预览');
    }
  };

  /**
   * 处理上传文件
   */
  const handleUpload = (file: File) => {
    if (file.size > FILE_SIZE_LIMITS.default) {
      antdMessage.error(`文件大小不能超过 ${formatFileSize(FILE_SIZE_LIMITS.default)}`);
      return false;
    }

    uploadFile({ file, options: { module, isPublic: false } });
    return false; // 阻止自动上传
  };

  // 表格列定义
  const columns: ColumnsType<FileEntity> = [
    {
      title: '文件',
      dataIndex: 'originalName',
      key: 'originalName',
      width: 300,
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
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module) => (module ? <Tag>{module}</Tag> : '-'),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string) => {
        // 数据库存储为逗号分隔的字符串，需要分割成数组
        const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
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
      render: (uploader) =>
        uploader ? uploader.nickname || uploader.username : '-',
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
      width: 180,
      render: (_, record) => (
        <TableActions
          actions={[
            ...(record.mimeType.startsWith('image/')
              ? [
                  {
                    label: '预览',
                    icon: <EyeOutlined />,
                    onClick: () => handlePreview(record),
                  },
                ]
              : []),
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
            <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
              <Button type="primary" icon={<UploadOutlined />} loading={isUploading}>
                上传文件
              </Button>
            </Upload>
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
              <Select.Option value="user-avatar">用户头像</Select.Option>
              <Select.Option value="document">文档</Select.Option>
              <Select.Option value="image">图片</Select.Option>
              <Select.Option value="video">视频</Select.Option>
              <Select.Option value="audio">音频</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
        </SearchForm>
      }
    >
      {/* 批量操作提示 */}
      {selectedRowKeys.length > 0 && (
        <Alert
          message={
            <Space>
              <span>已选择 {selectedRowKeys.length} 个文件</span>
              <PermissionGuard permissions={['file:delete']}>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={handleBatchDelete}
                  loading={isBatchDeleting}
                >
                  批量删除
                </Button>
              </PermissionGuard>
              <Button type="link" size="small" onClick={() => setSelectedRowKeys([])}>
                取消选择
              </Button>
            </Space>
          }
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1200 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
          preserveSelectedRowKeys: true,
        }}
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
