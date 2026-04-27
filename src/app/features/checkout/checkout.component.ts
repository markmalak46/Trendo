import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrdersService } from '../../core/services/orders.service';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly ordersService = inject(OrdersService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  cartId = signal<string>('');
  isLoading = signal<boolean>(false);
  isCartLoading = signal<boolean>(true);
  paymentMethod = signal<'cash' | 'card'>('cash');
  cartTotal = signal<number>(0);
  cartItemsCount = signal<number>(0);
  cartItems = signal<any[]>([]);

  checkoutForm: FormGroup = this.formBuilder.group({
    details: ['', [Validators.required, Validators.minLength(10)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.getCartId();
    this.loadCartData();
  }

  getCartId(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (id) this.cartId.set(id);
      }
    });
  }

  loadCartData(): void {
    this.isCartLoading.set(true);
    this.cartService.getLoggedUserCart().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.cartTotal.set(res.data.totalCartPrice);
          this.cartItemsCount.set(res.numOfCartItems);
          this.cartItems.set(res.data.products || []);
        }
        this.isCartLoading.set(false);
      },
      error: () => {
        this.isCartLoading.set(false);
      }
    });
  }

  setPaymentMethod(method: 'cash' | 'card'): void {
    this.paymentMethod.set(method);
  }

  submitOrder(): void {
    if (this.checkoutForm.valid) {
      this.isLoading.set(true);
      const cartId = this.cartId();
      const shippingAddress = this.checkoutForm.value;

      if (this.paymentMethod() === 'cash') {
        // POST /api/v1/orders/:cartId  — body: { shippingAddress }
        this.ordersService.checkoutCash(cartId, shippingAddress).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.status === 'success') {
              // Clear cart and reset badge after successful order
              this.cartService.clearCart().subscribe();
              this.cartService.cartBadgeNumber.set(0);
              localStorage.removeItem('TrendoCart');

              this.toastr.success('Order placed successfully!', 'Success');
              setTimeout(() => {
                this.router.navigate(['/allorders']);
              }, 1500);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.toastr.error(err.error?.message || 'Failed to place order.', 'Error');
          }
        });
      } else {
        // POST /api/v1/orders/checkout-session/:cartId?url=<origin>  — body: { shippingAddress }
        this.ordersService.checkoutOnline(cartId, shippingAddress).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.status === 'success') {
              // Redirect to Stripe checkout
              window.location.href = res.session.url;
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.toastr.error(err.error?.message || 'Failed to initiate payment.', 'Error');
          }
        });
      }
    } else {
      this.checkoutForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly.', 'Validation');
    }
  }
}
