import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../core/models/product.interface';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  wishlistItems = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  addedToCart = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.wishlistService.getUserWishlist().subscribe({
      next: (res) => {
        this.wishlistItems.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load wishlist');
        this.isLoading.set(false);
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.toastr.success('Removed from wishlist');
        // Update local list immediately for better UX
        this.wishlistItems.set(this.wishlistItems().filter(item => item._id !== productId));
      },
      error: () => this.toastr.error('Failed to remove item')
    });
  }

  addToCart(productId: string): void {
    this.cartService.addToCart(productId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
          this.toastr.success('Added to bag');
          
          const next = new Set(this.addedToCart());
          next.add(productId);
          this.addedToCart.set(next);
          
          setTimeout(() => {
            const revert = new Set(this.addedToCart());
            revert.delete(productId);
            this.addedToCart.set(revert);
          }, 2000);
        }
      },
      error: () => this.toastr.error('Failed to add to bag')
    });
  }
}
