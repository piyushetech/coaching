import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-videos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Videos</h2>
      <p>Video library and player controls will appear here.</p>
    </div>
  `
})
export class DashboardVideosComponent {}
