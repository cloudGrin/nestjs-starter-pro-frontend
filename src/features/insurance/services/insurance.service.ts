import axios from 'axios';
import { appConfig } from '@/shared/config/app.config';
import { request } from '@/shared/utils/request';
import type {
  DirectUploadInitResponse,
  FileEntity,
  FileStorage,
} from '@/features/file/types/file.types';
import type {
  CreateInsuranceMemberDto,
  CreateInsurancePolicyDto,
  InsuranceFamilyViewItem,
  InsuranceMember,
  InsurancePolicy,
  InsurancePolicyListResponse,
  QueryInsurancePoliciesParams,
  UpdateInsuranceMemberDto,
  UpdateInsurancePolicyDto,
} from '../types/insurance.types';

interface UploadInsuranceAttachmentOptions {
  storage?: FileStorage;
  onProgress?: (progress: number) => void;
}

const ATTACHMENTS_BASE_URL = '/insurance-policies/attachments';

async function uploadAttachmentMultipart(
  file: File,
  options?: UploadInsuranceAttachmentOptions
): Promise<FileEntity> {
  const formData = new FormData();
  formData.append('file', file);

  const uploaded = await request.post<FileEntity>(`${ATTACHMENTS_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    requestOptions: {
      messageConfig: {
        successMessage: '附件已上传',
      },
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (progressEvent.total && options?.onProgress) {
        options.onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });
  options?.onProgress?.(100);
  return uploaded;
}

async function uploadAttachmentDirect(
  file: File,
  options?: UploadInsuranceAttachmentOptions
): Promise<FileEntity> {
  const initResult = await request.post<DirectUploadInitResponse>(
    `${ATTACHMENTS_BASE_URL}/direct-upload/initiate`,
    {
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
    {
      requestOptions: {
        messageConfig: {
          successMessage: false,
        },
      },
    }
  );

  await axios.put(initResult.uploadUrl, file, {
    headers: initResult.headers,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && options?.onProgress) {
        options.onProgress(Math.round((progressEvent.loaded * 95) / progressEvent.total));
      }
    },
  });

  const uploaded = await request.post<FileEntity>(
    `${ATTACHMENTS_BASE_URL}/direct-upload/complete`,
    { uploadToken: initResult.uploadToken },
    {
      requestOptions: {
        messageConfig: {
          successMessage: '附件已上传',
        },
      },
    }
  );
  options?.onProgress?.(100);
  return uploaded;
}

export const insuranceService = {
  getMembers: () => request.get<InsuranceMember[]>('/insurance-members'),

  createMember: (data: CreateInsuranceMemberDto) =>
    request.post<InsuranceMember>('/insurance-members', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '成员已创建',
        },
      },
    }),

  updateMember: (id: number, data: UpdateInsuranceMemberDto) =>
    request.put<InsuranceMember>(`/insurance-members/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '成员已更新',
        },
      },
    }),

  deleteMember: (id: number) =>
    request.delete<void>(`/insurance-members/${id}`, {
      requestOptions: {
        confirmConfig: {
          title: '删除成员',
          message: '删除前请确认该成员下没有保单。确定要删除这个成员吗？',
        },
        messageConfig: {
          successMessage: '成员已删除',
        },
      },
    }),

  getPolicies: (params: QueryInsurancePoliciesParams) =>
    request.get<InsurancePolicyListResponse>('/insurance-policies', { params }),

  getFamilyView: () => request.get<InsuranceFamilyViewItem[]>('/insurance-policies/family-view'),

  getPolicy: (id: number) => request.get<InsurancePolicy>(`/insurance-policies/${id}`),

  createPolicy: (data: CreateInsurancePolicyDto) =>
    request.post<InsurancePolicy>('/insurance-policies', data, {
      requestOptions: {
        messageConfig: {
          successMessage: '保单已创建',
        },
      },
    }),

  updatePolicy: (id: number, data: UpdateInsurancePolicyDto) =>
    request.put<InsurancePolicy>(`/insurance-policies/${id}`, data, {
      requestOptions: {
        messageConfig: {
          successMessage: '保单已更新',
        },
      },
    }),

  deletePolicy: (id: number) =>
    request.delete<void>(`/insurance-policies/${id}`, {
      requestOptions: {
        confirmConfig: {
          title: '删除保单',
          message: '删除后不可恢复，确定要删除这份保单吗？',
        },
        messageConfig: {
          successMessage: '保单已删除',
        },
      },
    }),

  uploadAttachment: (file: File, options?: UploadInsuranceAttachmentOptions) => {
    const storage = options?.storage ?? appConfig.insuranceAttachmentUploadMode;
    return storage === 'oss'
      ? uploadAttachmentDirect(file, options)
      : uploadAttachmentMultipart(file, options);
  },

  getAttachmentDownloadUrl: (policyId: number, fileId: number) => {
    const base = appConfig.apiBaseUrl.endsWith('/')
      ? appConfig.apiBaseUrl.slice(0, -1)
      : appConfig.apiBaseUrl;
    return `${base}/insurance-policies/${policyId}/attachments/${fileId}/download`;
  },
};
