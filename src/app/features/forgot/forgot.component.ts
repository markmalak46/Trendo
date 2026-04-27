import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-forgot',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css'
})
export class ForgotComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  step= signal<number>(1);
  isLoading: boolean = false;
  errMsg: string = "";
  successMsg: string = "";
  isPasswordVisible: boolean = false;

  emailForm: FormGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]]
  });

  codeForm: FormGroup = this.formBuilder.group({
    resetCode: ["", [Validators.required]]
  });

  passwordForm: FormGroup = this.formBuilder.group({
    newPassword: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]]
  });

  submitEmail(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.errMsg = "";
      this.successMsg = "";

      this.authService.forgotPassword(this.emailForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.statusMsg === 'success' || res?.message === 'success' || res?.status === 'Success' || res?.message === 'Reset code sent to your email') {
            this.successMsg = res?.message || 'Reset code sent to your email';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.successMsg = "";
              this.step.set(2);
              this.cdr.detectChanges();
            }, 1000);
          } else {
            this.errMsg = res?.message || 'Error sending code';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMsg = err?.error?.message || 'Error sending code (please check your email or try again)';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  submitCode(): void {
    if (this.codeForm.valid) {
      this.isLoading = true;
      this.errMsg = "";
      this.successMsg = "";

      this.authService.verifyResetCode(this.codeForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.status === 'Success' || res?.status === 'success' || res?.statusMsg === 'success') {
            this.successMsg = 'Code Verified Successfully!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.successMsg = "";
              this.step.set(3);
              this.cdr.detectChanges();
            }, 1000);
          } else {
            this.errMsg = res?.message || 'Invalid Reset Code';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMsg = err?.error?.message || 'Invalid Reset Code';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.codeForm.markAllAsTouched();
    }
  }

  submitNewPassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errMsg = "";
      this.successMsg = "";

      const payload = {
        email: this.emailForm.get('email')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };

      this.authService.resetPassword(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.token) {
            this.successMsg = 'Password Reset Successfully!';
            localStorage.setItem('TrendoToken', res.token);
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
          } else {
            this.errMsg = res?.message || 'Error resetting password';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMsg = err?.error?.message || 'Error resetting password';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
