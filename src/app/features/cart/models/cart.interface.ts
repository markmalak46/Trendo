export interface Cart {
  _id: string;
  cartOwner: string;
  products: ProductElement[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalCartPrice: number;
}

interface ProductElement {
  count: number;
  _id: string;
  product: Product;
  price: number;
}

interface Product {
  subcategory: Brand[];
  _id: string;
  title: string;
  slug: string;
  quantity: number;
  imageCover: string;
  category: Category;
  brand: Category;
  ratingsAverage: number;
  id: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

interface Brand {
  _id: string;
  name: string;
  slug: string;
  category: string;
}