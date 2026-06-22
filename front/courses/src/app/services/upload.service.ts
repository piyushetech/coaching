import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private openRequest = signal(0);
  private handledRequest = 0;

  /** Read in effects so they re-run when a new open is requested */
  pendingVersion() {
    return this.openRequest();
  }

  requestOpen() {
    this.openRequest.update((n) => n + 1);
  }

  hasPendingOpen(): boolean {
    return this.openRequest() > this.handledRequest;
  }

  consumeOpen() {
    this.handledRequest = this.openRequest();
  }
}
