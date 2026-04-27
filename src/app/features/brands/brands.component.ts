import { Component, inject, OnInit, signal } from '@angular/core';
import { BrandsService } from '../../core/services/brands.service';
import { IBrand } from '../../core/models/brand.interface';

@Component({
  selector: 'app-brands',
  imports: [],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);
  
  // Using signals for reactive data handling
  brandsList = signal<IBrand[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.getBrandsData();
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
}
