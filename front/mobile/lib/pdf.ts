import { Platform } from 'react-native';

/** URL suitable for embedding a PDF in a WebView / iframe. */
export function pdfViewerUrl(absoluteUrl: string): string {
  if (!absoluteUrl) return '';

  const isLocal =
    absoluteUrl.includes('localhost') ||
    absoluteUrl.includes('127.0.0.1') ||
    /^https?:\/\/192\.168\.\d+\.\d+/.test(absoluteUrl) ||
    /^https?:\/\/10\.\d+\.\d+\.\d+/.test(absoluteUrl);

  if (Platform.OS === 'web' || Platform.OS === 'ios' || isLocal) {
    return absoluteUrl;
  }

  return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
}
