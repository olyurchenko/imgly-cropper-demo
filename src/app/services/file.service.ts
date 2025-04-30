import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseURL } from '../core/constants';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly http = inject(HttpClient);

  getCPFiles(skip = 0): Promise<any> {
    let params = new HttpParams();
    params = params.append('skip', skip.toString());
    return lastValueFrom(
      this.http.get(`${baseURL}venueId`, {
        params,
      })
    );
  }
}
