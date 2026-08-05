import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * NotificationService — Custom notification system (replaces ngx-toastr)
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toasts$ = new BehaviorSubject<Toast[]>([]);
  private nextId = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 3500): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    const id = `toast-${this.nextId++}`;
    const toast: Toast = { id, message, type, duration };

    const current = this.toasts$.value;
    this.toasts$.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        const updated = this.toasts$.value.filter((t) => t.id !== id);
        this.toasts$.next(updated);
      }, duration);
    }
  }

  clear(): void {
    this.toasts$.next([]);
  }
}
