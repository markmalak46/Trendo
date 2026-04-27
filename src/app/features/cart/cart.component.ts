import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart } from './models/cart.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);

  cartDetails = signal<Cart | null>(null);
  isLoading = signal<boolean>(true);
  removingIds = signal<Set<string>>(new Set());
  updatingIds = signal<Set<string>>(new Set());
checkoutId = computed(() => this.cartDetails()?._id || '');
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCartData();
    }
  }

  getCartData(): void {
    this.isLoading.set(true);
    this.cartService.getLoggedUserCart().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartDetails.set(res.data);
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.cartDetails.set(null);
        this.isLoading.set(false);
      }
    });
  }

  updateCount(productId: string, count: number): void {
    // Don't allow count below 1
    if (count < 1) return;
    // Prevent double-clicks while updating
    if (this.updatingIds().has(productId)) return;

    const updating = new Set(this.updatingIds());
    updating.add(productId);
    this.updatingIds.set(updating);

    this.cartService.updateCartProductCount(productId, count).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartDetails.set(res.data);
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
        }
        const done = new Set(this.updatingIds());
        done.delete(productId);
        this.updatingIds.set(done);
      },
      error: (err) => {
        console.error('Error updating cart:', err);
        const done = new Set(this.updatingIds());
        done.delete(productId);
        this.updatingIds.set(done);
      }
    });
  }

  removeItem(productId: string): void {
    const removing = new Set(this.removingIds());
    removing.add(productId);
    this.removingIds.set(removing);

    this.cartService.removeFromCart(productId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartDetails.set(res.data);
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
        }
        const done = new Set(this.removingIds());
        done.delete(productId);
        this.removingIds.set(done);
      },
      error: (err) => {
        console.error('Error removing item from cart:', err);
        const done = new Set(this.removingIds());
        done.delete(productId);
        this.removingIds.set(done);
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartDetails.set(null);
          this.cartService.cartBadgeNumber.set(0);
        }
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      }
    });
  }
}
