import { Component, OnInit, inject, signal } from '@angular/core';
import { CategoriesService } from '../../../../core/services/categories.service';
import { RouterLink } from '@angular/router';
import { Category } from '../../../../core/models/category.interface';

@Component({
  selector: 'app-category-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-home.component.html',
  styleUrl: './category-home.component.css',
})
export class CategoryHomeComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);

  categoryList = signal<Category[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.getCategoriesData();
  }

  getCategoriesData(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.categoryList.set(res.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading.set(false);
      }
    });
  }
}
