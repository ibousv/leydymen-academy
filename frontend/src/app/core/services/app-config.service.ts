import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private resolvedApiUrl: string | null = null;

  load(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    return fetch('/config.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((config: { apiUrl?: string } | null) => {
        if (config?.apiUrl) {
          this.resolvedApiUrl = config.apiUrl;
        }
      })
      .catch(() => undefined);
  }

  get apiUrl(): string {
    return this.resolvedApiUrl ?? environment.apiUrl;
  }
}
