import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly httpClient = inject(HttpClient);

  getAllProducts(pageNum: number = 1, filters?: { brand?: string, subcategory?: string }): Observable<any> {
    let url = `${environment.baseUrl}/api/v1/products?page=${pageNum}`;
    if (filters?.brand) {
      url += `&brand=${filters.brand}`;
    }
    if (filters?.subcategory) {
      url += `&subcategory[in][]=${filters.subcategory}`;
    }
    return this.httpClient.get(url);
  }

  getLimitedProducts(limit: number = 10):Observable<any>{
    return this.httpClient.get(`${environment.baseUrl}/api/v1/products?limit=${limit}`)
  }

  getProductDetails(id: string):Observable<any>{
    return this.httpClient.get(`${environment.baseUrl}/api/v1/products/${id}`)
  }

  getProductsByCategory(categoryId: string, limit: number = 8): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/api/v1/products?category[in][]=${categoryId}&limit=${limit}`);
  }

  getProductReviews(id: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/api/v1/products/${id}/reviews`);
  }

  createReview(productId: string, reviewData: { review: string, rating: number }): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/api/v1/products/${productId}/reviews`, reviewData);
  }

  updateReview(reviewId: string, reviewData: { review: string, rating: number }): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}/api/v1/reviews/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/api/v1/reviews/${reviewId}`);
  }
}
