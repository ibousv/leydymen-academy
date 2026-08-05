import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  uploadImage(file: File): Observable<{ url: string }> {
    return this.upload('/uploads/images', file);
  }

  uploadVideo(file: File): Observable<{ url: string }> {
    return this.upload('/uploads/videos', file);
  }

  private upload(path: string, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ url: string }>(`${this.apiUrl}${path}`, formData);
  }
}
