import { Component, ElementRef, inject, Input, OnChanges, SimpleChanges, signal, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../core/models/product.interface';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-related-products',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './related-products.component.html',
  styleUrl: './related-products.component.css'
})
export class RelatedProductsComponent implements OnChanges {
  @Input() categoryId?: string;
  @Input() currentProductId?: string;

  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  relatedProducts = signal<Product[]>([]);
  isRelatedLoading = signal<boolean>(true);
  addedProducts = signal<Set<string>>(new Set());
  wishlistIds = this.wishlistService.wishlistIds;

  @ViewChild('relatedScroll') relatedScroll!: ElementRef<HTMLDivElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] || changes['currentProductId']) {
      if (this.categoryId) {
        this.isRelatedLoading.set(true);
        this.productsService.getProductsByCategory(this.categoryId, 8).subscribe({
          next: (relRes) => {
            const filtered = (relRes.data || [])
              .filter((p: Product) => p._id !== this.currentProductId)
              .sort((a: Product, b: Product) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
            this.relatedProducts.set(filtered.slice(0, 6));
            this.isRelatedLoading.set(false);
          },
          error: () => this.isRelatedLoading.set(false)
        });
      }
    }
  }

  addToCart(productId: string): void {
    if (!localStorage.getItem('TrendoToken')) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(productId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
          const next = new Set(this.addedProducts());
          next.add(productId);
          this.addedProducts.set(next);
          setTimeout(() => {
            const revert = new Set(this.addedProducts());
            revert.delete(productId);
            this.addedProducts.set(revert);
          }, 2500);
        }
      },
      error: () => this.toastr.error('Failed to add to bag.', 'Error')
    });
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

  scrollRelated(direction: 'left' | 'right'): void {
    if (this.relatedScroll?.nativeElement) {
      const scrollAmount = 350;
      const currentScroll = this.relatedScroll.nativeElement.scrollLeft;
      this.relatedScroll.nativeElement.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}
