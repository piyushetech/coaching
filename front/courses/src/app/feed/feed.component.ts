import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../services/feed.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  private feedService = inject(FeedService);
  auth = inject(AuthService);

  posts = this.feedService.feed;
  newPost = signal('');
  commentDrafts = signal<Record<string, string>>({});

  ngOnInit() {
    this.feedService.load();
  }

  submitPost() {
    const text = this.newPost().trim();
    if (!text) return;
    this.feedService.addPost(text).then(() => this.newPost.set(''));
  }

  toggleLike(postId: string) {
    this.feedService.toggleLike(postId);
  }

  isLiked(post: { likes: string[] }): boolean {
    const id = this.auth.getUser()?.id;
    return id ? post.likes.includes(id) : false;
  }

  getCommentDraft(postId: string): string {
    return this.commentDrafts()[postId] ?? '';
  }

  setCommentDraft(postId: string, value: string) {
    this.commentDrafts.update((d) => ({ ...d, [postId]: value }));
  }

  submitComment(postId: string) {
    const text = this.getCommentDraft(postId);
    if (!text.trim()) return;
    this.feedService.addComment(postId, text);
    this.setCommentDraft(postId, '');
  }

  toggleSelected(postId: string) {
    this.feedService.toggleSelected(postId);
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }
}
