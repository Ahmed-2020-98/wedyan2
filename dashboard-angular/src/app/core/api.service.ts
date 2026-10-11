import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Brand,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  Stats,
} from './models';
import { Paginated } from './paginated';

export const API_BASE = 'http://localhost:8000/api';
export const STORAGE_BASE = 'http://localhost:8000/storage';

export function imageUrl(path: string): string {
  return `${STORAGE_BASE}/${path.replace(/^\/+/, '')}`;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);

  private url(path: string): string {
    return `${API_BASE}/admin${path}`;
  }

  stats(): Observable<Stats> {
    return this.http.get<Stats>(this.url('/stats'));
  }

  // Categories
  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url('/categories'));
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.url('/categories'), data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(this.url(`/categories/${id}`), data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/categories/${id}`));
  }

  // Brands
  brands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.url('/brands'));
  }

  createBrand(data: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.url('/brands'), data);
  }

  updateBrand(id: number, data: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(this.url(`/brands/${id}`), data);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/brands/${id}`));
  }

  // Products
  products(params: Record<string, string | number | undefined>): Observable<Paginated<Product>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '' && value !== null) {
        httpParams = httpParams.set(key, value);
      }
    }

    return this.http.get<Paginated<Product>>(this.url('/products'), { params: httpParams });
  }

  createProduct(data: Record<string, unknown>): Observable<Product> {
    return this.http.post<Product>(this.url('/products'), data);
  }

  updateProduct(id: number, data: Record<string, unknown>): Observable<Product> {
    return this.http.put<Product>(this.url(`/products/${id}`), data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/products/${id}`));
  }

  uploadImage(file: File): Observable<{ path: string; url: string }> {
    const form = new FormData();
    form.append('image', file);

    return this.http.post<{ path: string; url: string }>(this.url('/upload-image'), form);
  }

  // Coupons
  coupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.url('/coupons'));
  }

  createCoupon(data: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(this.url('/coupons'), data);
  }

  updateCoupon(id: number, data: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(this.url(`/coupons/${id}`), data);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/coupons/${id}`));
  }

  // Orders & customers
  orders(status?: string): Observable<Paginated<Order>> {
    const params = status ? new HttpParams().set('status', status) : undefined;

    return this.http.get<Paginated<Order>>(this.url('/orders'), { params });
  }

  order(id: number): Observable<Order> {
    return this.http.get<Order>(this.url(`/orders/${id}`));
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(this.url(`/orders/${id}/status`), { status });
  }

  customers(search?: string): Observable<Paginated<{ id: number; name: string; email: string; orders_count: number; created_at: string }>> {
    const params = search ? new HttpParams().set('search', search) : undefined;

    return this.http.get<Paginated<{ id: number; name: string; email: string; orders_count: number; created_at: string }>>(
      this.url('/customers'),
      { params }
    );
  }
}
