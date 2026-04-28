import { Component, computed, inject, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../../../../core/services/products.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [DatePipe, SlicePipe, FormsModule, CurrencyPipe],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css'
})
export class ProductReviewsComponent implements OnChanges {
  @Input() productId?: string;
  @Input() ratingsAverage?: number;

  private readonly productsService = inject(ProductsService);
  private readonly toastr = inject(ToastrService);
  private readonly authService = inject(AuthService);

  currentUserId = computed(() => this.authService.userId());

  reviews = signal<any[]>([]);
  isReviewsLoading = signal<boolean>(true);
  showAllReviews = signal<boolean>(false);
  ratingPercentages = signal<{stars: number, count: number, percent: number}[]>([]);

  newReviewText = signal<string>('');
  newReviewRating = signal<number>(5);
  isSubmittingReview = signal<boolean>(false);

  editingReviewId = signal<string | null>(null);
  editReviewText = signal<string>('');
  editReviewRating = signal<number>(5);
  isUpdatingReview = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.fetchReviews(this.productId);
    }
  }

  fetchReviews(id: string): void {
    this.isReviewsLoading.set(true);
    this.productsService.getProductReviews(id).subscribe({
      next: (res) => {
        const sorted = (res.data || []).sort((a: any, b: any) => b.rating - a.rating);
        this.reviews.set(sorted);
        this.calculatePercentages(sorted);
        this.isReviewsLoading.set(false);
      },
      error: (err: any) => {
        console.error('Reviews Error:', err);
        this.isReviewsLoading.set(false);
      }
    });
  }

  calculatePercentages(reviews: any[]): void {
    const total = reviews.length;
    const stats = [5, 4, 3, 2, 1].map(stars => {
      const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { stars, count, percent };
    });
    this.ratingPercentages.set(stats);
  }

  submitReview(): void {
    const text = this.newReviewText().trim();
    const rating = this.newReviewRating();
    const pId = this.productId;

    if (!text) {
      this.toastr.warning('Please enter a review message.');
      return;
    }

    if (!pId) return;

    this.isSubmittingReview.set(true);
    this.productsService.createReview(pId, { review: text, rating }).subscribe({
      next: () => {
        this.toastr.success('Review added successfully!');
        this.newReviewText.set('');
        this.newReviewRating.set(5);
        this.isSubmittingReview.set(false);
        this.fetchReviews(pId);
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to submit review');
        this.isSubmittingReview.set(false);
      }
    });
  }

  setRating(rating: number): void {
    this.newReviewRating.set(rating);
  }

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
    const pId = this.productId;

    if (!text) {
      this.toastr.warning('Please enter a review message.');
      return;
    }
    if (!pId) return;

    this.isUpdatingReview.set(true);
    this.productsService.updateReview(reviewId, { review: text, rating }).subscribe({
      next: () => {
        this.toastr.success('Review updated');
        this.editingReviewId.set(null);
        this.isUpdatingReview.set(false);
        this.fetchReviews(pId);
      },
      error: () => {
        this.toastr.error('Failed to update review');
        this.isUpdatingReview.set(false);
      }
    });
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      const pId = this.productId;
      this.productsService.deleteReview(reviewId).subscribe({
        next: () => {
          this.toastr.success('Review deleted');
          if (pId) this.fetchReviews(pId);
        },
        error: () => this.toastr.error('Failed to delete review')
      });
    }
  }

  setEditRating(rating: number): void {
    this.editReviewRating.set(rating);
  }
}
