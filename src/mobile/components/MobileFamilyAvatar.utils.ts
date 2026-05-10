import type { FamilyUserSummary } from '@/features/family/types/family.types';

export type MobileFamilyAvatarSize = 'regular' | 'small' | 'mini';

export function getFamilyUserDisplayName(user?: FamilyUserSummary | null) {
  return user?.nickname || user?.realName || user?.username || '家人';
}

export function getFamilyAvatarInitial(user?: FamilyUserSummary | null) {
  return getFamilyUserDisplayName(user).slice(0, 1).toUpperCase();
}
