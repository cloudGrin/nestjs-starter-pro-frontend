/**
 * 分片上传组件（用于大文件）
 */

import { useState } from 'react';
import { Upload, Progress, Button, Space } from 'antd';
import { InboxOutlined, CloudUploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import SparkMD5 from 'spark-md5';
import { useUploadChunk } from '../hooks/useFiles';
import { CHUNK_SIZE } from '../types/file.types';
import type { FileModule, UploadChunkDto } from '../types/file.types';
import { useApp } from '@/shared/hooks';

const { Dragger } = Upload;

interface ChunkUploaderProps {
  module?: FileModule;
  accept?: string;
  chunkSize?: number;
  onSuccess?: (fileId: number, fileUrl: string) => void;
  onError?: (error: Error | unknown) => void;
  onProgress?: (progress: number) => void;
}

export const ChunkUploader: React.FC<ChunkUploaderProps> = ({
  module,
  accept,
  chunkSize = CHUNK_SIZE,
  onSuccess,
  onError,
  onProgress,
}) => {
  const { message } = useApp();
  const { mutate: uploadChunk } = useUploadChunk();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 计算文件MD5
   */
  const calculateFileMD5 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const blobSlice = File.prototype.slice;
      const chunkSize = 2097152; // 2MB chunks for MD5 calculation
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();

      fileReader.onload = function (e) {
        spark.append(e.target?.result as ArrayBuffer);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      fileReader.onerror = function () {
        reject(new Error('MD5计算失败'));
      };

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }

      loadNext();
    });
  };

  /**
   * 处理文件选择
   */
  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    setSelectedFile(file);
    return false; // 阻止自动上传
  };

  /**
   * 开始分片上传
   */
  const handleStartUpload = async () => {
    if (!selectedFile) {
      message.error('请先选择文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 计算文件MD5
      message.loading({ content: '正在计算文件哈希...', key: 'md5', duration: 0 });
      const hash = await calculateFileMD5(selectedFile);
      message.destroy('md5');

      // 生成uploadId
      const newUploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 计算分片数量
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);

      message.info(`开始上传，共 ${totalChunks} 个分片`);

      // 上传每个分片
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        const params: UploadChunkDto = {
          chunk,
          uploadId: newUploadId,
          chunkIndex: i,
          totalChunks,
          chunkSize,
          totalSize: selectedFile.size,
          filename: selectedFile.name,
          hash,
          module,
        };

        // 上传分片
        await new Promise((resolve, reject) => {
          uploadChunk(params, {
            onSuccess: (data) => {
              const progress = Math.round(((i + 1) / totalChunks) * 100);
              setUploadProgress(progress);
              onProgress?.(progress);

              if (data.completed && data.file) {
                message.success('文件上传完成');
                onSuccess?.(data.file.id, data.file.url);
              }
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          });
        });
      }

      setSelectedFile(null);
      setUploading(false);
      setUploadProgress(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';
      message.error(errorMessage);
      onError?.(error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * 取消上传
   */
  const handleCancel = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple={false}
        beforeUpload={handleBeforeUpload}
        accept={accept}
        disabled={uploading}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域</p>
        <p className="ant-upload-hint">支持大文件分片上传，适用于视频、大型文档等</p>
      </Dragger>

      {selectedFile && !uploading && (
        <div className="mt-4">
          <Space>
            <span>已选择文件: {selectedFile.name}</span>
            <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleStartUpload}>
              开始上传
            </Button>
            <Button onClick={handleCancel}>取消</Button>
          </Space>
        </div>
      )}

      {uploading && uploadProgress >= 0 && (
        <div className="mt-4">
          <Progress percent={uploadProgress} status="active" />
          <p className="text-gray-500 mt-2">正在上传... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};
