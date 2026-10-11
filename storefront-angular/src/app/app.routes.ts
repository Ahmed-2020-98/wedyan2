import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage) },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'order-success',
    loadComponent: () =>
      import('./pages/order-success/order-success.page').then((m) => m.OrderSuccessPage),
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./pages/my-orders/my-orders.page').then((m) => m.MyOrdersPage),
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage) },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  { path: '**', redirectTo: '' },
];
