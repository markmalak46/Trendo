import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesService } from '../../core/services/categories.service';
import { SubcategoriesService } from '../../core/services/subcategories.service';
import { Category } from '../../core/models/category.interface';
import { Subcategory } from '../../core/models/sub-category.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly subcategoriesService = inject(SubcategoriesService);
  
  categoriesList = signal<Category[]>([]);
  subcategoriesList = signal<Subcategory[]>([]);
  selectedCategoryName = signal<string>('');
  isLoading = signal<boolean>(true);
  isSubLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.getCategoriesData();
  }

  getCategoriesData(): void {
    this.isLoading.set(true);
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.categoriesList.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isLoading.set(false);
      },
    });
  }

  getSubcategories(categoryId: string, categoryName: string): void {
    this.selectedCategoryName.set(categoryName);
    this.isSubLoading.set(true);
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
  }
}
