import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandsService } from '../../core/services/brands.service';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { IBrand } from '../../core/models/brand.interface';
import { Product } from '../../core/models/product.interface';

@Component({
  selector: 'app-brands',
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  
  brandsList = signal<IBrand[]>([]);
  isLoading = signal<boolean>(true);

  searchQuery = signal<string>('');
  filteredBrands = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.brandsList();
    return this.brandsList().filter(b => b.name.toLowerCase().includes(query));
  });

  @ViewChild('brandsScroll') brandsScroll!: ElementRef<HTMLDivElement>;

  selectedBrandName = signal<string>('');
  brandProducts = signal<Product[]>([]);
  isProductsLoading = signal<boolean>(false);
  
  addedProducts = signal<Set<string>>(new Set());
  wishlistIds = this.wishlistService.wishlistIds;

  ngOnInit(): void {
    this.getBrandsData();
    if (localStorage.getItem('TrendoToken')) {
      this.wishlistService.getUserWishlist().subscribe();
    }
  }

  getBrandsData(): void {
    this.isLoading.set(true);
    this.brandsService.getAllBrands().subscribe({
      next: (res) => {
        this.brandsList.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
        this.isLoading.set(false);
      },
    });
  }

  scrollBrands(direction: 'left' | 'right'): void {
    if (this.brandsScroll) {
      const scrollAmount = 300;
      const currentScroll = this.brandsScroll.nativeElement.scrollLeft;
      this.brandsScroll.nativeElement.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  selectBrand(brandId: string, brandName: string): void {
    this.selectedBrandName.set(brandName);
    this.isProductsLoading.set(true);
    
    this.productsService.getAllProducts(1, { brand: brandId }).subscribe({
      next: (res) => {
        this.brandProducts.set(res.data);
        this.isProductsLoading.set(false);
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      },
      error: () => this.isProductsLoading.set(false)
    });
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
}
