import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pendingRequests = signal(0);

  readonly isLoading = computed(() => this.pendingRequests() > 0);

  add(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  remove(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}
