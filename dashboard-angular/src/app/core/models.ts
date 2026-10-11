export interface Category {
  id: number;
  name_ar: string;
  slug: string;
  is_active: boolean;
  products_count?: number;
}

export interface Brand {
  id: number;
  name_ar: string;
  slug: string;
  is_active: boolean;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  path: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id: number | null;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  category?: { id: number; name_ar: string };
  brand?: { id: number; name_ar: string } | null;
  images: ProductImage[];
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_total: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
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
  customer_phone: string;
  customer_email: string | null;
  city: string;
  address: string;
  payment_method: string;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
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

export interface Stats {
  sales_total: number;
  orders_count: number;
  products_count: number;
  customers_count: number;
  sales_by_day: { day: string; total: string }[];
  orders_by_status: Record<string, number>;
  top_products: { name: string; sold: number; revenue: string }[];
  recent_orders: Order[];
}
