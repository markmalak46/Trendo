export interface OrderProduct {
  subcategory: { _id: string; name: string; slug: string; category: string }[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  slug: string;
  imageCover: string;
  category: { _id: string; name: string; slug: string; image: string };
  brand: { _id: string; name: string; slug: string; image: string };
  ratingsAverage: number;
  id: string;
}

export interface OrderCartItem {
  count: number;
  _id: string;
  product: OrderProduct;
  price: number;
}

export interface Order {
  shippingAddress: { details: string; phone: string; city: string };
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'card';
  isPaid: boolean;
  isDelivered: boolean;
  _id: string;
  user: { _id: string; name: string; email: string; phone: string };
  cartItems: OrderCartItem[];
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  id: number;
}
