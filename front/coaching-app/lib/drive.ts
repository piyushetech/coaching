/** Parse a Google Drive share URL or raw file id. */
export function parseDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  const fromPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fromPath) return fromPath[1];
  const fromQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fromQuery) return fromQuery[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

/** In-app embed URL — students never see the original share link. */
export function drivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isDriveInputValid(input: string): boolean {
  return parseDriveFileId(input) !== null;
}
