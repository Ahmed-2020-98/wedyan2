import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand, Category, Order, Paginated, Product } from './models';

export const API_BASE = 'http://localhost:8000/api';
export const STORAGE_BASE = 'http://localhost:8000/storage';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private url(path: string): string {
    return `${API_BASE}${path}`;
  }

  config(): Observable<{ stripe_enabled: boolean; currency: string }> {
    return this.http.get<{ stripe_enabled: boolean; currency: string }>(this.url('/config'));
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url('/categories'));
  }

  brands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.url('/brands'));
  }

  products(params: Record<string, string | number | undefined>): Observable<Paginated<Product>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '' && value !== null) {
        httpParams = httpParams.set(key, value);
      }
    }

    return this.http.get<Paginated<Product>>(this.url('/products'), { params: httpParams });
  }

  product(slug: string): Observable<{ product: Product; related: Product[] }> {
    return this.http.get<{ product: Product; related: Product[] }>(this.url(`/products/${slug}`));
  }

  validateCoupon(code: string, subtotal: number): Observable<{ code: string; discount: number }> {
    return this.http.post<{ code: string; discount: number }>(this.url('/checkout/coupon'), {
      code,
      subtotal,
    });
  }

  placeOrder(payload: object): Observable<{ order_id: number; checkout_url: string | null }> {
    return this.http.post<{ order_id: number; checkout_url: string | null }>(
      this.url('/checkout/order'),
      payload
    );
  }

  myOrders(): Observable<Paginated<Order>> {
    return this.http.get<Paginated<Order>>(this.url('/orders'));
  }
}

export function imageUrl(product: Product): string {
  const primary = product.images?.find((i) => i.is_primary) ?? product.images?.[0];

  return primary ? `${STORAGE_BASE}/${primary.path.replace(/^\/+/, '')}` : '';
}
