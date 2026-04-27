import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.interface';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-details',
  imports: [CurrencyPipe, RouterLink, DatePipe, SlicePipe, FormsModule],
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
  reviews = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isReviewsLoading = signal<boolean>(true);
  activeImageIndex = signal<number>(0);
  isAdded = signal<boolean>(false);
  showAllReviews = signal<boolean>(false);

  // New Review State
  newReviewText = signal<string>('');
  newReviewRating = signal<number>(5);
  isSubmittingReview = signal<boolean>(false);

  // Edit Review State
  editingReviewId = signal<string | null>(null);
  editReviewText = signal<string>('');
  editReviewRating = signal<number>(5);
  isUpdatingReview = signal<boolean>(false);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        
        // Reset state for new product
        this.productDetails.set(null);
        this.reviews.set([]);
        this.activeImageIndex.set(0);
        this.editingReviewId.set(null);

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

          this.isReviewsLoading.set(true);
          this.productsService.getProductReviews(id).subscribe({
            next: (res) => {
              this.reviews.set(res.data || []);
              this.isReviewsLoading.set(false);
            },
            error: (err) => {
              console.error('Reviews Error:', err);
              this.isReviewsLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
          this.isReviewsLoading.set(false);
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

  submitReview(): void {
    if (!localStorage.getItem('TrendoToken')) {
      this.router.navigate(['/login']);
      return;
    }

    const productId = this.productDetails()?._id;
    const text = this.newReviewText().trim();
    const rating = this.newReviewRating();

    if (!productId || !text) {
      this.toastr.warning('Please enter a review message.');
      return;
    }

    this.isSubmittingReview.set(true);
    this.productsService.createReview(productId, { review: text, rating }).subscribe({
      next: (res) => {
        this.toastr.success('Thank you for your feedback!');
        this.newReviewText.set('');
        this.newReviewRating.set(5);
        this.isSubmittingReview.set(false);
        
        // Refresh reviews
        this.productsService.getProductReviews(productId).subscribe({
          next: (res) => this.reviews.set(res.data)
        });
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to submit review');
        this.isSubmittingReview.set(false);
      }
    });
  }

  setRating(rating: number): void {
    this.newReviewRating.set(rating);
  }

  // --- Edit/Delete ---

  startEdit(review: any): void {
    this.editingReviewId.set(review._id);
    this.editReviewText.set(review.review);
    this.editReviewRating.set(review.rating);
  }

  cancelEdit(): void {
    this.editingReviewId.set(null);
  }

  updateReview(reviewId: string): void {
    const text = this.editReviewText().trim();
    const rating = this.editReviewRating();

    if (!text) {
      this.toastr.warning('Please enter a review message.');
      return;
    }

    this.isUpdatingReview.set(true);
    this.productsService.updateReview(reviewId, { review: text, rating }).subscribe({
      next: () => {
        this.toastr.success('Review updated');
        this.editingReviewId.set(null);
        this.isUpdatingReview.set(false);
        // Refresh reviews
        this.productsService.getProductReviews(this.productDetails()?._id!).subscribe({
          next: (res) => this.reviews.set(res.data)
        });
      },
      error: () => {
        this.toastr.error('Failed to update review');
        this.isUpdatingReview.set(false);
      }
    });
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.productsService.deleteReview(reviewId).subscribe({
        next: () => {
          this.toastr.success('Review deleted');
          this.reviews.set(this.reviews().filter(r => r._id !== reviewId));
        },
        error: () => this.toastr.error('Failed to delete review')
      });
    }
  }

  setEditRating(rating: number): void {
    this.editReviewRating.set(rating);
  }
}
