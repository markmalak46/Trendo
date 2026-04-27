import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../core/models/product.interface';
import { Router, RouterLink } from "@angular/router";
import { CurrencyPipe } from "@angular/common";
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  wishlistIds = this.wishlistService.wishlistIds;

  productList = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  addedProducts = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.getProductsData();
    if (localStorage.getItem('TrendoToken')) {
      this.wishlistService.getUserWishlist().subscribe();
    }
  }

  getProductsData(): void {
    this.productsService.getLimitedProducts(10).subscribe({
      next: (res) => {
        this.productList.set(res.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.isLoading.set(false);
      }
    });
  }

  addProductToCart(id: string): void {
    if (localStorage.getItem('TrendoToken')) {
      this.cartService.addToCart(id).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.cartService.cartBadgeNumber.set(res.numOfCartItems);
            localStorage.setItem('TrendoCart', JSON.stringify(res.numOfCartItems));

            const newSet = new Set(this.addedProducts());
            newSet.add(id);
            this.addedProducts.set(newSet);

            setTimeout(() => {
              const revertedSet = new Set(this.addedProducts());
              revertedSet.delete(id);
              this.addedProducts.set(revertedSet);
            }, 2500);
          }
        },
        error: (error) => {
          console.error('Error adding product to cart:', error);
          this.toastr.error('Failed to add product to cart.', 'Error');
        }
      })
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  toggleWishlist(productId: string): void {
    if (!localStorage.getItem('TrendoToken')) {
      this.router.navigate(['/login']);
      return;
    }

    const isInWishlist = this.wishlistIds().has(productId);

    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => this.toastr.success('Removed from wishlist'),
        error: () => this.toastr.error('Failed to remove from wishlist')
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => this.toastr.success('Added to wishlist'),
        error: () => this.toastr.error('Failed to add to wishlist')
      });
    }
  }
}
