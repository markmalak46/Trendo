import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IBrandResponse } from '../models/brand.interface';

@Injectable({
  providedIn: 'root',
})
export class BrandsService {
  private readonly httpClient = inject(HttpClient);

  getAllBrands(): Observable<IBrandResponse> {
    return this.httpClient.get<IBrandResponse>(`${environment.baseUrl}/api/v1/brands`);
  }
}
