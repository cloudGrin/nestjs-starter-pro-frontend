import type { FamilyUserSummary } from '@/features/family/types/family.types';

export type MobileFamilyAvatarSize = 'regular' | 'small' | 'mini';

export function getFamilyUserDisplayName(user?: FamilyUserSummary | null) {
  return user?.nickname || user?.realName || user?.username || '家人';
}

function getFamilyAvatarInitial(user?: FamilyUserSummary | null) {
  return getFamilyUserDisplayName(user).slice(0, 1).toUpperCase();
}

export function MobileFamilyAvatar({
  user,
  size = 'regular',
}: {
  user?: FamilyUserSummary | null;
  size?: MobileFamilyAvatarSize;
}) {
  const name = getFamilyUserDisplayName(user);
  const className = ['mobile-family-avatar', size === 'regular' ? '' : size]
    .filter(Boolean)
    .join(' ');

  if (user?.avatar) {
    return <img className={`${className} image`} src={user.avatar} alt={name} />;
  }

  return (
    <span className={`${className} text`}>
      <span className="mobile-family-avatar-letter">{getFamilyAvatarInitial(user)}</span>
    </span>
  );
}
