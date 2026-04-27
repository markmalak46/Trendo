import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubcategoryResponse } from '../models/sub-category.interface';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriesService {
  private readonly httpClient = inject(HttpClient);

  getAllSubcategories(): Observable<SubcategoryResponse> {
    return this.httpClient.get<SubcategoryResponse>(`${environment.baseUrl}/api/v1/subcategories`);
  }

  getSubcategoriesOfCategory(categoryId: string): Observable<SubcategoryResponse> {
    return this.httpClient.get<SubcategoryResponse>(`${environment.baseUrl}/api/v1/categories/${categoryId}/subcategories`);
  }
}
