import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { FlowbiteService } from '../../core/services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../core/auth/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  isLogged = computed(() => this.authService.isLogged());
  cartBadgeNumber = computed(() => this.cartService.cartBadgeNumber());
  wishlistCount = computed(() => this.wishlistService.wishlistCount());
  userName = computed(() => this.authService.userName());

  isSignOutModalOpen = false;

  constructor(private flowbiteService: FlowbiteService) {}

  ngOnInit(): void {
    if (localStorage.getItem('TrendoToken')) {
      this.authService.isLogged.set(true);
      this.authService.loadUserFromToken();
      this.cartService.getLoggedUserCart().subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.cartService.cartBadgeNumber.set(res.numOfCartItems);
          }
        },
        error: () => {
          this.cartService.cartBadgeNumber.set(0);
        }
      });
      this.wishlistService.getUserWishlist().subscribe();
    }

    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }

  openSignOutModal(): void {
    this.isSignOutModalOpen = true;
  }

  closeSignOutModal(): void {
    this.isSignOutModalOpen = false;
  }

  confirmSignOut(): void {
    this.isSignOutModalOpen = false;
    this.cartService.cartBadgeNumber.set(0);
    this.wishlistService.wishlistIds.set(new Set());
    this.authService.signOut();
  }
}
