import type { FileEntity } from '@/features/file/types/file.types';

export type InsurancePolicyType =
  | 'medical'
  | 'critical_illness'
  | 'life'
  | 'accident'
  | 'auto'
  | 'home_property'
  | 'travel'
  | 'other';

export type InsurancePolicySortField =
  | 'createdAt'
  | 'updatedAt'
  | 'endDate'
  | 'nextPaymentDate'
  | 'name';

export type InsuranceSortOrder = 'ASC' | 'DESC';

export interface InsuranceMember {
  id: number;
  name: string;
  relationship?: string | null;
  linkedUserId?: number | null;
  remark?: string | null;
  sort: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurancePolicyAttachment {
  id: number;
  policyId: number;
  fileId: number;
  sort: number;
  file?: FileEntity;
}

export interface InsurancePolicyReminder {
  id: number;
  policyId: number;
  reminderType: 'expiry_30d' | 'expiry_7d' | 'payment_7d' | 'payment_due';
  remindDate: string;
  recipientUserId: number;
  sentAt?: string | null;
  notificationId?: number | null;
  lastError?: string | null;
}

export interface InsurancePolicy {
  id: number;
  name: string;
  company?: string | null;
  policyNo?: string | null;
  memberId: number;
  member?: InsuranceMember;
  type: InsurancePolicyType;
  effectiveDate?: string | null;
  endDate?: string | null;
  nextPaymentDate?: string | null;
  paymentAmount?: string | number | null;
  ownerUserId?: number;
  ownerUser?: {
    id: number;
    username: string;
    nickname?: string | null;
    realName?: string | null;
  };
  remark?: string | null;
  attachments?: InsurancePolicyAttachment[];
  reminders?: InsurancePolicyReminder[];
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePolicyListResponse {
  items: InsurancePolicy[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface QueryInsurancePoliciesParams {
  page?: number;
  limit?: number;
  memberId?: number;
  type?: InsurancePolicyType;
  keyword?: string;
  sort?: InsurancePolicySortField;
  order?: InsuranceSortOrder;
  includeReminders?: boolean;
}

export interface CreateInsuranceMemberDto {
  name: string;
  relationship?: string | null;
  linkedUserId?: number | null;
  remark?: string | null;
  sort?: number;
}

export type UpdateInsuranceMemberDto = Partial<CreateInsuranceMemberDto>;

export interface CreateInsurancePolicyDto {
  name: string;
  company?: string | null;
  policyNo?: string | null;
  memberId: number;
  type: InsurancePolicyType;
  effectiveDate?: string | null;
  endDate?: string | null;
  nextPaymentDate?: string | null;
  paymentAmount?: number | null;
  ownerUserId?: number;
  remark?: string | null;
  attachmentFileIds?: number[];
}

export type UpdateInsurancePolicyDto = Partial<CreateInsurancePolicyDto>;

export interface InsuranceFamilyViewItem {
  member: InsuranceMember;
  policies: InsurancePolicy[];
  policyCount: number;
  nearestEndDate?: string | null;
  nearestPaymentDate?: string | null;
}
