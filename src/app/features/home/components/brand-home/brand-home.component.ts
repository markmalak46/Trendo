import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandsService } from '../../../../core/services/brands.service';
import { IBrand } from '../../../../core/models/brand.interface';

@Component({
  selector: 'app-brand-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './brand-home.component.html',
  styleUrl: './brand-home.component.css',
})
export class BrandHomeComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);

  brandList = signal<IBrand[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.getBrandsData();
  }

  getBrandsData(): void {
    this.brandsService.getAllBrands().subscribe({
      next: (res) => {
        this.brandList.set(res.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching brands:', error);
        this.isLoading.set(false);
      }
    });
  }
}
