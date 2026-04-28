import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { BrandsService } from '../../core/services/brands.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../core/models/product.interface';
import { Category } from '../../core/models/category.interface';
import { IBrand } from '../../core/models/brand.interface';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
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
  private readonly activatedRoute = inject(ActivatedRoute);

  wishlistIds = this.wishlistService.wishlistIds;

  allProducts = signal<Product[]>([]);
  categoryList = signal<Category[]>([]);
  brandList = signal<IBrand[]>([]);

  isLoading = signal<boolean>(true);
  addedProducts = signal<Set<string>>(new Set());

  // Filter & Sort state
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  
  sortField = signal<string>('createdAt'); // Default sort
  sortDir = signal<'asc' | 'desc'>('desc');

  // Sidebar visibility (mobile)
  showFilters = signal<boolean>(false);

  /** Combined search & basic filtering */
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const brand = this.selectedBrand();

    return this.allProducts().filter(p => {
      const matchesSearch = !query || 
        p.title.toLowerCase().includes(query) || 
        p.category?.name.toLowerCase().includes(query) ||
        p.brand?.name.toLowerCase().includes(query);
        
      const matchesCategory = !cat || p.category?._id === cat;
      const matchesBrand = !brand || p.brand?._id === brand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  });

  /** Layered sorting on top of filtered results */
  sortedProducts = computed(() => {
    const products = [...this.filteredProducts()];
    const field = this.sortField();
    const dir = this.sortDir();

    return products.sort((a, b) => {
      let valA: any;
      let valB: any;

      // Extract values based on field
      if (field === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (field === 'brand') {
        valA = a.brand?.name.toLowerCase() || '';
        valB = b.brand?.name.toLowerCase() || '';
      } else if (field === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (field === 'ratingsAverage') {
        valA = a.ratingsAverage;
        valB = b.ratingsAverage;
      } else if (field === 'ratingsQuantity') {
        valA = a.ratingsQuantity;
        valB = b.ratingsQuantity;
      } else {
        // Default to createdAt
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.loadFilters();
    if (localStorage.getItem('TrendoToken')) {
      this.wishlistService.getUserWishlist().subscribe();
    }

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['brand']) {
        this.selectedBrand.set(params['brand']);
      }
      if (params['subcategory']) {
        // Shop component's client filter uses selectedCategory, but we can also filter the API by subcategory if needed.
        // For now, we just pass the URL params directly to loadProducts.
      }
      this.loadProducts(1);
    });
  }

  loadProducts(page: number): void {
    this.isLoading.set(true);
    
    // Check if we have active query params to apply server-side filtering
    const brandId = this.activatedRoute.snapshot.queryParams['brand'];
    const subcategoryId = this.activatedRoute.snapshot.queryParams['subcategory'];
    
    const filters: any = {};
    if (brandId) filters.brand = brandId;
    if (subcategoryId) filters.subcategory = subcategoryId;

    this.productsService.getAllProducts(page, filters).subscribe({
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
    return !!(this.searchQuery() || this.selectedCategory() || this.selectedBrand() || this.sortField() !== 'createdAt' || this.sortDir() !== 'desc');
  }

  onSortChange(field: string): void {
    this.sortField.set(field);
  }

  toggleSortDir(): void {
    this.sortDir.update(dir => dir === 'asc' ? 'desc' : 'asc');
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
