import { Component, computed, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.interface';
import { CurrencyPipe, SlicePipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { RelatedProductsComponent } from './components/related-products/related-products.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';

@Component({
  selector: 'app-details',
  imports: [CurrencyPipe, RouterLink, SlicePipe, RelatedProductsComponent, ProductReviewsComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  currentUserId = computed(() => this.authService.userId());
  wishlistIds = computed(() => this.wishlistService.wishlistIds());

  productDetails = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  activeImageIndex = signal<number>(0);
  isAdded = signal<boolean>(false);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        
        this.productDetails.set(null);
        this.activeImageIndex.set(0);

        if (this.wishlistService.wishlistIds().size === 0) {
          this.wishlistService.getUserWishlist().subscribe();
        }

        if (id && id.length === 24) { 
          this.isLoading.set(true);
          this.productsService.getProductDetails(id).subscribe({
            next: (res) => {
              this.productDetails.set(res.data);
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error('Product Details Error:', err);
              this.isLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
        }
      }
    });
  }

  changeImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  toggleWishlist(productId: string): void {
    if (!localStorage.getItem('TrendoToken')) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.wishlistIds().has(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => this.toastr.info('Removed from wishlist'),
        error: () => this.toastr.error('Failed to remove from wishlist')
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => this.toastr.success('Added to wishlist'),
        error: () => this.toastr.error('Failed to add to wishlist')
      });
    }
  }

  addProductToCart(id: string): void {
    if (localStorage.getItem('TrendoToken')) {
      this.cartService.addToCart(id).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.cartService.cartBadgeNumber.set(res.numOfCartItems);
            this.isAdded.set(true);

            setTimeout(() => {
              this.isAdded.set(false);
            }, 2500);
          }
        },
        error: (error) => {
          console.error('Error adding product to cart:', error);
          this.toastr.error('Failed to add product to cart.', 'Error');
        }
      })
    } else {
      this.router.navigate(['/login']);
    }
  }

}
