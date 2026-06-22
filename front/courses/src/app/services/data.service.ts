import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CourseId } from '../constants/courses';
import { ApiService } from './api.service';

export type DashboardItem = {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  course: CourseId;
  thumbnail?: string;
  description?: string;
  size?: string;
  sizeBytes?: number;
  dateModified?: string;
  uploadedBy?: string;
};

export type StorageStats = {
  quotaBytes: number;
  quotaLabel: string;
  usedBytes: number;
  usedLabel: string;
  percentUsed: number;
  percentLabel: string;
  videoCount: number;
  pdfCount: number;
  videoBytes: number;
  pdfBytes: number;
  videoLabel: string;
  pdfLabel: string;
};

const EMPTY_STORAGE: StorageStats = {
  quotaBytes: 100 * 1024 ** 3,
  quotaLabel: '100 GB',
  usedBytes: 0,
  usedLabel: '0 B',
  percentUsed: 0,
  percentLabel: '0%',
  videoCount: 0,
  pdfCount: 0,
  videoBytes: 0,
  pdfBytes: 0,
  videoLabel: '0 B',
  pdfLabel: '0 B'
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private api = inject(ApiService);
  private cache: DashboardItem[] = [];

  async getDashboardItems(): Promise<DashboardItem[]> {
    try {
      this.cache = await firstValueFrom(this.api.get<DashboardItem[]>('/files'));
    } catch {
      this.cache = [];
    }
    return [...this.cache];
  }

  async getStorageStats(): Promise<StorageStats> {
    try {
      return await firstValueFrom(this.api.get<StorageStats>('/files/storage'));
    } catch {
      return { ...EMPTY_STORAGE };
    }
  }

  getDashboardItemsSync(): DashboardItem[] {
    return [...this.cache];
  }

  getItemById(id: string): DashboardItem | undefined {
    return this.cache.find((i) => i.id === id);
  }

  async addItems(newItems: Partial<DashboardItem>[], files?: File[]) {
    if (files?.length) {
      const formData = new FormData();
      for (const f of files) formData.append('files', f);
      if (newItems[0]?.course) formData.append('course', newItems[0].course);
      if (newItems[0]?.title) formData.append('title', newItems[0].title);
      if (newItems[0]?.description) formData.append('description', newItems[0].description);
      await firstValueFrom(this.api.upload<DashboardItem[]>('/files', formData));
    }
    await this.getDashboardItems();
  }

  async updateItem(id: string, patch: Partial<DashboardItem>, replacementFile?: File) {
    let updated: DashboardItem;
    if (replacementFile) {
      const formData = new FormData();
      formData.append('file', replacementFile);
      if (patch.title) formData.append('title', patch.title);
      if (patch.description !== undefined) formData.append('description', patch.description);
      if (patch.course) formData.append('course', patch.course);
      updated = await firstValueFrom(this.api.uploadPatch<DashboardItem>(`/files/${id}`, formData));
    } else {
      updated = await firstValueFrom(this.api.patch<DashboardItem>(`/files/${id}`, patch));
    }
    const idx = this.cache.findIndex((i) => i.id === id);
    if (idx >= 0) this.cache[idx] = updated;
    return updated;
  }

  async deleteItem(id: string) {
    await firstValueFrom(this.api.delete(`/files/${id}`));
    this.cache = this.cache.filter((i) => i.id !== id);
  }
}
