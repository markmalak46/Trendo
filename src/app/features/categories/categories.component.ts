import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesService } from '../../core/services/categories.service';
import { SubcategoriesService } from '../../core/services/subcategories.service';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../core/models/category.interface';
import { Subcategory } from '../../core/models/sub-category.interface';
import { Product } from '../../core/models/product.interface';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly subcategoriesService = inject(SubcategoriesService);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);
  
  categoriesList = signal<Category[]>([]);
  subcategoriesList = signal<Subcategory[]>([]);
  categoryProducts = signal<Product[]>([]);
  
  expandedCategoryId = signal<string | null>(null);
  selectedCategoryName = signal<string>('');
  selectedSubcategoryId = signal<string | null>(null);
  selectedSubcategoryName = signal<string>('');
  isProductsForCategory = signal<boolean>(false); // true = showing category products, false = subcategory
  
  isLoading = signal<boolean>(true);
  isSubLoading = signal<boolean>(false);
  isProductsLoading = signal<boolean>(false);
  
  addedProducts = signal<Set<string>>(new Set());
  wishlistIds = this.wishlistService.wishlistIds;

  ngOnInit(): void {
    this.getCategoriesData();
    this.loadWishlist();
  }

  getCategoriesData(): void {
    this.isLoading.set(true);
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.categoriesList.set(res.data);
        this.isLoading.set(false);
        if (res.data.length > 0) {
          this.toggleCategory(res.data[0]._id, res.data[0].name);
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleCategory(categoryId: string, categoryName: string): void {
    if (this.expandedCategoryId() === categoryId) {
      this.expandedCategoryId.set(null);
      this.subcategoriesList.set([]);
      this.selectedSubcategoryId.set(null);
      this.selectedSubcategoryName.set('');
      this.selectedCategoryName.set('');
      this.categoryProducts.set([]);
      return;
    }
    
    this.expandedCategoryId.set(categoryId);
    this.selectedCategoryName.set(categoryName);
    this.selectedSubcategoryId.set(null);
    this.selectedSubcategoryName.set('');
    this.isSubLoading.set(true);
    this.isProductsLoading.set(true);
    this.isProductsForCategory.set(true);

    // Fetch subcategories
    this.subcategoriesService.getSubcategoriesOfCategory(categoryId).subscribe({
      next: (res) => {
        this.subcategoriesList.set(res.data);
        this.isSubLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching subcategories:', err);
        this.isSubLoading.set(false);
      },
    });

    // Fetch category products
    this.productsService.getProductsByCategory(categoryId, 20).subscribe({
      next: (res: any) => {
        this.categoryProducts.set(res.data);
        this.isProductsLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching category products:', err);
        this.isProductsLoading.set(false);
      }
    });
  }
  
  selectSubcategory(subcategoryId: string, subcategoryName: string): void {
    if (this.selectedSubcategoryId() === subcategoryId) return;

    this.selectedSubcategoryId.set(subcategoryId);
    this.selectedSubcategoryName.set(subcategoryName);
    this.isProductsForCategory.set(false);
    this.isProductsLoading.set(true);
    
    this.productsService.getAllProducts(1, { subcategory: subcategoryId }).subscribe({
      next: (res: any) => {
        this.categoryProducts.set(res.data);
        this.isProductsLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching products for subcategory:', err);
        this.isProductsLoading.set(false);
      }
    });
  }

  addToCart(id: string): void {
    this.cartService.addToCart(id).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toastr.success(res.message, 'Added to Bag');
          this.cartService.cartBadgeNumber.set(res.numOfCartItems);
          const currentSet = new Set(this.addedProducts());
          currentSet.add(id);
          this.addedProducts.set(currentSet);
        }
      },
      error: (err: any) => {
        console.error('Error adding to cart:', err);
        this.toastr.error('Failed to add product to cart', 'Error');
      }
    });
  }

  toggleWishlist(productId: string): void {
    const isCurrentlyWishlisted = this.wishlistIds().has(productId);
    
    if (isCurrentlyWishlisted) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.info('Product removed from wishlist', 'Wishlist Updated');
          }
        },
        error: (err: any) => console.error('Error removing from wishlist:', err)
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.toastr.success('Product added to wishlist', 'Wishlist Updated');
          }
        },
        error: (err: any) => console.error('Error adding to wishlist:', err)
      });
    }
  }

  private loadWishlist(): void {
    this.wishlistService.getUserWishlist().subscribe({
      next: () => {},
      error: (err: any) => console.error('Error loading wishlist:', err)
    });
  }
}
