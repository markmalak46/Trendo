import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'Home',
    },
    {
        path: 'shop',
        loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent),
        title: 'Shop',
    },
    {
        path: 'categories',
        loadComponent: () =>
            import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
        title: 'Categories',
    },
    {
        path: 'brands',
        loadComponent: () =>
            import('./features/brands/brands.component').then((m) => m.BrandsComponent),
        title: 'Brands',
    },
    {
        path: 'wishlist',
        loadComponent: () =>
            import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent),
        title: 'Wishlist',
        canActivate:[authGuard]
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
        title: 'Cart',
        canActivate:[authGuard]
    },
    {
        path: 'details/:id/:slug',
        loadComponent: () =>
            import('./features/details/details.component').then((m) => m.DetailsComponent),
        title: 'Details',
    },
    {
        path: 'checkout/:id',
        loadComponent: () =>
            import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
        title: 'Checkout',
        canActivate:[authGuard]
    },
    {
        path: 'allorders',
        loadComponent: () =>
            import('./features/orders/orders.component').then((m) => m.OrdersComponent),
        title: 'Orders',
        canActivate:[authGuard]
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./features/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'My Profile',
        canActivate:[authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
        title: 'Login',
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./features/register/register.component').then((m) => m.RegisterComponent),
        title: 'Register',
    },
    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./features/forgot/forgot.component').then((m) => m.ForgotComponent),
        title: 'Forgot Password',
    },
    {
        path: 'support',
        loadComponent: () => import('./features/support/support.component').then((m) => m.SupportComponent),
        title: 'Support',
    },
    {
        path: '**',
        loadComponent: () =>
            import('./features/notfound/notfound.component').then((m) => m.NotfoundComponent),
        title: 'Not Found',
    },
];
