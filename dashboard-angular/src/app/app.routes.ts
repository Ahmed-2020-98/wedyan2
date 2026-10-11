import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.page').then((m) => m.CategoriesPage),
      },
      {
        path: 'brands',
        loadComponent: () => import('./pages/brands/brands.page').then((m) => m.BrandsPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/coupons.page').then((m) => m.CouponsPage),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./pages/customers/customers.page').then((m) => m.CustomersPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
