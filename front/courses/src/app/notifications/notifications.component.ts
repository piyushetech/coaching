import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  private notif = inject(NotificationService);
  notifications = this.notif.notifications;

  ngOnInit() {
    this.notif.load();
  }

  markRead(id: string) {
    this.notif.markRead(id);
  }

  markAllRead() {
    this.notif.markAllRead();
  }
}
