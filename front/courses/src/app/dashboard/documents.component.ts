import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Documents</h2>
      <p>Document list and preview will appear here.</p>
    </div>
  `
})
export class DashboardDocumentsComponent {}
