import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, JsonPipe, SlicePipe } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { BrandsService } from '../../core/services/brands.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Product } from '../../core/models/product.interface';
import { Category } from '../../core/models/category.interface';
import { IBrand } from '../../core/models/brand.interface';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, JsonPipe, SlicePipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly brandsService = inject(BrandsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  wishlistIds = this.wishlistService.wishlistIds;

  allProducts = signal<Product[]>([]);
  categoryList = signal<Category[]>([]);
  brandList = signal<IBrand[]>([]);

  isLoading = signal<boolean>(true);
  addedProducts = signal<Set<string>>(new Set());

  // Filter state
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');

  // Sidebar visibility (mobile)
  showFilters = signal<boolean>(false);

  /** Client-side filtering — fast, no extra API calls */
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const brand = this.selectedBrand();

    return this.allProducts().filter(p => {
      const matchesSearch = !query || p.title.toLowerCase().includes(query);
      const matchesCategory = !cat || p.category?._id === cat;
      const matchesBrand = !brand || p.brand?._id === brand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  });

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.loadProducts(1);
    this.loadFilters();
    if (localStorage.getItem('TrendoToken')) {
      this.wishlistService.getUserWishlist().subscribe();
    }
  }

  loadProducts(page: number): void {
    this.isLoading.set(true);
    this.productsService.getAllProducts(page).subscribe({
      next: (res) => {
        this.allProducts.set(res.data);
        this.currentPage.set(res.metadata.currentPage);
        this.totalPages.set(res.metadata.numberOfPages);
        this.isLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadFilters(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => this.categoryList.set(res.data),
      error: () => {}
    });

    this.brandsService.getAllBrands().subscribe({
      next: (res) => this.brandList.set(res.data),
      error: () => {}
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadProducts(page);
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedBrand.set('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.selectedCategory() || this.selectedBrand());
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
