import type {
  InsurancePolicy,
  InsurancePolicyAttachment,
  InsurancePolicyType,
} from '@/features/insurance/types/insurance.types';

export const mobilePolicyTypeLabels: Record<InsurancePolicyType, string> = {
  medical: '医疗',
  critical_illness: '重疾',
  life: '寿险',
  accident: '意外',
  auto: '车险',
  home_property: '家财',
  travel: '旅行',
  other: '其他',
};

export const mobilePolicyTypeOptions = Object.entries(mobilePolicyTypeLabels).map(
  ([value, label]) => ({ value, label })
) as Array<{ value: InsurancePolicyType; label: string }>;

export function getPolicyMemberName(policy: InsurancePolicy) {
  return policy.member?.name || `成员 #${policy.memberId}`;
}

export function getPolicyOwnerName(policy: InsurancePolicy) {
  return (
    policy.ownerUser?.realName ||
    policy.ownerUser?.nickname ||
    policy.ownerUser?.username ||
    (policy.ownerUserId ? `用户 #${policy.ownerUserId}` : '-')
  );
}

export function getPolicyStatus(policy: InsurancePolicy) {
  const now = new Date();
  const endDate = policy.endDate ? new Date(policy.endDate) : null;
  if (endDate && endDate.getTime() < now.getTime()) {
    return { label: '已到期', color: 'danger' as const };
  }
  if (endDate && endDate.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000) {
    return { label: '即将到期', color: 'warning' as const };
  }
  return { label: '保障中', color: 'success' as const };
}

export function isPreviewableAttachment(attachment: InsurancePolicyAttachment) {
  const mimeType = attachment.file?.mimeType ?? '';
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}
