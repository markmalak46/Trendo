import { Component, inject, signal, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { AddressesService } from '../../core/services/addresses.service';
import { Address } from '../../core/models/address.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgClass],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly addressesService = inject(AddressesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);

  userName = signal<string>('');
  userEmail = signal<string>('');
  userPhone = signal<string>('');
  userRole = signal<string>('');
  memberSince = signal<string>('');

  addresses = signal<Address[]>([]);
  isLoadingAddresses = signal<boolean>(true);
  
  isAddAddressModalOpen = signal<boolean>(false);
  isSubmittingAddress = signal<boolean>(false);
  addressErrorMessage = signal<string>('');
  addressSuccessMessage = signal<string>('');
  removeAddressMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  isConfirmDeleteOpen = signal<boolean>(false);
  addressToDelete = signal<string | null>(null);
  isDeletingAddress = signal<boolean>(false);
  deleteSuccessMessage = signal<string>('');

  addressForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    details: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required, Validators.minLength(3)]]
  });

  isChangePasswordModalOpen = signal<boolean>(false);
  isSubmittingPassword = signal<boolean>(false);
  passwordSuccessMessage = signal<string>('');
  passwordErrorMessage = signal<string>('');

  showCurrentPassword = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showRePassword = signal<boolean>(false);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isUpdateProfileModalOpen = signal<boolean>(false);
  isSubmittingProfile = signal<boolean>(false);
  profileSuccessMessage = signal<string>('');
  profileErrorMessage = signal<string>('');

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]]
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Try to decode the JWT for name, role, and member-since
      const token = localStorage.getItem('TrendoToken');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded.name) this.userName.set(decoded.name);
          if (decoded.role) this.userRole.set(decoded.role);
          if (decoded.iat) {
            const date = new Date(decoded.iat * 1000);
            this.memberSince.set(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
          }
        } catch (e) {}
      }

      // 2. Always read TrendoUser from localStorage for email & phone
      const storedUser = localStorage.getItem('TrendoUser');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (!this.userName() && u.name) this.userName.set(u.name);
          if (u.email) this.userEmail.set(u.email);
          if (u.phone) this.userPhone.set(u.phone);
          if (!this.userRole() && u.role) this.userRole.set(u.role);
        } catch (e) {}
      }

      if (!this.userName()) this.userName.set('Member');
    }
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.addressesService.getLoggedUserAddresses().subscribe({
        next: (res) => {
          this.addresses.set(res.data);
          this.isLoadingAddresses.set(false);
        },
        error: (err) => {
          console.error('Failed to load addresses', err);
          this.isLoadingAddresses.set(false);
        }
      });
    }
  }

  openConfirmDelete(addressId: string): void {
    this.addressToDelete.set(addressId);
    this.isConfirmDeleteOpen.set(true);
    this.deleteSuccessMessage.set('');
  }

  closeConfirmDelete(): void {
    this.isConfirmDeleteOpen.set(false);
    this.addressToDelete.set(null);
    this.isDeletingAddress.set(false);
    this.deleteSuccessMessage.set('');
  }

  confirmRemoveAddress(): void {
    const id = this.addressToDelete();
    if (!id) return;

    this.isDeletingAddress.set(true);
    this.addressesService.removeAddress(id).subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.isDeletingAddress.set(false);
        this.deleteSuccessMessage.set('Address removed successfully.');
        setTimeout(() => this.closeConfirmDelete(), 2500);
      },
      error: (err) => {
        console.error('Failed to remove address', err);
        this.isDeletingAddress.set(false);
        this.closeConfirmDelete();
        this.removeAddressMessage.set({text: 'Failed to remove address', type: 'error'});
        setTimeout(() => this.removeAddressMessage.set(null), 3000);
      }
    });
  }

  openAddAddressModal(): void {
    this.isAddAddressModalOpen.set(true);
    this.addressForm.reset();
    this.addressErrorMessage.set('');
    this.addressSuccessMessage.set('');
  }

  closeAddAddressModal(): void {
    this.isAddAddressModalOpen.set(false);
    this.addressForm.reset();
    this.addressErrorMessage.set('');
    this.addressSuccessMessage.set('');
  }

  onSubmitAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.addressErrorMessage.set('');
    const formValue = this.addressForm.value;
    const existingAddresses = this.addresses();

    const isNameExists = existingAddresses.some(a => a.name.toLowerCase().trim() === formValue.name.toLowerCase().trim());
    if (isNameExists) {
      this.addressErrorMessage.set(`An address with the name "${formValue.name}" already exists.`);
      return;
    }

    // Check if exact same details & city exist
    const isDuplicate = existingAddresses.some(a => 
      a.details.toLowerCase().trim() === formValue.details.toLowerCase().trim() && 
      a.city.toLowerCase().trim() === formValue.city.toLowerCase().trim()
    );
    if (isDuplicate) {
      this.addressErrorMessage.set(`An identical address already exists in ${formValue.city}.`);
      return;
    }

    this.isSubmittingAddress.set(true);

    this.addressesService.addAddress(formValue).subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.addressSuccessMessage.set(res.message || 'Address added successfully');
        this.isSubmittingAddress.set(false);
        this.addressForm.reset();
        
        setTimeout(() => {
          this.closeAddAddressModal();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to add address', err);
        this.addressErrorMessage.set(err.error?.message || 'Failed to add address');
        this.isSubmittingAddress.set(false);
      }
    });
  }

  openChangePasswordModal(): void {
    this.isChangePasswordModalOpen.set(true);
    this.passwordForm.reset();
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
    this.showCurrentPassword.set(false);
    this.showPassword.set(false);
    this.showRePassword.set(false);
  }

  closeChangePasswordModal(): void {
    this.isChangePasswordModalOpen.set(false);
    this.passwordForm.reset();
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.value.password !== this.passwordForm.value.rePassword) {
      this.passwordForm.get('rePassword')?.setErrors({ mismatch: true });
      return;
    }

    this.isSubmittingPassword.set(true);
    this.passwordErrorMessage.set('');
    const formValue = this.passwordForm.value;

    this.authService.changeUserPassword(formValue).subscribe({
      next: (res) => {
        // Save the new token
        if (isPlatformBrowser(this.platformId) && res.token) {
          localStorage.setItem('TrendoToken', res.token);
        }

        // Show inline success message
        this.passwordSuccessMessage.set('Your password has been successfully updated.');
        this.isSubmittingPassword.set(false);
        this.passwordForm.reset();

        // Auto close after 3 seconds
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to update password', err);
        this.passwordErrorMessage.set(err.error?.message || 'Incorrect current password. Please try again.');
        this.isSubmittingPassword.set(false);
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 're'): void {
    if (field === 'current') {
      this.showCurrentPassword.set(!this.showCurrentPassword());
    } else if (field === 'new') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 're') {
      this.showRePassword.set(!this.showRePassword());
    }
  }

  openUpdateProfileModal(): void {
    this.isUpdateProfileModalOpen.set(true);
    this.profileForm.patchValue({
      name: this.userName(),
      email: this.userEmail(),
      phone: this.userPhone()
    });
    this.profileSuccessMessage.set('');
    this.profileErrorMessage.set('');
  }

  closeUpdateProfileModal(): void {
    this.isUpdateProfileModalOpen.set(false);
    this.profileForm.reset();
    this.profileSuccessMessage.set('');
    this.profileErrorMessage.set('');
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmittingProfile.set(true);
    this.profileErrorMessage.set('');
    const formValue = this.profileForm.value;

    this.authService.updateUserData(formValue).subscribe({
      next: (res) => {
        // Update signals
        if (res.user) {
          this.userName.set(res.user.name || formValue.name);
          this.userEmail.set(res.user.email || formValue.email);
        } else {
          this.userName.set(formValue.name);
          this.userEmail.set(formValue.email);
        }
        this.userPhone.set(formValue.phone);

        // Update localStorage
        if (isPlatformBrowser(this.platformId)) {
          const storedUser = localStorage.getItem('TrendoUser');
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              u.name = this.userName();
              u.email = this.userEmail();
              u.phone = this.userPhone();
              localStorage.setItem('TrendoUser', JSON.stringify(u));
            } catch (e) {}
          } else {
            const u = {
              name: this.userName(),
              email: this.userEmail(),
              phone: this.userPhone(),
              role: this.userRole()
            };
            localStorage.setItem('TrendoUser', JSON.stringify(u));
          }
        }

        this.profileSuccessMessage.set('Profile updated successfully!');
        this.isSubmittingProfile.set(false);

        setTimeout(() => {
          this.closeUpdateProfileModal();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSubmittingProfile.set(false);
        if (err.error?.errors) {
          this.profileErrorMessage.set(err.error.errors.msg || 'Failed to update profile.');
        } else {
          this.profileErrorMessage.set(err.error?.message || 'Failed to update profile.');
        }
      }
    });
  }

  get initials(): string {
    const parts = this.userName().split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  }
}
