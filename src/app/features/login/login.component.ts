import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../core/auth/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = false;
  errMsg: string = "";
  successMsg: string = "";
  isPasswordVisible: boolean = false;

  loginForm: FormGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
  });

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errMsg = "";
      this.successMsg = "";

      this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === 'success') {
            this.successMsg = 'Login Successful!';
            localStorage.setItem('TrendoToken', res.token);

            const userToStore = {
              name: res.user?.name || '',
              email: res.user?.email || this.loginForm.value.email,
              role: res.user?.role || 'user',
              phone: res.user?.phone || ''
            };
            
            localStorage.setItem('TrendoUser', JSON.stringify(userToStore));
            this.authService.isLogged.set(true);
            this.authService.loadUserFromToken();

            // Fetch cart count immediately so navbar badge updates without a refresh
            this.cartService.getLoggedUserCart().subscribe({
              next: (cartRes) => {
                if (cartRes.status === 'success') {
                  this.cartService.cartBadgeNumber.set(cartRes.numOfCartItems);
                }
              },
              error: () => {
                // Empty cart or not found — badge stays at 0
                this.cartService.cartBadgeNumber.set(0);
              }
            });

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          } else {
            this.errMsg = res.message || 'Incorrect email or password';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMsg = err?.error?.message || 'Incorrect email or password';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
