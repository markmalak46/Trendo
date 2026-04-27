import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly httpClient = inject(HttpClient);
  
  wishlistIds = signal<Set<string>>(new Set());
  wishlistCount = computed(() => this.wishlistIds().size);

  addToWishlist(productId: string): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/api/v1/wishlist`, { productId }).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          const next = new Set(this.wishlistIds());
          next.add(productId);
          this.wishlistIds.set(next);
        }
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/api/v1/wishlist/${productId}`).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          const next = new Set(this.wishlistIds());
          next.delete(productId);
          this.wishlistIds.set(next);
        }
      })
    );
  }

  getUserWishlist(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/api/v1/wishlist`).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          const ids = res.data.map((item: any) => item._id);
          this.wishlistIds.set(new Set(ids));
        }
      })
    );
  }
}
