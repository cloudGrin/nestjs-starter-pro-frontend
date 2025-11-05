/**
 * 文件上传组件（简单直传）
 */

import { useState } from 'react';
import { Upload, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FILE_SIZE_LIMITS } from '../types/file.types';
import type { FileModule } from '../types/file.types';
import { useApp } from '@/shared/hooks';

const { Dragger } = Upload;

interface FileUploaderProps {
  module?: FileModule;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onSuccess?: (fileId: number, fileUrl: string) => void;
  onError?: (error: Error | unknown) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  module,
  accept,
  maxSize = FILE_SIZE_LIMITS.default,
  multiple = false,
  onSuccess,
  onError,
}) => {
  const { message } = useApp();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file } = options;

    // 检查文件大小
    if ((file as File).size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
      message.error(`文件大小不能超过 ${maxSizeMB} MB`);
      onError?.(`文件大小超过限制: ${maxSizeMB} MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadFileWithProgress(file as File);
      message.success('文件上传成功');
      onSuccess?.(response.id, response.url);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';
      message.error(errorMessage);
      onError?.(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFileWithProgress = (file: File): Promise<{ id: number; url: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (module) formData.append('module', module);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(xhr.statusText));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('上传失败'));
      });

      const token = localStorage.getItem('accessToken');
      xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple={multiple}
        customRequest={handleUpload}
        accept={accept}
        disabled={uploading}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传。最大文件大小: {(maxSize / 1024 / 1024).toFixed(2)} MB
        </p>
      </Dragger>

      {uploading && uploadProgress > 0 && (
        <div className="mt-4">
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}
    </div>
  );
};
