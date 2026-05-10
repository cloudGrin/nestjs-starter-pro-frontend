import type { FamilyUserSummary } from '@/features/family/types/family.types';
import {
  getFamilyAvatarInitial,
  getFamilyUserDisplayName,
  type MobileFamilyAvatarSize,
} from './MobileFamilyAvatar.utils';

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
