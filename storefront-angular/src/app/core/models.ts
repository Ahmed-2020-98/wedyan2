export interface Category {
  id: number;
  name_ar: string;
  slug: string;
  products_count?: number;
}

export interface Brand {
  id: number;
  name_ar: string;
  slug: string;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  path: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  category?: Pick<Category, 'id' | 'name_ar' | 'slug'>;
  brand?: Pick<Brand, 'id' | 'name_ar' | 'slug'> | null;
  images: ProductImage[];
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface CartItem {
  product_id: number;
  name_ar: string;
  slug: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface OrderItem {
  id: number;
  product_name_ar: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  customer_name: string;
  city: string;
  address: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  paid: 'مدفوع',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};
