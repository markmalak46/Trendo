import { Component, ElementRef, inject, Input, OnChanges, SimpleChanges, signal, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../core/models/product.interface';

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

  relatedProducts = signal<Product[]>([]);
  isRelatedLoading = signal<boolean>(true);

  @ViewChild('relatedScroll') relatedScroll!: ElementRef<HTMLDivElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] || changes['currentProductId']) {
      if (this.categoryId) {
        this.isRelatedLoading.set(true);
        this.productsService.getProductsByCategory(this.categoryId, 8).subscribe({
          next: (relRes) => {
            console.log('Related API response:', relRes);
            const filtered = (relRes.data || [])
              .filter((p: Product) => p._id !== this.currentProductId)
              .sort((a: Product, b: Product) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
            console.log('Filtered related products:', filtered);
            this.relatedProducts.set(filtered.slice(0, 6));
            this.isRelatedLoading.set(false);
          },
          error: () => this.isRelatedLoading.set(false)
        });
      }
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
