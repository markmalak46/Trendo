import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly httpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // GET /api/v1/orders/user/:userId
  getUserOrders(userId: string): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${environment.baseUrl}/api/v1/orders/user/${userId}`);
  }

  // POST /api/v1/orders/:cartId  — Body: { shippingAddress }
  checkoutCash(cartId: string, shippingAddress: { details: string; phone: string; city: string }): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/api/v1/orders/${cartId}`, {
      shippingAddress
    });
  }

  // POST /api/v1/orders/checkout-session/:cartId?url=<origin>  — Body: { shippingAddress }
  checkoutOnline(cartId: string, shippingAddress: { details: string; phone: string; city: string }): Observable<any> {
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : environment.localUrl;
    return this.httpClient.post(`${environment.baseUrl}/api/v1/orders/checkout-session/${cartId}?url=${origin}`, {
      shippingAddress
    });
  }
}
