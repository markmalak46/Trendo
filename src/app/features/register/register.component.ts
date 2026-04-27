import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading: boolean = false;
  errMsg: string = "";
  successMsg: string = "";
  isPasswordVisible: boolean = false;
  isRePasswordVisible: boolean = false;

  registerForm: FormGroup = this.formBuilder.group({
    name: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    rePassword: ["", Validators.required],
    phone: ["", [Validators.required, Validators.pattern(/^01[125][0-9]{8}$/)]],
  }, { validators: this.passwordMatch });

  passwordMatch(group: AbstractControl) {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    if (password !== rePassword && rePassword !== "") {
      group.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errMsg = "";
      this.successMsg = "";

      this.authService.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === 'success') {
            this.successMsg = 'Account Created Successfully!';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          } else {
            this.errMsg = res.message || 'An error occurred during registration';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMsg = err?.error?.message || 'An error occurred during registration';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleRePasswordVisibility(): void {
    this.isRePasswordVisible = !this.isRePasswordVisible;
  }
}
