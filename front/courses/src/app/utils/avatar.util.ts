import { AppUser } from '../services/auth.service';
import { resolveMediaUrl } from './media-url';

export function getUserAvatarUrl(user: AppUser | null | undefined): string | null {
  const url = user?.profile?.avatarUrl;
  return url ? resolveMediaUrl(url) : null;
}

export function getUserInitial(user: AppUser | null | undefined): string {
  return user?.name?.charAt(0)?.toUpperCase() || '?';
}
