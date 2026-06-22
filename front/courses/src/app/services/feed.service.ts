import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

export type FeedPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'student';
  content: string;
  createdAt: string;
  likes: string[];
  comments: FeedComment[];
  selected?: boolean;
};

export type FeedComment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class FeedService {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private posts = signal<FeedPost[]>([]);

  readonly feed = this.posts.asReadonly();

  async load(): Promise<void> {
    if (!this.auth.getToken()) {
      this.posts.set([]);
      return;
    }
    try {
      const list = await firstValueFrom(this.api.get<FeedPost[]>('/feed'));
      this.posts.set(list);
    } catch {
      this.posts.set([]);
    }
  }

  async addPost(content: string): Promise<void> {
    const post = await firstValueFrom(this.api.post<FeedPost>('/feed', { content }));
    this.posts.update((list) => [post, ...list]);
  }

  async toggleLike(postId: string): Promise<void> {
    const updated = await firstValueFrom(this.api.post<FeedPost>(`/feed/${postId}/like`, {}));
    this.posts.update((list) => list.map((p) => (p.id === postId ? updated : p)));
  }

  async addComment(postId: string, text: string): Promise<void> {
    const updated = await firstValueFrom(this.api.post<FeedPost>(`/feed/${postId}/comments`, { text }));
    this.posts.update((list) => list.map((p) => (p.id === postId ? updated : p)));
  }

  async toggleSelected(postId: string): Promise<void> {
    if (!this.auth.isAdmin()) return;
    const updated = await firstValueFrom(this.api.patch<FeedPost>(`/feed/${postId}/selected`, {}));
    this.posts.update((list) => list.map((p) => (p.id === postId ? updated : p)));
  }
}
