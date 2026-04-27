import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models/order.interface';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly platformId = inject(PLATFORM_ID);

  ordersList = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  expandedOrderId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('TrendoToken');
    if (!token) {
      this.isLoading.set(false);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      if (!userId) {
        this.isLoading.set(false);
        return;
      }

      this.ordersService.getUserOrders(userId).subscribe({
        next: (orders) => {
          // Sort newest first
          this.ordersList.set([...orders].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      this.isLoading.set(false);
    }
  }

  toggleOrder(orderId: string): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }
}
