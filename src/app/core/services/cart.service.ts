import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly httpClient = inject(HttpClient);
  
  cartBadgeNumber = signal<number>(0);

  addToCart(prodId: string): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/api/v2/cart`, 
      { productId: prodId }
    );
  }

  getLoggedUserCart(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/api/v2/cart`);
  }

  removeFromCart(productId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/api/v2/cart/${productId}`);
  }

  updateCartProductCount(productId: string, count: number): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}/api/v2/cart/${productId}`, { count });
  }

  clearCart(): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/api/v2/cart`);
  }
}
