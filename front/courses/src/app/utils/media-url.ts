import { environment } from '../../environments/environment';

/** Turn relative /uploads/... paths into absolute backend URLs in dev */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = environment.serverUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
