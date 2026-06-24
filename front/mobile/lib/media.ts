import { SERVER_URL } from './config';

export function resolveMediaUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
