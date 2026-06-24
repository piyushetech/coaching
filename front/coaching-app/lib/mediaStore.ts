import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseDriveFileId } from './drive';

const STORAGE_KEY = 'sankalp_media_items';

export type MediaItem = {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  course: string;
  /** Google Drive file id — never shown to students in the UI. */
  driveFileId: string;
  createdAt: string;
};

/** Safe subset exposed in student lists (no drive id / url). */
export type PublicMedia = {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  course: string;
  createdAt: string;
};

function toPublic(item: MediaItem): PublicMedia {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    course: item.course,
    createdAt: item.createdAt
  };
}

function newId(type: 'video' | 'pdf') {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<MediaItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return [];
  }
}

async function writeAll(items: MediaItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listPublicMedia(type?: 'video' | 'pdf'): Promise<PublicMedia[]> {
  const items = await readAll();
  const filtered = type ? items.filter((i) => i.type === type) : items;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toPublic);
}

export async function listAllMedia(): Promise<MediaItem[]> {
  const items = await readAll();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const items = await readAll();
  return items.find((i) => i.id === id) ?? null;
}

export async function addMedia(input: {
  type: 'video' | 'pdf';
  title: string;
  course: string;
  driveLink: string;
}): Promise<MediaItem> {
  const title = input.title.trim();
  if (!title) throw new Error('Title is required.');

  const driveFileId = parseDriveFileId(input.driveLink);
  if (!driveFileId) {
    throw new Error('Paste a valid Google Drive link (Share → Copy link).');
  }

  const item: MediaItem = {
    id: newId(input.type),
    type: input.type,
    title,
    course: input.course.trim() || 'General',
    driveFileId,
    createdAt: new Date().toISOString()
  };

  const items = await readAll();
  items.unshift(item);
  await writeAll(items);
  return item;
}

export async function removeMedia(id: string) {
  const items = await readAll();
  await writeAll(items.filter((i) => i.id !== id));
}

const SEED_VIDEO_ID = '1HVfWUW-pAxuM-ssWtmLwRzpkPhUgEcuY';
const SEED_PDF_ID = '1X4cUISOuEfHPTXcwejQX5I5519TCXZkF';
const LEGACY_SEED_VIDEO_ID = '1-QDTe57Qd2N7OuXMXKSs9ist9d-bI3vk';

export async function seedDefaultMediaIfEmpty() {
  const items = await readAll();
  if (items.length) {
    await migrateSeedVideo(items);
    return;
  }

  const seeded: MediaItem[] = [
    {
      id: 'seed-video-1',
      type: 'video',
      title: 'How to Calculate Faster than a Calculator — Mental Math #1',
      course: 'General',
      driveFileId: SEED_VIDEO_ID,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-pdf-1',
      type: 'pdf',
      title: 'pdf-test',
      course: 'General',
      driveFileId: SEED_PDF_ID,
      createdAt: new Date().toISOString()
    }
  ];
  await writeAll(seeded);
}

/** Update default seed video when Drive link changes (existing installs). */
async function migrateSeedVideo(items: MediaItem[]) {
  let changed = false;
  const next = items.map((item) => {
    if (
      item.id === 'seed-video-1' ||
      item.driveFileId === LEGACY_SEED_VIDEO_ID
    ) {
      changed = true;
      return {
        ...item,
        id: 'seed-video-1',
        type: 'video' as const,
        title: 'How to Calculate Faster than a Calculator — Mental Math #1',
        driveFileId: SEED_VIDEO_ID
      };
    }
    return item;
  });
  if (changed) await writeAll(next);
}
